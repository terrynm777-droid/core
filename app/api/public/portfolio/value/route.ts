// app/api/public/portfolio/value/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";
import { getLiveQuotes } from "@/lib/prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = { symbol: string | null; amount: number | string | null; currency: string | null };
type Holding = { symbol: string; shares: number; currency: string };
type SnapRow = { total_usd: number | null };

function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = currency.toUpperCase();
  if (c === "USD") return 1;
  if (raw > 5) return 1 / raw;
  return raw;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!profile?.id) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id, is_public")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!portfolio?.id || !portfolio.is_public) {
    return NextResponse.json({ error: "Portfolio not public" }, { status: 403 });
  }

  const { data: rows } = await supabase
    .from("portfolio_holdings")
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id)
    .returns<HoldingRow[]>();

  const hs: Holding[] = (rows ?? [])
    .map((r): Holding => ({
      symbol: String(r.symbol ?? "").toUpperCase().trim(),
      shares: Number(r.amount ?? 0),
      currency: String(r.currency ?? "USD").toUpperCase().trim(),
    }))
    .filter((h) => h.symbol && Number.isFinite(h.shares) && h.shares > 0);

  if (hs.length === 0) {
    return NextResponse.json({ totalUsd: 0, dayChangeAmount: 0, dayChangePct: 0 });
  }

  const symbols: string[] = Array.from(new Set(hs.map((h: Holding) => h.symbol)));
  const currencies: string[] = Array.from(new Set(hs.map((h: Holding) => h.currency)));

  const [quotes, fxRaw] = await Promise.all([getLiveQuotes(symbols), getUsdBaseRates(currencies)]);
  const fxRates: Record<string, number> = (fxRaw as any)?.rates ?? {};

  const totalUsd = hs.reduce((acc, h) => {
    const px = Number(quotes[h.symbol] ?? 0);
    const rawFx = Number(fxRates[h.currency] ?? (h.currency === "USD" ? 1 : 0));
    const usdPerUnit = toUsdPerUnit(h.currency, rawFx);
    if (!Number.isFinite(px) || px <= 0) return acc;
    if (!Number.isFinite(usdPerUnit) || usdPerUnit <= 0) return acc;
    return acc + h.shares * px * usdPerUnit;
  }, 0);

  const { data: snaps } = await supabase
    .from("portfolio_snapshots")
    .select("total_usd")
    .eq("user_id", profile.id)
    .order("day", { ascending: false })
    .limit(1)
    .returns<SnapRow[]>();

  const prev = Number(snaps?.[0]?.total_usd ?? 0);
  const diff = totalUsd - prev;
  const pct = prev > 0 ? (diff / prev) * 100 : 0;

  return NextResponse.json({ totalUsd, dayChangeAmount: diff, dayChangePct: pct });
}