import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { finnhubQuote } from "@/lib/finnhub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = { symbol: string; amount: number; currency: string | null };

type FxQuote = {
  current: number; // last
  change: number;
  changePct: number;
  prevClose: number;
};

function normalizeCcy(c: string | null | undefined) {
  return String(c || "USD").trim().toUpperCase();
}

async function tryFxQuote(ticker: string): Promise<FxQuote | null> {
  try {
    const q: any = await finnhubQuote(ticker);
    const current = Number(q?.current ?? q?.c ?? 0);
    if (!isFinite(current) || current <= 0) return null;
    return {
      current,
      change: Number(q?.change ?? q?.d ?? 0),
      changePct: Number(q?.changePct ?? q?.dp ?? 0),
      prevClose: Number(q?.prevClose ?? q?.pc ?? 0),
    };
  } catch {
    return null;
  }
}

/**
 * Returns FX rate FROM -> USD.
 * Also returns fxChangePct so day performance includes FX move.
 *
 * Uses Finnhub quote on OANDA pairs:
 * - Prefer direct: OANDA:${FROM}USD
 * - Else inverse: OANDA:USD${FROM} and invert.
 */
async function fxToUsd(from: string, cache: Map<string, { rate: number; fxChangePct: number; pair: string }>) {
  const f = normalizeCcy(from);
  if (f === "USD") return { rate: 1, fxChangePct: 0, pair: "USDUSD" };

  const cached = cache.get(f);
  if (cached) return cached;

  // direct: FROMUSD
  const directPair = `OANDA:${f}USD`;
  const direct = await tryFxQuote(directPair);
  if (direct) {
    const out = { rate: direct.current, fxChangePct: direct.changePct, pair: directPair };
    cache.set(f, out);
    return out;
  }

  // inverse: USDFROM => rate = 1 / current
  const invPair = `OANDA:USD${f}`;
  const inv = await tryFxQuote(invPair);
  if (inv) {
    const out = { rate: 1 / inv.current, fxChangePct: -inv.changePct, pair: invPair };
    cache.set(f, out);
    return out;
  }

  // fallback: no FX available
  const out = { rate: 0, fxChangePct: 0, pair: "" };
  cache.set(f, out);
  return out;
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: uerr,
  } = await supabase.auth.getUser();

  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id, name, is_public")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!portfolio?.id) {
    return NextResponse.json(
      { holdings: [], pie: [], total_usd: 0, day_change_usd: 0, day_change_pct: 0 },
      { status: 200 }
    );
  }

  const { data: holdings, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id);

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const hs = (holdings ?? [])
    .map((h: any) => ({
      symbol: String(h.symbol || "").toUpperCase(),
      amount: Number(h.amount ?? 0),
      currency: normalizeCcy(h.currency),
    }))
    .filter((h) => h.symbol && isFinite(h.amount) && h.amount > 0);

  if (hs.length === 0) {
    return NextResponse.json(
      { holdings: [], pie: [], total_usd: 0, day_change_usd: 0, day_change_pct: 0 },
      { status: 200 }
    );
  }

  // FX conversion cache
  const fxCache = new Map<string, { rate: number; fxChangePct: number; pair: string }>();

  // Fetch asset quotes (equities) in parallel
  const assetQuotes = await Promise.all(
    hs.map(async (h) => {
      try {
        const q: any = await finnhubQuote(h.symbol);
        return {
          symbol: h.symbol,
          ok: true,
          current: Number(q?.current ?? q?.c ?? 0),
          change: Number(q?.change ?? q?.d ?? 0),
          changePct: Number(q?.changePct ?? q?.dp ?? 0),
          prevClose: Number(q?.prevClose ?? q?.pc ?? 0),
        };
      } catch (e: any) {
        return {
          symbol: h.symbol,
          ok: false,
          current: 0,
          change: 0,
          changePct: 0,
          prevClose: 0,
          error: e?.message || "quote failed",
        };
      }
    })
  );

  // Build holdings with USD conversion
  const holdingsWithUsd = await Promise.all(
    hs.map(async (h) => {
      const fx = await fxToUsd(h.currency, fxCache);
      const usd_value = fx.rate > 0 ? h.amount * fx.rate : 0;

      const quote = assetQuotes.find((q) => q.symbol === h.symbol) ?? null;

      // approximate daily move including FX move (compound)
      const assetPct = Number(quote?.changePct ?? 0);
      const fxPct = Number(fx.fxChangePct ?? 0);
      const combinedPct = ((1 + assetPct / 100) * (1 + fxPct / 100) - 1) * 100;

      return {
        symbol: h.symbol,
        amount: h.amount,
        currency: h.currency,
        usd_value,
        fx_rate_to_usd: fx.rate,
        fx_pair_used: fx.pair,
        fx_change_pct: fxPct,
        quote,
        combined_change_pct: combinedPct,
      };
    })
  );

  const total_usd = holdingsWithUsd.reduce((acc, h) => acc + (Number(h.usd_value) || 0), 0);

  // Pie weights based on USD value
  const pie = holdingsWithUsd.map((h) => ({
    symbol: h.symbol,
    currency: h.currency,
    amount: h.amount,
    usd_value: h.usd_value,
    weight: total_usd > 0 ? h.usd_value / total_usd : 0,
    quote: h.quote,
  }));

  // Portfolio daily change = weighted avg of combined pct, applied to total_usd
  const day_change_pct = holdingsWithUsd.reduce((acc, h) => {
    const w = total_usd > 0 ? h.usd_value / total_usd : 0;
    return acc + w * (Number(h.combined_change_pct) || 0);
  }, 0);

  const day_change_usd = total_usd * (day_change_pct / 100);

  return NextResponse.json(
    {
      holdings: holdingsWithUsd,
      pie,
      total_usd,
      day_change_usd,
      day_change_pct,
    },
    { status: 200 }
  );
}