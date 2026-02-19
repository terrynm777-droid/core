// app/api/posts/[postId]/comments/route.ts
import { NextRequest, NextResponse } from "next/server";

// IMPORTANT: avoid @/ alias here to kill the VSCode + build mismatch.
// route.ts is at: app/api/posts/[postId]/comments/route.ts
// project root has: lib/supabase/server.ts
import { createClient } from "../../../../../lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// If you ever see 405 from preflight, this kills it.
// Same-origin usually won’t need it, but it’s harmless.
export async function OPTIONS() {
  return new NextResponse(null, { status: 204 });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = params.postId;
  if (!postId) return NextResponse.json({ error: "postId missing" }, { status: 400 });

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);

  // kill the `.from()` TS underline without touching server.ts
  const supabase = createClient() as any;

  const { data, error } = await supabase
    .from("post_comments")
    .select("id, post_id, user_id, body, created_at, parent_comment_id, author:profiles(username, avatar_url)")
    .eq("post_id", postId)
    .is("parent_comment_id", null)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { comments: data ?? [], limit, offset },
    { status: 200 }
  );
}

export async function POST(
  req: NextRequest,
  { params }: { params: { postId: string } }
) {
  const postId = params.postId;
  if (!postId) return NextResponse.json({ error: "postId missing" }, { status: 400 });

  const supabase = createClient() as any;

  const { data: userData, error: userErr } = await supabase.auth.getUser();
  const user = userData?.user;

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const payload = (await req.json().catch(() => null)) as { body?: string } | null;
  const text = payload?.body?.trim();

  if (!text) return NextResponse.json({ error: "body is required" }, { status: 400 });
  if (text.length > 5000) return NextResponse.json({ error: "max 5,000 chars" }, { status: 400 });

  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      body: text,
      parent_comment_id: null,
    })
    .select("id, post_id, user_id, body, created_at, parent_comment_id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ comment: data }, { status: 201 });
}