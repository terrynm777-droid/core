import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data } = await supabase
    .from("portfolio_snapshots")
    .select("total_usd")
    .eq("user_id", user.id)
    .order("day", { ascending: false })
    .limit(2);

  const today = Number(data?.[0]?.total_usd ?? 0);
  const prev = Number(data?.[1]?.total_usd ?? today);

  const diff = today - prev;
  const pct = prev > 0 ? (diff / prev) * 100 : 0;

  return NextResponse.json({
    totalUsd: today,
    dayChangeAmount: diff,
    dayChangePct: pct,
  });
}