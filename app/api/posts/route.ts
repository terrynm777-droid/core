import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    posts: (data ?? []).map((p) => ({
      id: p.id,
      content: p.content,
      createdAt: p.created_at,
    })),
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  const { data: { user }, error: userErr } = await supabase.auth.getUser();
  if (userErr || !user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const body = (await req.json().catch(() => null)) as { content?: string } | null;
  const content = body?.content?.trim();
  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });
  if (content.length > 20000) return NextResponse.json({ error: "max 20,000 chars" }, { status: 400 });

  const { data, error } = await supabase
    .from("posts")
    .insert({ content, user_id: user.id })
    .select("id, content, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { post: { id: data.id, content: data.content, createdAt: data.created_at } },
    { status: 201 }
  );
}