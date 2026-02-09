// app/api/posts/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type PostRow = {
  id: string;
  content: string;
  created_at: string;
};

function jsonError(message: string, status = 500) {
  return NextResponse.json({ error: message }, { status });
}

function mapPost(p: PostRow) {
  return { id: p.id, content: p.content, createdAt: p.created_at };
}

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("posts")
    .select("id, content, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return jsonError(error.message, 500);

  return NextResponse.json({
    posts: (data ?? []).map((p) => mapPost(p as PostRow)),
  });
}

export async function POST(req: Request) {
  const supabase = await createClient();

  // 1) Must be authenticated (RLS needs auth.uid())
  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();

  if (userErr || !user) return jsonError("Not authenticated", 401);

  // 2) Accept JSON OR form-data
  let content = "";
  const contentType = req.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("application/json")) {
      const body = (await req.json().catch(() => null)) as { content?: string } | null;
      content = (body?.content ?? "").trim();
    } else {
      const form = await req.formData();
      content = String(form.get("content") ?? "").trim();
    }
  } catch {
    return jsonError("Invalid request body", 400);
  }

  // 3) Validate
  if (!content) return jsonError("content is required", 400);
  if (content.length > 20000) return jsonError("max 20,000 chars", 400);

  // 4) Insert (include user_id so current RLS policy passes)
  const { data, error } = await supabase
    .from("posts")
    .insert({ content, user_id: user.id })
    .select("id, content, created_at")
    .single();

  if (error) return jsonError(error.message, 500);

  return NextResponse.json(
    { post: mapPost(data as PostRow) },
    { status: 201 }
  );
}