import { NextResponse, type NextRequest } from "next/server";
import { readJsonWithLimit, HttpError } from "@/lib/security/body";
import { CreatePostSchema } from "@/lib/validation/posts";
import { createClient } from "@/lib/supabase/server";
import { guardWriteEndpoint } from "@/lib/security/guard";

export async function POST(req: NextRequest) {

  const requestId = crypto.randomUUID();
  const start = Date.now();

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

    if (!auth?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // email verification protection
    if (!auth.user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Email not verified" },
        { status: 403 }
      );
    }

    // rate limit + idempotency protection
    const guard = await guardWriteEndpoint(req, auth.user.id, "posts:create");
    if (guard) return guard;

    const { data, error } = await supabase
      .from("posts")
      .insert({
        author_id: auth.user.id,
        content: parsed.data.content,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json({ error: "DB error" }, { status: 500 });
    }

    console.log(JSON.stringify({
      request_id: requestId,
      path: "/api/posts/create",
      method: "POST",
      user_id: auth.user.id,
      status: 201,
      latency_ms: Date.now() - start
    }));

    return NextResponse.json(data, { status: 201 });

  } catch (e: any) {

    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }

    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}