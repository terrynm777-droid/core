// app/api/portfolio/value/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";
import { getQuotes } from "@/lib/prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Snap = { total_usd: number | null };

function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = currency.toUpperCase();
  if (c === "USD") return 1;
  if (raw > 5) return 1 / raw; // if looks like JPY-per-USD etc
  return raw;
}

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // load holdings (amount = SHARES)
  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!portfolio?.id) return NextResponse.json({ error: "Portfolio missing" }, { status: 500 });

  const { data: holdings, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id);

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const hs = (holdings ?? [])
    .map((h: any) => ({
      symbol: String(h.symbol ?? "").toUpperCase(),
      shares: Number(h.amount ?? 0),
      currency: String(h.currency ?? "USD").toUpperCase(), // quote currency for that symbol
    }))
    .filter((h: any) => h.symbol && Number.isFinite(h.shares) && h.shares > 0);

  if (hs.length === 0) {
    return NextResponse.json({ totalUsd: 0, dayChangeAmount: 0, dayChangePct: 0 });
  }

  // fetch live quotes
  const symbols = hs.map((h) => h.symbol);
  const quotes = await getQuotes(symbols);

  // FX for all holding currencies
  const currencies = Array.from(new Set(hs.map((h) => h.currency)));
  const fx = await getUsdBaseRates(currencies);

  const rates = (fx as any)?.rates ?? {};
  const totalUsd = hs.reduce((acc, h) => {
    const q = quotes[h.symbol];
    const px = Number(q?.price ?? 0);
    if (!Number.isFinite(px) || px <= 0) return acc;

    const rawFx = Number(rates[h.currency] ?? (h.currency === "USD" ? 1 : 0));
    const usdPerUnit = toUsdPerUnit(h.currency, rawFx);
    if (usdPerUnit <= 0) return acc;

    // shares * price (in holding currency) * fx -> USD
    return acc + h.shares * px * usdPerUnit;
  }, 0);

  // prev close snapshot (yesterday)
  const { data: snaps, error: serr } = await supabase
    .from("portfolio_snapshots")
    .select("total_usd")
    .eq("user_id", user.id)
    .order("day", { ascending: false })
    .limit(2)
    .returns<Snap[]>();

  if (serr) return NextResponse.json({ error: serr.message }, { status: 500 });

  const prev = Number(snaps?.[1]?.total_usd ?? snaps?.[0]?.total_usd ?? totalUsd);
  const diff = totalUsd - prev;
  const pct = prev > 0 ? (diff / prev) * 100 : 0;

  return NextResponse.json({
    totalUsd,
    dayChangeAmount: diff,
    dayChangePct: pct,
  });
}