import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  trader_style: string | null;
};

export async function GET() {
  const supabase = await createClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, trader_style")
    .eq("id", auth.user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data as ProfileRow }, { status: 200 });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  if (authErr || !auth?.user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as
    | {
        username?: string;
        avatar_url?: string | null;
        bio?: string | null;
        trader_style?: string | null;
      }
    | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const username = (body.username ?? "").trim();

  // Validate username hard (matches your UI rules)
  if (!username) return NextResponse.json({ error: "Username required" }, { status: 400 });
  if (username.length < 3 || username.length > 20)
    return NextResponse.json({ error: "Username must be 3–20 chars" }, { status: 400 });
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return NextResponse.json({ error: "Username must be letters/numbers/_ only" }, { status: 400 });

  const patch = {
    username,
    avatar_url: body.avatar_url ?? null,
    bio: body.bio ?? null,
    trader_style: body.trader_style ?? null,
  };

  const { data, error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", auth.user.id)
    .select("id, username, avatar_url, bio, trader_style")
    .single();

  if (error) {
    // most common: unique violation on username
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ profile: data as ProfileRow }, { status: 200 });
}