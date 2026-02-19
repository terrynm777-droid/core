import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ postId: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const { postId } = await params;
  const supabase: any = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  const user = auth?.user ?? null;

  // total likes
  const { count, error: countErr } = await supabase
    .from("post_likes")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId);

  if (countErr) return NextResponse.json({ error: countErr.message }, { status: 500 });

  // whether current user liked
  let liked = false;
  if (user) {
    const { data: mine, error: mineErr } = await supabase
      .from("post_likes")
      .select("id")
      .eq("post_id", postId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (mineErr) return NextResponse.json({ error: mineErr.message }, { status: 500 });
    liked = !!mine;
  }

  return NextResponse.json({ postId, liked, likeCount: count ?? 0 }, { status: 200 });
}

export async function POST(_req: NextRequest, { params }: Ctx) {
  const { postId } = await params;
  const supabase: any = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  // toggle
  const { data: existing, error: exErr } = await supabase
    .from("post_likes")
    .select("id")
    .eq("post_id", postId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (exErr) return NextResponse.json({ error: exErr.message }, { status: 500 });

  if (existing?.id) {
    const { error: delErr } = await supabase.from("post_likes").delete().eq("id", existing.id);
    if (delErr) return NextResponse.json({ error: delErr.message }, { status: 500 });
    return NextResponse.json({ postId, liked: false }, { status: 200 });
  }

  const { error: insErr } = await supabase.from("post_likes").insert({ post_id: postId, user_id: user.id });
  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 500 });

  return NextResponse.json({ postId, liked: true }, { status: 200 });
}