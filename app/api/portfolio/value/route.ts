import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Snap = { total_usd: number | string | null };

export async function GET() {
  const supabase = await createClient();

  const { data: { user }, error: uerr } = await supabase.auth.getUser();
  if (uerr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("total_usd")
    .eq("user_id", user.id)
    .order("day", { ascending: false })
    .limit(2)
    .returns<any[]>(); // <- bypass stale generated types

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const rows = (data ?? []) as Snap[];
  const today = Number(rows?.[0]?.total_usd ?? 0);
  const prev = Number(rows?.[1]?.total_usd ?? today);

  const diff = today - prev;
  const pct = prev > 0 ? (diff / prev) * 100 : 0;

  return NextResponse.json({
    totalUsd: today,
    dayChangeAmount: diff,
    dayChangePct: pct,
  });
}