// app/api/profile/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, bio, avatar_url, trader_style")
    .eq("id", userRes.user.id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data }, { status: 200 });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();
  const { data: userRes, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userRes?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        username?: string;
        bio?: string;
        avatar_url?: string;
        trader_style?: string;
      }
    | null;

  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  // Basic cleanup
  const patch: Record<string, any> = {};
  if (typeof body.username === "string") patch.username = body.username.trim();
  if (typeof body.bio === "string") patch.bio = body.bio.trim();
  if (typeof body.avatar_url === "string") patch.avatar_url = body.avatar_url.trim();
  if (typeof body.trader_style === "string") patch.trader_style = body.trader_style.trim();

  const { data, error } = await supabase
    .from("profiles")
    .update({ ...patch, updated_at: new Date().toISOString() })
    .eq("id", userRes.user.id)
    .select("id, username, bio, avatar_url, trader_style")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ profile: data }, { status: 200 });
}