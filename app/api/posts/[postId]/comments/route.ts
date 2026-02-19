import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Params = { postId: string };
type Ctx = { params: Promise<Params> };

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

type Author = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type CommentOut = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  parent_comment_id: string | null;
  author: Author;
};

function shapeComment(c: any): CommentOut {
  return {
    id: c.id,
    post_id: c.post_id,
    user_id: c.user_id,
    body: c.body,
    created_at: c.created_at,
    parent_comment_id: c.parent_comment_id ?? null,
    author: {
      id: c.user_id,
      username: c.profiles?.username ?? null,
      display_name: c.profiles?.display_name ?? null,
      avatar_url: c.profiles?.avatar_url ?? null,
    },
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function GET(req: NextRequest, { params }: Ctx) {
  const { postId } = await params;
  const supabase = await createClient();

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);

  const { data, error } = await supabase
    .from("post_comments")
    .select(
      `
      id,
      post_id,
      user_id,
      body,
      created_at,
      parent_comment_id,
      profiles:profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `
    )
    .eq("post_id", postId)
    // return ALL comments; your UI can decide how to render replies if you want later
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }

  const comments = (data ?? []).map(shapeComment);

  return NextResponse.json(
    { comments, limit, offset },
    { status: 200, headers: corsHeaders }
  );
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { postId } = await params;
  const supabase = await createClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  const user = auth?.user;

  if (authErr || !user) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401, headers: corsHeaders }
    );
  }

  const payload = (await req.json().catch(() => null)) as
    | { body?: string; parent_comment_id?: string | null }
    | null;

  const text = payload?.body?.trim() ?? "";
  const parent_comment_id = payload?.parent_comment_id ?? null;

  if (!text) {
    return NextResponse.json(
      { error: "body is required" },
      { status: 400, headers: corsHeaders }
    );
  }
  if (text.length > 5000) {
    return NextResponse.json(
      { error: "max 5,000 chars" },
      { status: 400, headers: corsHeaders }
    );
  }

  const { data, error } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      body: text,
      parent_comment_id,
    })
    .select(
      `
      id,
      post_id,
      user_id,
      body,
      created_at,
      parent_comment_id,
      profiles:profiles (
        id,
        username,
        display_name,
        avatar_url
      )
    `
    )
    .single();

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500, headers: corsHeaders }
    );
  }

  const comment = shapeComment(data);

  return NextResponse.json(
    { comment },
    { status: 201, headers: corsHeaders }
  );
}