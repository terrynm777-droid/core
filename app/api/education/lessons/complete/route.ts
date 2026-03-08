import { NextResponse, type NextRequest } from "next/server";
import { readJsonWithLimit, HttpError } from "@/lib/security/body";
import { createClient } from "@/lib/supabase/server";
import { CompleteLessonSchema } from "@/lib/validation/education";

export async function POST(req: NextRequest) {
  try {
    const raw = await readJsonWithLimit<unknown>(req, { maxBytes: 8 * 1024 });
    const parsed = CompleteLessonSchema.safeParse(raw);

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

    const { levelId, lessonSlug } = parsed.data;

    const { error } = await supabase
      .from("education_lesson_progress")
      .upsert(
        {
          user_id: auth.user.id,
          product_slug: "corelearn",
          level_id: levelId,
          lesson_slug: lessonSlug,
          completed: true,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,product_slug,level_id,lesson_slug",
        }
      );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (e: any) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}