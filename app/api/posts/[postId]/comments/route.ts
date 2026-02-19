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

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
};

type CommentRow = {
  id: string;
  post_id: string;
  user_id: string;
  body: string;
  created_at: string;
  parent_comment_id: string | null;
};

export async function GET(req: NextRequest, { params }: Ctx) {
  const { postId } = await params;
  const supabase = await createClient();

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);

  // 1) fetch comments
  const { data: rows, error: rowsErr } = await supabase
    .from("post_comments")
    .select("id, post_id, user_id, body, created_at, parent_comment_id")
    .eq("post_id", postId)
    .is("parent_comment_id", null)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (rowsErr) {
    return NextResponse.json(
      { error: rowsErr.message },
      { status: 500, headers: corsHeaders }
    );
  }

  const commentsRaw = (rows ?? []) as CommentRow[];

  // 2) fetch profiles for those user_ids
  const userIds = Array.from(new Set(commentsRaw.map((c) => c.user_id))).filter(Boolean);

  let profilesById = new Map<string, Profile>();
  if (userIds.length) {
    const { data: profs, error: profErr } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", userIds);

    if (profErr) {
      return NextResponse.json(
        { error: profErr.message },
        { status: 500, headers: corsHeaders }
      );
    }

    (profs ?? []).forEach((p: any) => {
      profilesById.set(p.id, {
        id: p.id,
        username: p.username ?? null,
        display_name: p.display_name ?? null,
        avatar_url: p.avatar_url ?? null,
      });
    });
  }

  const comments = commentsRaw.map((c) => ({
    ...c,
    author: profilesById.get(c.user_id) ?? {
      id: c.user_id,
      username: null,
      display_name: null,
      avatar_url: null,
    },
  }));

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

  // insert comment
  const { data: inserted, error: insErr } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      body: text,
      parent_comment_id,
    })
    .select("id, post_id, user_id, body, created_at, parent_comment_id")
    .single();

  if (insErr) {
    return NextResponse.json(
      { error: insErr.message },
      { status: 500, headers: corsHeaders }
    );
  }

  // fetch profile for response (optional but fixes @unknown instantly)
  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profErr) {
    return NextResponse.json(
      { error: profErr.message },
      { status: 500, headers: corsHeaders }
    );
  }

  const comment = {
    ...(inserted as any),
    author: prof
      ? {
          id: prof.id,
          username: prof.username ?? null,
          display_name: prof.display_name ?? null,
          avatar_url: prof.avatar_url ?? null,
        }
      : { id: user.id, username: null, display_name: null, avatar_url: null },
  };

  return NextResponse.json({ comment }, { status: 201, headers: corsHeaders });
}