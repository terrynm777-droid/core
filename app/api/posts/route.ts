import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export const runtime = "nodejs";

export async function GET() {
  const { data, error } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const posts = (data ?? []).map((p) => ({
    id: p.id,
    content: p.content,
    createdAt: p.created_at,
  }));

  return NextResponse.json({ posts });
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { content?: string } | null;
  const content = body?.content?.trim();
  if (!content) return NextResponse.json({ error: "content is required" }, { status: 400 });
  if (content.length > 500) return NextResponse.json({ error: "max 500 chars" }, { status: 400 });

  const { data, error } = await supabase
    .from("posts")
    .insert({ content })
    .select("id, content, created_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(
    { post: { id: data.id, content: data.content, createdAt: data.created_at } },
    { status: 201 }
  );
}