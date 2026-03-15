import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { coreLearnContent } from "@/app/education/corelearn/content";

function makeCourseCertificateCode() {
  return `CORELEARN-${crypto.randomUUID().slice(0, 10).toUpperCase()}`;
}

export async function POST(_req: NextRequest) {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allLevelIds = coreLearnContent.map((level) => level.id);

  const totalLessons = coreLearnContent.reduce(
    (acc, level) => acc + level.lessons.length,
    0
  );

  const { data: lessonRows } = await supabase
    .from("education_lesson_progress")
    .select("level_id, lesson_slug, completed")
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn")
    .eq("completed", true);

  const doneLessons = lessonRows?.length ?? 0;
  const allLessonsComplete = doneLessons === totalLessons && totalLessons > 0;

  if (!allLessonsComplete) {
    return NextResponse.json(
      { error: "All lessons must be completed first" },
      { status: 400 }
    );
  }

  const { data: quizzes } = await supabase
    .from("education_level_quiz_attempts")
    .select("level_id, passed")
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn");

  const passedSet = new Set(
    (quizzes ?? []).filter((q) => q.passed).map((q) => q.level_id)
  );

  const allPassed = allLevelIds.every((id) => passedSet.has(id));

  if (!allPassed) {
    return NextResponse.json(
      { error: "All level quizzes must be passed first" },
      { status: 400 }
    );
  }

  const { data: existing } = await supabase
    .from("education_course_certificates")
    .select("certificate_code")
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn")
    .maybeSingle();

  if (existing?.certificate_code) {
    return NextResponse.json({
      ok: true,
      certificateCode: existing.certificate_code,
    });
  }

  const code = makeCourseCertificateCode();

  const { error } = await supabase
    .from("education_course_certificates")
    .insert({
      user_id: auth.user.id,
      product_slug: "corelearn",
      certificate_code: code,
      issued_at: new Date().toISOString(),
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, certificateCode: code });
}