import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ commentId: string }> };

const SELECT_REPLIES = `
  id,
  post_id,
  user_id,
  body,
  created_at,
  parent_comment_id,
  author:profiles(
    username,
    avatar_url
  )
`;

export async function GET(req: NextRequest, { params }: Ctx) {
  const { commentId } = await params;
  const supabase: any = await createClient();

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);

  const parentId = Number(commentId);
  if (!Number.isFinite(parentId)) {
    return NextResponse.json({ error: "Invalid commentId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("post_comments")
    .select(SELECT_REPLIES)
    .eq("parent_comment_id", parentId)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ replies: data ?? [], limit, offset }, { status: 200 });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { commentId } = await params;
  const supabase: any = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { body?: string; postId?: string } | null;
  const text = body?.body?.trim();
  const postId = body?.postId;

  if (!text) return NextResponse.json({ error: "body is required" }, { status: 400 });
  if (!postId) return NextResponse.json({ error: "postId is required" }, { status: 400 });

  const parentId = Number(commentId);
  if (!Number.isFinite(parentId)) {
    return NextResponse.json({ error: "Invalid commentId" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("post_comments")
    .insert({ post_id: postId, user_id: user.id, body: text, parent_comment_id: parentId })
    .select(SELECT_REPLIES)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ reply: data }, { status: 201 });
}