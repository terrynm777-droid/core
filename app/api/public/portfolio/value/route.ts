import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type Snap = { total_usd: number | null };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json({ error: "Missing username" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  const { data } = await supabase
    .from("portfolio_snapshots")
    .select("total_usd")
    .eq("user_id", profile.id)
    .order("day", { ascending: false })
    .limit(2)
    .returns<Snap[]>();

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