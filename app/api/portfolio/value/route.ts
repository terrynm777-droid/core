import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Snap = {
  total_usd: number | null;
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error: e } = await supabase
    .from("portfolio_snapshots")
    .select("total_usd")
    .eq("user_id", user.id)
    .order("day", { ascending: false })
    .limit(2)
    .returns<Snap[]>();

  if (e) return NextResponse.json({ error: e.message }, { status: 500 });

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