import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

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
};

function toApiPost(row: PostRow, profile: Profile | null) {
  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at,
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

export async function GET() {
  const supabase = await createClient();

  // 1) Get posts (NO EMBED)
  const { data: posts, error: postsErr } = await supabase
    .from("posts")
    .select("id, content, created_at, author_id")
    .order("created_at", { ascending: false })
    .limit(50);

  if (postsErr) {
    return NextResponse.json({ error: postsErr.message }, { status: 500 });
  }

  const rows = (posts ?? []) as PostRow[];

  // 2) Collect author ids
  const authorIds = Array.from(
    new Set(rows.map((p) => p.author_id).filter((x): x is string => !!x))
  );

  // 3) Fetch profiles for those authors (NO RELATIONSHIP USED)
  let profileById = new Map<string, Profile>();
  if (authorIds.length > 0) {
    const { data: profiles, error: profErr } = await supabase
      .from("profiles")
      .select("id, username, avatar_url, bio, trader_style")
      .in("id", authorIds);

    if (profErr) {
      return NextResponse.json({ error: profErr.message }, { status: 500 });
    }

    for (const p of (profiles ?? []) as Profile[]) {
      profileById.set(p.id, p);
    }
  }

  // 4) Merge
  const apiPosts = rows.map((row) =>
    toApiPost(row, row.author_id ? profileById.get(row.author_id) ?? null : null)
  );

  return NextResponse.json({ posts: apiPosts }, { status: 200 });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = (await req.json().catch(() => null)) as { content?: string } | null;
  const content = body?.content?.trim();

  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });
  if (content.length > 20000) return NextResponse.json({ error: "max 20,000 chars" }, { status: 400 });

  // 1) Insert post
  const { data: inserted, error: insErr } = await supabase
    .from("posts")
    .insert({ content, author_id: user.id })
    .select("id, content, created_at, author_id")
    .single();

  if (insErr) {
    return NextResponse.json({ error: insErr.message }, { status: 500 });
  }

  const postRow = inserted as PostRow;

  // 2) Fetch profile separately
  const { data: profileRow, error: profErr } = await supabase
    .from("profiles")
    .select("id, username, avatar_url, bio, trader_style")
    .eq("id", user.id)
    .single();

  // If profile missing, don't fail the post
  const profile = profErr ? null : (profileRow as Profile);

  return NextResponse.json({ post: toApiPost(postRow, profile) }, { status: 201 });
}