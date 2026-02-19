// app/api/portfolio/snapshot/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getUsdBaseRates } from "@/lib/fx";

export const runtime = "nodejs";

type SnapshotRow = {
  id: string;
  user_id: string;
  day: string; // date
  total_usd: number | null;
  created_at: string;
};

function dayKeyUTC(d: Date) {
  // YYYY-MM-DD in UTC
  return d.toISOString().slice(0, 10);
}

/**
 * Normalize FX output to "USD per 1 unit of currency".
 * Handles either style:
 * - 1 USD = X JPY  -> USD per JPY = 1/X
 * - 1 JPY = X USD  -> USD per JPY = X
 */
function toUsdPerUnit(currency: string, raw: number) {
  if (!Number.isFinite(raw) || raw <= 0) return 0;
  const c = currency.toUpperCase();
  if (c === "USD") return 1;

  // Heuristic:
  // If raw is big (e.g., JPY ~ 140-200), it's almost certainly "currency per USD".
  // Then invert to get "USD per currency".
  if (raw > 5) return 1 / raw;

  // Otherwise assume it's already "USD per currency".
  return raw;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // pull last ~60 days to be safe
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("id, user_id, day, total_usd, created_at")
    .eq("user_id", user.id)
    .order("day", { ascending: false })
    .limit(60);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Map day -> value
  const byDay = new Map<string, number>();
  for (const r of (data ?? []) as unknown as SnapshotRow[]) {
    const k = String((r as any).day);
    if (k && !byDay.has(k)) byDay.set(k, Number((r as any).total_usd ?? 0));
  }

  // Build last 30 days points (oldest -> newest)
  const today = new Date();
  const points: { day: string; total_usd: number }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - i));
    const k = dayKeyUTC(d);
    points.push({ day: k, total_usd: byDay.get(k) ?? 0 });
  }

  return NextResponse.json({ points }, { status: 200 });
}

export async function POST() {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // get portfolio id
  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!portfolio?.id) return NextResponse.json({ error: "Portfolio missing" }, { status: 500 });

  // holdings
  const { data: holdings, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("amount, currency")
    .eq("portfolio_id", portfolio.id);

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const hs = (holdings ?? [])
    .map((h: any) => ({
      amount: Number(h.amount ?? 0),
      currency: String(h.currency ?? "USD").toUpperCase(),
    }))
    .filter((h: any) => Number.isFinite(h.amount) && h.amount > 0);

  // FX to USD for total_usd
  const currencies = Array.from(new Set(hs.map((h: any) => h.currency)));
  const fx = await getUsdBaseRates(currencies);

  const total_usd = hs.reduce((acc: number, h: any) => {
    const raw = Number((fx as any)?.rates?.[h.currency] ?? (h.currency === "USD" ? 1 : 0));
    const usdPerUnit = toUsdPerUnit(h.currency, raw);
    return acc + (usdPerUnit > 0 ? h.amount * usdPerUnit : 0);
  }, 0);

  const day = dayKeyUTC(new Date());

  // IMPORTANT: requires UNIQUE(user_id, day) in Supabase
  const { data: up, error: uperr } = await supabase
    .from("portfolio_snapshots")
    .upsert(
      { user_id: user.id, day, total_usd },
      { onConflict: "user_id,day" }
    )
    .select("id, user_id, day, total_usd, created_at")
    .single();

  if (uperr) return NextResponse.json({ error: uperr.message }, { status: 500 });

  return NextResponse.json({ snapshot: up }, { status: 201 });
}