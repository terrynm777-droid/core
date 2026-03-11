import { guardWriteEndpoint } from "@/lib/security/guard";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const followsTable = (supabase: any) => supabase.from("follows");

function readTargetId(body: any, searchParams?: URLSearchParams) {
  return String(
    body?.followingId ??
      body?.target_user_id ??
      searchParams?.get("followingId") ??
      searchParams?.get("target_user_id") ??
      ""
  ).trim();
}

// GET /api/follows?userId=<profileId>
export async function GET(req: Request) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);

  const targetUserId = searchParams.get("userId");
  if (!targetUserId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const follows = followsTable(supabase);

  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    follows.select("follower_id", { count: "exact", head: true }).eq("following_id", targetUserId),
    follows.select("following_id", { count: "exact", head: true }).eq("follower_id", targetUserId),
  ]);

  let amIFollowing = false;

  if (user?.id) {
    const { data } = await follows
      .select("follower_id")
      .eq("follower_id", user.id)
      .eq("following_id", targetUserId)
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

  const guard = await guardWriteEndpoint(req as any, user.id, "follow");
  if (guard) return guard;

  const body = await req.json().catch(() => null);
  const followingId = readTargetId(body);

  if (!followingId) {
    return NextResponse.json(
      { error: "followingId or target_user_id is required" },
      { status: 400 }
    );
  }

  if (followingId === user.id) {
    return NextResponse.json({ error: "Cannot follow self" }, { status: 400 });
  }

  const follows = followsTable(supabase);

  const { error } = await follows.upsert(
    {
      follower_id: user.id,
      following_id: followingId,
    },
    {
      onConflict: "follower_id,following_id",
      ignoreDuplicates: true,
    }
  );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    follows.select("follower_id", { count: "exact", head: true }).eq("following_id", followingId),
    follows.select("following_id", { count: "exact", head: true }).eq("follower_id", followingId),
  ]);

  return NextResponse.json(
    {
      ok: true,
      amIFollowing: true,
      followersCount: followersCount ?? 0,
      followingCount: followingCount ?? 0,
    },
    { status: 200 }
  );
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

  const guard = await guardWriteEndpoint(req as any, user.id, "follow");
  if (guard) return guard;

  const { searchParams } = new URL(req.url);
  const body = await req.json().catch(() => null);
  const followingId = readTargetId(body, searchParams);

  if (!followingId) {
    return NextResponse.json(
      { error: "followingId or target_user_id is required" },
      { status: 400 }
    );
  }

  const follows = followsTable(supabase);

  const { error } = await follows
    .delete()
    .eq("follower_id", user.id)
    .eq("following_id", followingId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const [{ count: followersCount }, { count: followingCount }] = await Promise.all([
    follows.select("follower_id", { count: "exact", head: true }).eq("following_id", followingId),
    follows.select("following_id", { count: "exact", head: true }).eq("follower_id", followingId),
  ]);

  return NextResponse.json(
    {
      ok: true,
      amIFollowing: false,
      followersCount: followersCount ?? 0,
      followingCount: followingCount ?? 0,
    },
    { status: 200 }
  );
}