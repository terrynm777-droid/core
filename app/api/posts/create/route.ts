import { guardWriteEndpoint } from "@/lib/security/guard";
import { NextResponse, type NextRequest } from "next/server";
import { readJsonWithLimit, HttpError } from "@/lib/security/body";
import { CreatePostSchema } from "@/lib/validation/posts";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const raw = await readJsonWithLimit<unknown>(req, { maxBytes: 8 * 1024 });

    const parsed = CreatePostSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data: auth } = await supabase.auth.getUser();
    const user = auth?.user ?? null;

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const guard = await guardWriteEndpoint(req, user.id, "posts:create");
    if (guard) return guard;

if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: auth.user.id,
        content: parsed.data.content,
      })
      .select("*")
      .single();

    if (error) return NextResponse.json({ error: "DB error" }, { status: 500 });

    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}