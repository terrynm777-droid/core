// app/api/portfolio/value/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = {
  symbol: string | null;
  amount: number | string | null; // shares
  currency: string | null;
};

type Holding = {
  symbol: string;
  shares: number;
  currency: string;
};

type Snap = { total_usd: number | null };

function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = currency.toUpperCase();
  if (c === "USD") return 1;
  // heuristic: if quote looks like "JPY per USD" invert it
  if (raw > 5) return 1 / raw;
  return raw;
}

async function getLiveQuotes(symbols: string[]) {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY");

  const out: Record<string, number> = {};

  await Promise.all(
    symbols.map(async (sym: string) => {
      const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(sym)}&token=${encodeURIComponent(key)}`;
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) {
          out[sym] = 0;
          return;
        }
        const j: any = await res.json().catch(() => null);
        const price = Number(j?.c ?? 0); // current price
        out[sym] = Number.isFinite(price) ? price : 0;
      } catch {
        out[sym] = 0;
      }
    })
  );

  return out;
}

export async function GET() {
  const supabase = await createClient();

  const { data: auth, error: uerr } = await supabase.auth.getUser();
  const user = auth?.user;

  if (uerr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // portfolio id
  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!portfolio?.id) return NextResponse.json({ error: "Portfolio missing" }, { status: 500 });

  // holdings
  const { data: rows, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id)
    .returns<HoldingRow[]>();

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const hs: Holding[] = (rows ?? [])
    .map((r: HoldingRow) => ({
      symbol: String(r.symbol ?? "").toUpperCase().trim(),
      shares: Number(r.amount ?? 0),
      currency: String(r.currency ?? "USD").toUpperCase().trim(),
    }))
    .filter((h: Holding) => h.symbol.length > 0 && Number.isFinite(h.shares) && h.shares > 0);

  if (hs.length === 0) {
    return NextResponse.json({ totalUsd: 0, dayChangeAmount: 0, dayChangePct: 0 });
  }

  const symbols = Array.from(new Set(hs.map((h: Holding) => h.symbol)));
  const currencies = Array.from(new Set(hs.map((h: Holding) => h.currency)));

  const [quotes, fxRaw] = await Promise.all([getLiveQuotes(symbols), getUsdBaseRates(currencies)]);
  const fxRates: Record<string, number> = (fxRaw as any)?.rates ?? {};

  // live total (USD)
  const totalUsd = hs.reduce((acc: number, h: Holding) => {
    const px = Number(quotes[h.symbol] ?? 0);
    if (!Number.isFinite(px) || px <= 0) return acc;

    const rawFx = Number(fxRates[h.currency] ?? (h.currency === "USD" ? 1 : 0));
    const usdPerUnit = toUsdPerUnit(h.currency, rawFx);
    if (!Number.isFinite(usdPerUnit) || usdPerUnit <= 0) return acc;

    return acc + h.shares * px * usdPerUnit;
  }, 0);

  // snapshots (cast table to any to avoid TS schema mismatch errors)
  const { data: snaps, error: serr } = await (supabase as any)
    .from("portfolio_snapshots" as any)
    .select("total_usd")
    .eq("user_id", user.id)
    .order("day", { ascending: false })
    .limit(2);

  if (serr) return NextResponse.json({ error: serr.message }, { status: 500 });

  const snapRows = (snaps ?? []) as Snap[];

  const prev = Number(snapRows?.[1]?.total_usd ?? snapRows?.[0]?.total_usd ?? totalUsd ?? 0);
  const diff = Number(totalUsd) - Number(prev);
  const pct = prev > 0 ? (diff / prev) * 100 : 0;

  return NextResponse.json({
    totalUsd,
    dayChangeAmount: diff,
    dayChangePct: pct,
  });
}