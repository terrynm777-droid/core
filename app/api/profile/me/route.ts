import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type ProfileRow = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  trader_style: string | null;
  portfolio_public: boolean | null;
};

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, trader_style, portfolio_public")
    .eq("id", user.id)
    .single();

  if (error) {
    // If profile row doesn't exist yet, return empty defaults (editor can save)
    return NextResponse.json(
      {
        profile: {
          id: user.id,
          username: null,
          avatar_url: null,
          bio: null,
          trader_style: null,
          portfolio_public: false,
        } satisfies ProfileRow,
      },
      { status: 200 }
    );
  }

  return NextResponse.json({ profile: data as ProfileRow }, { status: 200 });
}

export async function PATCH(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as Partial<{
    username: string;
    avatarUrl: string;
    bio: string;
    traderStyle: string;
    portfolioPublic: boolean;
  }> | null;

  if (!body) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const username = typeof body.username === "string" ? body.username.trim() : undefined;
  if (username !== undefined) {
    // basic username guard; tighten later
    if (username.length < 3 || username.length > 20) {
      return NextResponse.json({ error: "Username must be 3–20 chars" }, { status: 400 });
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return NextResponse.json({ error: "Username: letters/numbers/_ only" }, { status: 400 });
    }
  }

  const update: any = { id: user.id };
  if (username !== undefined) update.username = username;
  if (typeof body.avatarUrl === "string") update.avatar_url = body.avatarUrl.trim() || null;
  if (typeof body.bio === "string") update.bio = body.bio.trim() || null;
  if (typeof body.traderStyle === "string") update.trader_style = body.traderStyle.trim() || null;
  if (typeof body.portfolioPublic === "boolean") update.portfolio_public = body.portfolioPublic;

  const { data, error } = await supabase
    .from("profiles")
    // upsert creates row if missing
    .upsert(update, { onConflict: "id" })
    .select("id, username, avatar_url, bio, trader_style, portfolio_public")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ profile: data as ProfileRow }, { status: 200 });
}