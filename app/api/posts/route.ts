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
  profiles: Profile | Profile[] | null; // Supabase can return object or array depending on relationship
};

function pickProfile(p: PostRow["profiles"]): Profile | null {
  if (!p) return null;
  if (Array.isArray(p)) return (p[0] as Profile) ?? null;
  return p as Profile;
}

function toApiPost(row: PostRow) {
  const profile = pickProfile(row.profiles);
  return {
    id: row.id,
    content: row.content,
    createdAt: row.created_at, // normalize for frontend
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

const SELECT_WITH_PROFILE = `
  id,
  content,
  created_at,
  author_id,
  profiles(
    username,
    avatar_url,
    bio,
    trader_style
  )
`;

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select(SELECT_WITH_PROFILE)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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

  const body = (await req.json().catch(() => null)) as { content?: string } | null;
  const content = body?.content?.trim();

  if (!content) {
    return NextResponse.json({ error: "content is required" }, { status: 400 });
  }
  if (content.length > 20000) {
    return NextResponse.json({ error: "max 20,000 chars" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("posts")
    .insert({ content, author_id: user.id })
    .select(SELECT_WITH_PROFILE)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const post = toApiPost(data as any as PostRow);
  return NextResponse.json({ post }, { status: 201 });
}