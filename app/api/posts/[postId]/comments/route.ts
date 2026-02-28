import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Attachment = { kind: "image" | "video"; url: string; name?: string };

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
  attachments: unknown;
};

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

function parseAttachments(raw: unknown): Attachment[] {
  if (!Array.isArray(raw)) return [];
  return (raw as any[])
    .map((a: any): Attachment => {
      const kind: Attachment["kind"] = a?.kind === "video" ? "video" : "image";
      return {
        kind,
        url: String(a?.url ?? ""),
        name: a?.name ? String(a.name) : undefined,
      };
    })
    .filter((a): a is Attachment => Boolean(a.url));
}

// IMPORTANT: your Next build expects params as a Promise here
type Ctx = { params: Promise<{ postId: string }> };

export async function GET(req: NextRequest, { params }: Ctx) {
  const { postId } = await params;
  const supabase = await createClient();

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") ?? "20"), 50);
  const offset = Math.max(Number(url.searchParams.get("offset") ?? "0"), 0);

  const { count, error: countErr } = await supabase
    .from("post_comments")
    .select("id", { count: "exact", head: true })
    .eq("post_id", postId)
    .is("parent_comment_id", null);

  if (countErr) {
    return NextResponse.json({ error: countErr.message }, { status: 500, headers: corsHeaders });
  }

  const { data: rows, error: rowsErr } = await supabase
    .from("post_comments")
    .select("id, post_id, user_id, body, created_at, parent_comment_id, attachments")
    .eq("post_id", postId)
    .is("parent_comment_id", null)
    .order("created_at", { ascending: true })
    .range(offset, offset + limit - 1);

  if (rowsErr) {
    return NextResponse.json({ error: rowsErr.message }, { status: 500, headers: corsHeaders });
  }

  const commentsRaw = (rows ?? []) as unknown as CommentRow[];

  const userIds = Array.from(new Set(commentsRaw.map((c) => c.user_id))).filter(Boolean);

  const profilesById = new Map<string, Profile>();
  if (userIds.length) {
    const { data: profs, error: profErr } = await supabase
      .from("profiles")
      .select("id, username, display_name, avatar_url")
      .in("id", userIds);

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500, headers: corsHeaders });
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
    id: c.id,
    post_id: c.post_id,
    user_id: c.user_id,
    body: c.body,
    created_at: c.created_at,
    parent_comment_id: c.parent_comment_id,
    attachments: parseAttachments(c.attachments),
    author:
      profilesById.get(c.user_id) ?? {
        id: c.user_id,
        username: null,
        display_name: null,
        avatar_url: null,
      },
  }));

  return NextResponse.json({ comments, total: count ?? 0, limit, offset }, { status: 200, headers: corsHeaders });
}

export async function POST(req: NextRequest, { params }: Ctx) {
  const { postId } = await params;
  const supabase = await createClient();

  const { data: auth, error: authErr } = await supabase.auth.getUser();
  const user = auth?.user;

  if (authErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401, headers: corsHeaders });
  }

  const payload = (await req.json().catch(() => null)) as
    | { body?: string; parent_comment_id?: string | null; attachments?: unknown }
    | null;

  const text = String(payload?.body ?? "").trim();
  const parent_comment_id = payload?.parent_comment_id ?? null;
  const attachments = parseAttachments(payload?.attachments);

  if (!text && attachments.length === 0) {
    return NextResponse.json({ error: "body is required" }, { status: 400, headers: corsHeaders });
  }
  if (text.length > 5000) {
    return NextResponse.json({ error: "max 5,000 chars" }, { status: 400, headers: corsHeaders });
  }

  const { data: inserted, error: insErr } = await supabase
    .from("post_comments")
    .insert({
      post_id: postId,
      user_id: user.id,
      body: text,
      parent_comment_id,
      attachments,
    })
    .select("id, post_id, user_id, body, created_at, parent_comment_id, attachments")
    .single();

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500, headers: corsHeaders });
  }

  // keep posts.comments_count in sync (your feed uses this)
 const { data: postRow } = await supabase
  .from("posts")
  .select("comments_count")
  .eq("id", postId)
  .maybeSingle();

const nextCount = Number((postRow as any)?.comments_count ?? 0) + 1;

  await supabase
  .from("posts")
  .update({ comments_count: nextCount } as any)
  .eq("id", postId);

  const { data: prof, error: profErr } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();

  if (profErr) {
    return NextResponse.json({ error: profErr.message }, { status: 500, headers: corsHeaders });
  }

  const comment = {
    id: (inserted as any).id,
    post_id: (inserted as any).post_id,
    user_id: (inserted as any).user_id,
    body: (inserted as any).body,
    created_at: (inserted as any).created_at,
    parent_comment_id: (inserted as any).parent_comment_id,
    attachments: parseAttachments((inserted as any).attachments),
    author: prof
      ? {
          id: (prof as any).id,
          username: (prof as any).username ?? null,
          display_name: (prof as any).display_name ?? null,
          avatar_url: (prof as any).avatar_url ?? null,
        }
      : { id: user.id, username: null, display_name: null, avatar_url: null },
  };

  return NextResponse.json({ comment }, { status: 201, headers: corsHeaders });
}