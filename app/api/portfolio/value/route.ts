// app/api/portfolio/value/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";
import { getLiveQuotes } from "@/lib/prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Snap = { day: string; total_usd: number | null };

function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = String(currency || "USD").toUpperCase();
  if (c === "USD") return 1;
  if (raw > 5) return 1 / raw;
  return raw;
}

function normCurrency(c: any) {
  return String(c || "USD").toUpperCase().trim();
}

async function computeLiveTotalUsd(supabase: any, userId: string) {
  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (perr) throw new Error(perr.message);
  if (!portfolio?.id) return 0;

  const { data: holdings, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id);

  if (herr) throw new Error(herr.message);

  // amount = SHARES/UNITS
  const hs = (holdings ?? [])
    .map((h: any) => ({
      symbol: String(h.symbol || "").toUpperCase().trim(),
      shares: Number(h.amount ?? 0),
      currency: normCurrency(h.currency),
    }))
    .filter((h: any) => h.symbol && Number.isFinite(h.shares) && h.shares > 0);

  if (hs.length === 0) return 0;

  const symbols = Array.from(new Set(hs.map((h) => h.symbol)));
  const currencies = Array.from(new Set(hs.map((h) => h.currency)));

  const [quotes, fxRaw] = await Promise.all([getLiveQuotes(symbols), getUsdBaseRates(currencies)]);
  const fxRates = (fxRaw as any)?.rates ?? {};

  let totalUsd = 0;

  for (const h of hs) {
    const px = Number(quotes[h.symbol]?.price ?? 0);
    if (!Number.isFinite(px) || px <= 0) continue;

    const rawFx = Number(fxRates[h.currency] ?? (h.currency === "USD" ? 1 : 0));
    const usdPerUnit = toUsdPerUnit(h.currency, rawFx);
    if (!Number.isFinite(usdPerUnit) || usdPerUnit <= 0) continue;

    totalUsd += h.shares * px * usdPerUnit;
  }

  return totalUsd;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const liveTotal = await computeLiveTotalUsd(supabase, user.id);

  // last 2 snapshots (desc)
  const { data: snaps, error: serr } = await supabase
    .from("portfolio_snapshots")
    .select("day,total_usd")
    .eq("user_id", user.id)
    .order("day", { ascending: false })
    .limit(2)
    .returns<Snap[]>();

  if (serr) return NextResponse.json({ error: serr.message }, { status: 500 });

  const s0 = snaps?.[0];
  const s1 = snaps?.[1];

  // Choose prev baseline safely:
  // - if latest snapshot is "today", use previous snapshot as baseline
  // - else use latest snapshot as baseline
  const todayKey = new Date().toISOString().slice(0, 10);
  const latestDay = String(s0?.day ?? "");
  const latestVal = Number(s0?.total_usd ?? 0);
  const prevVal = Number(s1?.total_usd ?? latestVal);

  const baseline = latestDay === todayKey ? prevVal : latestVal;

  const diff = liveTotal - baseline;
  const pct = baseline > 0 ? (diff / baseline) * 100 : 0;

  return NextResponse.json({
    totalUsd: liveTotal,
    dayChangeAmount: diff,
    dayChangePct: pct,
  });
}