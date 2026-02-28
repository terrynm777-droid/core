// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Attachment = { kind: "image" | "video"; url: string; name?: string };

type Profile = {
  id: string;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  trader_style: string | null;
};

type PostRow = {
  id: string;
  content: string;
  created_at: string;
  author_id: string | null;
  feed: string | null;
  comments_count: number | null;
  attachments: unknown;
  author: Profile | Profile[] | null;
};

function pickProfile(p: PostRow["author"]): Profile | null {
  if (!p) return null;
  if (Array.isArray(p)) return p[0] ?? null;
  return p;
}

function normFeed(x: unknown): "en" | "ja" {
  return x === "ja" ? "ja" : "en";
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

function toApiPost(row: PostRow) {
  const profile = pickProfile(row.author);

  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    commentsCount: row.comments_count ?? 0,
    attachments: parseAttachments(row.attachments),
    authorId: row.author_id,
    profile: profile
      ? {
          id: profile.id,
          username: profile.username,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          traderStyle: profile.trader_style,
        }
      : null,
  };
}

const SELECT_WITH_PROFILE = `
  id,
  content,
  created_at,
  author_id,
  feed,
  comments_count,
  attachments,
  author:profiles!posts_author_id_fkey(
    id,
    username,
    avatar_url,
    bio,
    trader_style
  )
`;

export async function GET(req: Request) {
  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const feed = normFeed(searchParams.get("feed"));

  const { data, error } = await supabase
    .from("posts")
    .select(SELECT_WITH_PROFILE)
    .eq("feed", feed)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { posts: (data ?? []).map((r) => toApiPost(r as unknown as PostRow)) },
    { status: 200 }
  );
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as any;

  const content = String(body?.content ?? "").trim();
  const feed = normFeed(body?.feed);
  const attachments = parseAttachments(body?.attachments);

  if (!content && attachments.length === 0) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({
      content,
      feed,
      author_id: user.id,
      attachments,
      comments_count: 0,
    })
    .select(SELECT_WITH_PROFILE)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ post: toApiPost(data as unknown as PostRow) }, { status: 201 });
}