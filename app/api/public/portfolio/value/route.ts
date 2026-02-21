import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";
import { getLiveQuotes } from "@/lib/prices";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = { symbol: string | null; amount: number | string | null; currency: string | null };

type Holding = {
  symbol: string;
  shares: number;
  currency: string;
};

type SnapRow = { day: string; total_usd: number | null };

function safeNum(x: any, fallback = 0) {
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}
function safeStr(x: any, fallback = "") {
  const s = String(x ?? "").trim();
  return s ? s : fallback;
}

// Returns USD per 1 unit of currency.
// NOTE: kept your heuristic because your fx provider shape/quote direction is unknown.
function toUsdPerUnit(currency: string, raw: number) {
  const c = currency.toUpperCase();
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  if (c === "USD") return 1;
  if (raw > 5) return 1 / raw; // likely JPY-per-USD style
  return raw; // likely USD-per-unit
}

function todayUtcDay() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");
  if (!username) return NextResponse.json({ error: "Missing username" }, { status: 400 });

  // If this is missing on Vercel, your public page will show 0s or fail silently elsewhere.
  if (!process.env.FINNHUB_API_KEY) {
    return NextResponse.json(
      { error: "Missing FINNHUB_API_KEY env var" },
      { status: 500 }
    );
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();

  if (!profile?.id) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  const { data: portfolio } = await supabase
    .from("portfolios")
    .select("id,is_public")
    .eq("user_id", profile.id)
    .maybeSingle();

  if (!portfolio?.id || !portfolio.is_public) {
    return NextResponse.json({ error: "Portfolio not public" }, { status: 403 });
  }

  const { data: rows } = await supabase
    .from("portfolio_holdings")
    .select("symbol,amount,currency")
    .eq("portfolio_id", portfolio.id)
    .returns<HoldingRow[]>();

  const holdings: Holding[] = (rows ?? [])
    .map((r): Holding => ({
      symbol: safeStr(r.symbol).toUpperCase(),
      shares: safeNum(r.amount, 0),
      currency: safeStr(r.currency, "USD").toUpperCase(),
    }))
    .filter((h) => Boolean(h.symbol) && Number.isFinite(h.shares) && h.shares > 0);

  if (holdings.length === 0) {
    return NextResponse.json({
      totalUsd: 0,
      dayChangeAmount: 0,
      dayChangePct: 0,
      positions: [],
    });
  }

  const symbols = Array.from(new Set(holdings.map((h) => h.symbol)));
  const currencies = Array.from(new Set(holdings.map((h) => h.currency)));

  const [quotes, fxRaw] = await Promise.all([
    getLiveQuotes(symbols),
    getUsdBaseRates(currencies),
  ]);

  const fxRates: Record<string, number> =
    (fxRaw as any)?.rates && typeof (fxRaw as any)?.rates === "object"
      ? (fxRaw as any).rates
      : (fxRaw as any) && typeof fxRaw === "object"
        ? (fxRaw as any)
        : {};

  const positions = holdings
    .map((h) => {
      const price = safeNum((quotes as any)?.[h.symbol], 0);
      const rawFx = safeNum(fxRates[h.currency], h.currency === "USD" ? 1 : 0);
      const usdPerUnit = toUsdPerUnit(h.currency, rawFx);
      const usdValue =
        price > 0 && usdPerUnit > 0 ? h.shares * price * usdPerUnit : 0;

      return {
        symbol: h.symbol,
        currency: h.currency,
        shares: h.shares,
        price,
        usdValue,
      };
    })
    .filter((p) => p.usdValue > 0);

  const totalUsd = positions.reduce((a, p) => a + p.usdValue, 0);

  // Correct day-over-day:
  // - if a snapshot exists for today, compare against the most recent snapshot BEFORE today
  // - else compare against the most recent snapshot (yesterday/previous)
  const { data: snaps } = await supabase
    .from("portfolio_snapshots")
    .select("day,total_usd")
    .eq("user_id", profile.id)
    .order("day", { ascending: false })
    .limit(2)
    .returns<SnapRow[]>();

  const tday = todayUtcDay();
  const s0 = snaps?.[0];
  const s1 = snaps?.[1];

  const prev =
    s0?.day === tday
      ? safeNum(s1?.total_usd, safeNum(s0?.total_usd, totalUsd))
      : safeNum(s0?.total_usd, totalUsd);

  const diff = totalUsd - prev;
  const pct = prev > 0 ? (diff / prev) * 100 : 0;

  return NextResponse.json({
    totalUsd,
    dayChangeAmount: diff,
    dayChangePct: pct,
    positions,
  });
}