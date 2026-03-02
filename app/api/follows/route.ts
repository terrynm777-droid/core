import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// helper to bypass Supabase generated types for this table
const followsTable = (supabase: any) => supabase.from("follows");

// GET /api/follows?userId=<profileId>
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const follows = followsTable(supabase);

  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    follows
      .select("follower_id", { count: "exact", head: true })
      .eq("following_id", userId),

    follows
      .select("following_id", { count: "exact", head: true })
      .eq("follower_id", userId),
  ]);

  let amIFollowing = false;

  if (user?.id) {
    const { data } = await follows
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", userId)
      .maybeSingle();

    amIFollowing = !!data;
  }

  return NextResponse.json(
    {
      followersCount: followersCount ?? 0,
      followingCount: followingCount ?? 0,
      amIFollowing,
    },
    { status: 200 }
  );
}

// POST → follow
export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const followingId = String(body?.followingId ?? "").trim();

  if (!followingId) {
    return NextResponse.json({ error: "followingId is required" }, { status: 400 });
  }

  if (followingId === user.id) {
    return NextResponse.json({ error: "Cannot follow self" }, { status: 400 });
  }

  const follows = followsTable(supabase);

  const { error } = await follows.insert({
    follower_id: user.id,
    following_id: followingId,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}

// DELETE → unfollow
export async function DELETE(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const followingId = String(searchParams.get("followingId") ?? "").trim();

  if (!followingId) {
    return NextResponse.json({ error: "followingId is required" }, { status: 400 });
  }

  const follows = followsTable(supabase);

  const { error } = await follows
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", followingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}