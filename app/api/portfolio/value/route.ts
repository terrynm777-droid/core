// app/api/portfolio/value/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";
import { getLiveQuotes } from "@/lib/prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = {
  symbol: string | null;
  amount: number | string | null; // shares
  currency: string | null;
};

type SnapRow = { total_usd: number | null };

type Holding = {
  symbol: string;
  shares: number;
  currency: string;
};

function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = currency.toUpperCase();
  if (c === "USD") return 1;
  if (raw > 5) return 1 / raw; // JPY-per-USD style
  return raw;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!portfolio?.id) return NextResponse.json({ error: "Portfolio missing" }, { status: 500 });

  const { data: rows, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id)
    .returns<HoldingRow[]>();

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const hs: Holding[] = (rows ?? [])
    .map((r): Holding => ({
      symbol: String(r.symbol ?? "").toUpperCase().trim(),
      shares: Number(r.amount ?? 0),
      currency: String(r.currency ?? "USD").toUpperCase().trim(),
    }))
    .filter((h) => h.symbol && Number.isFinite(h.shares) && h.shares > 0);

  if (hs.length === 0) {
    return NextResponse.json({
      totalUsd: 0,
      dayChangeAmount: 0,
      dayChangePct: 0,
      positions: [],
    });
  }

  const symbols: string[] = Array.from(new Set(hs.map((h: Holding) => h.symbol)));
  const currencies: string[] = Array.from(new Set(hs.map((h: Holding) => h.currency)));

  const [quotes, fxRaw] = await Promise.all([getLiveQuotes(symbols), getUsdBaseRates(currencies)]);
  const fxRates: Record<string, number> = (fxRaw as any)?.rates ?? {};

  const positions = hs.map((h) => {
    const px = Number(quotes[h.symbol] ?? 0);
    const rawFx = Number(fxRates[h.currency] ?? (h.currency === "USD" ? 1 : 0));
    const usdPerUnit = toUsdPerUnit(h.currency, rawFx);
    const usdValue =
      Number.isFinite(px) && px > 0 && Number.isFinite(usdPerUnit) && usdPerUnit > 0
        ? h.shares * px * usdPerUnit
        : 0;

    return {
      symbol: h.symbol,
      currency: h.currency,
      shares: h.shares,
      price: Number.isFinite(px) ? px : 0,
      usdValue,
    };
  });

  const totalUsd = positions.reduce((a, p) => a + (Number(p.usdValue) || 0), 0);

  // Use last snapshot as "prev close" reference
  const { data: snaps, error: serr } = await supabase
    .from("portfolio_snapshots")
    .select("total_usd")
    .eq("user_id", user.id)
    .order("day", { ascending: false })
    .limit(1)
    .returns<SnapRow[]>();

  if (serr) return NextResponse.json({ error: serr.message }, { status: 500 });

  const prev = Number(snaps?.[0]?.total_usd ?? 0);
  const diff = totalUsd - prev;
  const pct = prev > 0 ? (diff / prev) * 100 : 0;

  return NextResponse.json({
    totalUsd,
    dayChangeAmount: diff,
    dayChangePct: pct,
    positions,
  });
}