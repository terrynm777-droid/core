import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type SnapRow = {
  day: string;
  total_usd: number | null;
};

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

  const { data, error } = await supabase
    .from("portfolio_snapshots")
    .select("day,total_usd")
    .eq("user_id", profile.id)
    .order("day", { ascending: true })
    .returns<SnapRow[]>();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ points: data ?? [] });
}