import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { finnhubQuote } from "@/lib/finnhub";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SnapshotRow = {
  id: string;
  created_at: string;
  user_id: string;
  total_value: number | null;
  currency: string | null;
};

function normalizeCcy(c: string | null | undefined) {
  return String(c || "USD").trim().toUpperCase();
}

type FxQuote = {
  current: number;
  changePct: number;
};

async function tryFxQuote(ticker: string): Promise<FxQuote | null> {
  try {
    const q: any = await finnhubQuote(ticker);
    const current = Number(q?.current ?? q?.c ?? 0);
    if (!isFinite(current) || current <= 0) return null;
    return {
      current,
      changePct: Number(q?.changePct ?? q?.dp ?? 0),
    };
  } catch {
    return null;
  }
}

async function fxToUsd(from: string, cache: Map<string, { rate: number; fxChangePct: number }>) {
  const f = normalizeCcy(from);
  if (f === "USD") return { rate: 1, fxChangePct: 0 };

  const cached = cache.get(f);
  if (cached) return cached;

  const direct = await tryFxQuote(`OANDA:${f}USD`);
  if (direct) {
    const out = { rate: direct.current, fxChangePct: direct.changePct };
    cache.set(f, out);
    return out;
  }

  const inv = await tryFxQuote(`OANDA:USD${f}`);
  if (inv) {
    const out = { rate: 1 / inv.current, fxChangePct: -inv.changePct };
    cache.set(f, out);
    return out;
  }

  const out = { rate: 0, fxChangePct: 0 };
  cache.set(f, out);
  return out;
}

// UTC day key: YYYY-MM-DD
function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("id, created_at, user_id, total_value, currency")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // latest per day
  const byDay = new Map<string, number>();
  for (const r of (data ?? []) as SnapshotRow[]) {
    const k = String(r.created_at).slice(0, 10);
    if (!byDay.has(k)) byDay.set(k, Number(r.total_value ?? 0));
  }

  const today = new Date();
  const points: { day: string; total_usd: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const k = dayKey(d);
    points.push({ day: k, total_usd: byDay.get(k) ?? 0 });
  }

  return NextResponse.json({ points }, { status: 200 });
}

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!portfolio?.id) return NextResponse.json({ error: "Portfolio missing" }, { status: 500 });

  const { data: holdings, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("amount, currency")
    .eq("portfolio_id", portfolio.id);

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const fxCache = new Map<string, { rate: number; fxChangePct: number }>();

  // total_usd = sum(amount * fx_to_usd)
  let total_usd = 0;
  for (const h of (holdings ?? []) as any[]) {
    const amt = Number(h.amount ?? 0);
    if (!isFinite(amt) || amt <= 0) continue;

    const ccy = normalizeCcy(h.currency);
    const fx = await fxToUsd(ccy, fxCache);
    if (fx.rate > 0) total_usd += amt * fx.rate;
  }

  // enforce 1 snapshot per day (UTC)
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1, 0, 0, 0));

  const del = await supabase
    .from("portfolio_snapshots")
    .delete()
    .eq("user_id", user.id)
    .gte("created_at", start.toISOString())
    .lt("created_at", end.toISOString());

  if (del.error) return NextResponse.json({ error: del.error.message }, { status: 500 });

  const ins = await supabase
    .from("portfolio_snapshots")
    .insert({
      user_id: user.id,
      total_value: total_usd,
      currency: "USD",
    })
    .select("id, created_at, user_id, total_value, currency")
    .single();

  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });

  return NextResponse.json({ snapshot: ins.data }, { status: 201 });
}