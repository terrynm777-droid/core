// FILE 1: app/api/portfolio/value/route.ts
// (PRIVATE / authenticated) — DAILY % MUST BE prevClose vs current (NOT snapshots)

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type HoldingRow = { symbol: string | null; amount: number | string | null; currency: string | null };
type Holding = { symbol: string; shares: number; currency: string };

type FinnQuote = { c: number; pc: number };

function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = currency.toUpperCase();
  if (c === "USD") return 1;
  // Some FX providers return USD per unit (< 5 usually), others unit per USD (> 5 usually)
  if (raw > 5) return 1 / raw;
  return raw;
}

async function getFinnhubQuotes(symbols: string[]): Promise<Record<string, { current: number; prevClose: number }>> {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("Missing FINNHUB_API_KEY");

  const out: Record<string, { current: number; prevClose: number }> = {};

  await Promise.all(
    symbols.map(async (s) => {
      const r = await fetch(`https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(s)}&token=${key}`, {
        cache: "no-store",
      });

      const j = (await r.json().catch(() => null)) as FinnQuote | null;
      const current = Number(j?.c ?? 0);
      const prevClose = Number(j?.pc ?? 0);

      out[s] = {
        current: Number.isFinite(current) ? current : 0,
        prevClose: Number.isFinite(prevClose) ? prevClose : 0,
      };
    })
  );

  return out;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: portfolio } = await supabase.from("portfolios").select("id").eq("user_id", user.id).single();
  if (!portfolio?.id) {
    return NextResponse.json({ totalUsd: 0, dayChangeAmount: 0, dayChangePct: 0, positions: [] });
  }

  const { data: rows } = await supabase
    .from("portfolio_holdings")
    .select("symbol, amount, currency")
    .eq("portfolio_id", portfolio.id)
    .returns<HoldingRow[]>();

  const hs: Holding[] = (rows ?? [])
    .map((r) => ({
      symbol: String(r.symbol ?? "").toUpperCase().trim(),
      shares: Number(r.amount ?? 0),
      currency: String(r.currency ?? "USD").toUpperCase().trim(),
    }))
    .filter((h) => h.symbol && Number.isFinite(h.shares) && h.shares > 0);

  if (!hs.length) {
    return NextResponse.json({ totalUsd: 0, dayChangeAmount: 0, dayChangePct: 0, positions: [] });
  }

  const symbols = Array.from(new Set(hs.map((h) => h.symbol)));
  const currencies = Array.from(new Set(hs.map((h) => h.currency)));

  const [quotes, fxRaw] = await Promise.all([getFinnhubQuotes(symbols), getUsdBaseRates(currencies)]);
  const fxRates: Record<string, number> = (fxRaw as any)?.rates ?? {};

  const positions = hs.map((h) => {
    const q = quotes[h.symbol] ?? { current: 0, prevClose: 0 };

    const rawFx = Number(fxRates[h.currency] ?? (h.currency === "USD" ? 1 : 0));
    const usdPerUnit = toUsdPerUnit(h.currency, rawFx);

    const prevClose = Number.isFinite(q.prevClose) && q.prevClose > 0 ? q.prevClose : q.current;
    const current = q.current;

    const prevUsd =
      usdPerUnit > 0 && prevClose > 0 ? Number(h.shares) * Number(prevClose) * Number(usdPerUnit) : 0;
    const nowUsd = usdPerUnit > 0 && current > 0 ? Number(h.shares) * Number(current) * Number(usdPerUnit) : 0;

    return {
      symbol: h.symbol,
      currency: h.currency,
      shares: h.shares,
      prevClose,
      current,
      prevUsd,
      nowUsd,
      dayChangeUsd: nowUsd - prevUsd,
    };
  });

  const totalUsd = positions.reduce((a, p) => a + (Number.isFinite(p.nowUsd) ? p.nowUsd : 0), 0);
  const prevTotalUsd = positions.reduce((a, p) => a + (Number.isFinite(p.prevUsd) ? p.prevUsd : 0), 0);
  const dayChangeAmount = totalUsd - prevTotalUsd;
  const dayChangePct = prevTotalUsd > 0 ? (dayChangeAmount / prevTotalUsd) * 100 : 0;

  return NextResponse.json({
    totalUsd,
    dayChangeAmount,
    dayChangePct,
    positions,
  });
}