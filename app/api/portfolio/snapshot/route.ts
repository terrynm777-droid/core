import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type SnapshotRow = {
  id: string;
  created_at: string;
  user_id: string;
  total_value: number | null;
  currency: string | null;
};

// UTC day key: YYYY-MM-DD
function dayKey(d: Date) {
  return d.toISOString().slice(0, 10);
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Pull enough rows to cover last 30 days (some days may have multiple rows)
  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("id, created_at, user_id, total_value, currency")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Collapse to one point per day (latest snapshot that day)
  const byDay = new Map<string, number>();
  for (const r of (data ?? []) as SnapshotRow[]) {
    const k = String(r.created_at).slice(0, 10);
    if (!byDay.has(k)) byDay.set(k, Number(r.total_value ?? 0));
  }

  // Build last 30 days points (oldest -> newest)
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
  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // Compute "total_value" as sum of holding amounts (your app currently treats allocation as amount)
  const { data: portfolio, error: perr } = await supabase
    .from("portfolios")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (perr) return NextResponse.json({ error: perr.message }, { status: 500 });
  if (!portfolio?.id) return NextResponse.json({ error: "Portfolio missing" }, { status: 500 });

  const { data: holdings, error: herr } = await supabase
    .from("portfolio_holdings")
    .select("amount")
    .eq("portfolio_id", portfolio.id);

  if (herr) return NextResponse.json({ error: herr.message }, { status: 500 });

  const total = (holdings ?? []).reduce((acc: number, h: any) => acc + (Number(h.amount) || 0), 0);

  // Enforce 1 snapshot per day: delete today's snapshot rows, then insert one
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
      total_value: total,
      currency: "USD",
    })
    .select("id, created_at, user_id, total_value, currency")
    .single();

  if (ins.error) return NextResponse.json({ error: ins.error.message }, { status: 500 });

  return NextResponse.json({ snapshot: ins.data as SnapshotRow }, { status: 201 });
}
