import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Profile = {
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
  author: Profile | Profile[] | null; // IMPORTANT: we alias profiles -> author
};

function pickProfile(p: PostRow["author"]): Profile | null {
  if (!p) return null;
  if (Array.isArray(p)) return (p[0] as Profile) ?? null;
  return p as Profile;
}

function normFeed(x: unknown): "en" | "ja" {
  return x === "ja" ? "ja" : "en";
}

function toApiPost(row: PostRow) {
  const profile = pickProfile(row.author);

  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
    commentsCount: (row as any).comments_count ?? 0, // ✅ add here
    authorId: row.author_id,
    profile: profile
      ? {
          username: profile.username,
          avatarUrl: profile.avatar_url,
          bio: profile.bio,
          traderStyle: profile.trader_style,
        }
      : null,
  };
}

// IMPORTANT: explicit FK to disambiguate the duplicate relationship
const SELECT_WITH_PROFILE = `
  id,
  content,
  created_at,
  author_id,
  comments_count,
  author:profiles!posts_author_id_fkey(
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

  const posts = (data ?? []).map((row: any) => toApiPost(row as PostRow));
  return NextResponse.json({ posts }, { status: 200 });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { content?: string; feed?: string } | null;
  const content = body?.content?.trim();
  const feed = normFeed(body?.feed);

  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });
  if (content.length > 20000) return NextResponse.json({ error: "max 20,000 chars" }, { status: 400 });

  const { data, error } = await supabase
    .from("posts")
    .insert({ content, author_id: user.id, feed })
    .select(SELECT_WITH_PROFILE)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ post: toApiPost(data as any) }, { status: 201 });
}