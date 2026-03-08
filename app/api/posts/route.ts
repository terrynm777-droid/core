import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { readJsonWithLimit, HttpError } from "@/lib/security/body";
import { guardWriteEndpoint } from "@/lib/security/guard";

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

type CreatePostBody = {
  content?: unknown;
  feed?: unknown;
  attachments?: unknown;
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
  return (raw as unknown[])
    .map((a): Attachment | null => {
      if (!a || typeof a !== "object") return null;
      const obj = a as Record<string, unknown>;
      const kind: Attachment["kind"] = obj.kind === "video" ? "video" : "image";
      const url = String(obj.url ?? "").trim();
      const name =
        typeof obj.name === "string" && obj.name.trim().length > 0
          ? obj.name.trim()
          : undefined;

      if (!url) return null;
      return { kind, url, name };
    })
    .filter((a): a is Attachment => Boolean(a));
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

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(
    { posts: (data ?? []).map((r) => toApiPost(r as unknown as PostRow)) },
    { status: 200 }
  );
}

export async function POST(req: NextRequest) {
  const requestId = crypto.randomUUID();
  const start = Date.now();

  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    if (!user.email_confirmed_at) {
      return NextResponse.json({ error: "Email not verified" }, { status: 403 });
    }

    const guard = await guardWriteEndpoint(req, user.id, "posts:create");
    if (guard) return guard;

    const raw = await readJsonWithLimit<CreatePostBody>(req, { maxBytes: 16 * 1024 });

    const allowedKeys = ["content", "feed", "attachments"];
    const rawObj =
      raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};

    for (const key of Object.keys(rawObj)) {
      if (!allowedKeys.includes(key)) {
        return NextResponse.json(
          { error: `Unexpected field: ${key}` },
          { status: 400 }
        );
      }
    }

    const content = String(rawObj.content ?? "").trim();
    const feed = normFeed(rawObj.feed);
    const attachments = parseAttachments(rawObj.attachments);

    if (attachments.length > 4) {
      return NextResponse.json(
        { error: "Too many attachments" },
        { status: 400 }
      );
    }

    if (content.length > 5000) {
      return NextResponse.json(
        { error: "content too long" },
        { status: 400 }
      );
    }

    if (!content && attachments.length === 0) {
      return NextResponse.json(
        { error: "content is required" },
        { status: 400 }
      );
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

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(
      JSON.stringify({
        request_id: requestId,
        path: "/api/posts",
        method: "POST",
        user_id: user.id,
        status: 201,
        latency_ms: Date.now() - start,
      })
    );

    return NextResponse.json(
      { post: toApiPost(data as unknown as PostRow) },
      { status: 201 }
    );
  } catch (e: any) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}