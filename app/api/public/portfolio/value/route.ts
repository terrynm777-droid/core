import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";
import { getLiveQuotes } from "@/lib/prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = {
  symbol: string | null;
  amount: number | string | null; // SHARES
  currency: string | null;        // trading currency for symbol
};

type Holding = {
  symbol: string;
  shares: number;
  currency: string;
};

type Quote = {
  c: number;  // current
  pc: number; // previous close
};

function safeNum(x: unknown, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

function safeStr(x: unknown, fallback = "") {
  const s = String(x ?? "").trim();
  return s ? s : fallback;
}

// returns USD per 1 unit of currency
function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = currency.toUpperCase();
  if (c === "USD") return 1;
  // heuristic: if looks like JPY-per-USD, invert
  if (raw > 5) return 1 / raw;
  return raw;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

  const supabase = await createClient();

  const { data: profile, error: perr } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!profile?.id) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: portfolio, error: poerr } = await supabase
    .from("portfolios")
    .select("id, is_public")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (poerr) return NextResponse.json({ error: poerr.message }, { status: 500 });
  if (!portfolio?.id || !portfolio.is_public) {
    return NextResponse.json({ error: "Portfolio not public" }, { status: 403 });
  }

  const { data: rows, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id)
    .returns<HoldingRow[]>();

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const hs: Holding[] = (rows ?? [])
    .map((r: HoldingRow): Holding => ({
      symbol: safeStr(r.symbol).toUpperCase(),
      shares: safeNum(r.amount, 0),
      currency: safeStr(r.currency, "USD").toUpperCase(),
    }))
    .filter((h: Holding) => Boolean(h.symbol) && Number.isFinite(h.shares) && h.shares > 0);

  if (!hs.length) {
    return NextResponse.json({ totalUsd: 0, dayChangeAmount: 0, dayChangePct: 0, positions: [] });
  }

  const symbols = Array.from(new Set(hs.map((h: Holding) => h.symbol)));
  const currencies = Array.from(new Set(hs.map((h: Holding) => h.currency)));

  const [quotesRaw, fxRaw] = await Promise.all([getLiveQuotes(symbols), getUsdBaseRates(currencies)]);
  const fxRates: Record<string, number> = (fxRaw as any)?.rates ?? {};

  // normalize quotes -> {symbol: {c, pc}}
  const quotes: Record<string, Quote> = {};
  for (const sym of symbols) {
    const q: any = (quotesRaw as any)?.[sym];
    quotes[sym] = { c: safeNum(q?.c, 0), pc: safeNum(q?.pc, 0) };
  }

  const positions = hs.map((h) => {
    const q = quotes[h.symbol] ?? { c: 0, pc: 0 };

    const rawFx = safeNum(fxRates[h.currency], h.currency === "USD" ? 1 : 0);
    const usdPerUnit = toUsdPerUnit(h.currency, rawFx);

    const prevUsd = q.pc > 0 ? h.shares * q.pc * usdPerUnit : 0;
    const nowUsd = q.c > 0 ? h.shares * q.c * usdPerUnit : 0;

    return {
      symbol: h.symbol,
      currency: h.currency,
      shares: h.shares,
      prevClose: q.pc,
      current: q.c,
      prevUsd,
      nowUsd,
      dayChangeUsd: nowUsd - prevUsd,
    };
  });

  const prevTotal = positions.reduce((a, p) => a + safeNum(p.prevUsd, 0), 0);
  const nowTotal = positions.reduce((a, p) => a + safeNum(p.nowUsd, 0), 0);

  const diff = nowTotal - prevTotal;
  const pct = prevTotal > 0 ? (diff / prevTotal) * 100 : 0;

  return NextResponse.json({
    totalUsd: nowTotal,
    dayChangeAmount: diff,
    dayChangePct: pct,
    positions,
  });
}