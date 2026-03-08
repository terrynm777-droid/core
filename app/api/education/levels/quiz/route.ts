import { NextResponse, type NextRequest } from "next/server";
import { readJsonWithLimit, HttpError } from "@/lib/security/body";
import { createClient } from "@/lib/supabase/server";
import { SubmitLevelQuizSchema } from "@/lib/validation/education";
import { coreLearnContent } from "@/app/education/corelearn/content";

function makeCertificateCode(levelId: string) {
  return `CORE-${levelId.toUpperCase()}-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
}

export async function POST(req: NextRequest) {
  try {
    const raw = await readJsonWithLimit<unknown>(req, { maxBytes: 16 * 1024 });
    const parsed = SubmitLevelQuizSchema.safeParse(raw);

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

    const { levelId, answers } = parsed.data;
    const level = coreLearnContent.find((item) => item.id === levelId);

    if (!level) {
      return NextResponse.json({ error: "Level not found" }, { status: 404 });
    }

    const total = level.levelQuiz.length;
    const score = level.levelQuiz.reduce((acc, q, i) => {
      return acc + (answers[i] === q.answerIndex ? 1 : 0);
    }, 0);

    const passed = total > 0 ? score / total >= 0.8 : false;

    const { error: quizError } = await supabase
      .from("education_level_quiz_attempts")
      .upsert(
        {
          user_id: auth.user.id,
          product_slug: "corelearn",
          level_id: levelId,
          score,
          total,
          passed,
          answers,
          attempted_at: new Date().toISOString(),
        },
        {
          onConflict: "user_id,product_slug,level_id",
        }
      );

    if (quizError) {
      return NextResponse.json({ error: quizError.message }, { status: 500 });
    }

    const { count } = await supabase
      .from("education_lesson_progress")
      .select("*", { count: "exact", head: true })
      .eq("user_id", auth.user.id)
      .eq("product_slug", "corelearn")
      .eq("level_id", levelId)
      .eq("completed", true);

    let certificateCode: string | null = null;

    if (passed && (count ?? 0) >= level.lessons.length) {
      const { data: existingCert } = await supabase
        .from("education_certificates")
        .select("certificate_code")
        .eq("user_id", auth.user.id)
        .eq("product_slug", "corelearn")
        .eq("level_id", levelId)
        .maybeSingle();

      if (existingCert?.certificate_code) {
        certificateCode = existingCert.certificate_code;
      } else {
        const newCode = makeCertificateCode(levelId);

        const { error: certError } = await supabase
          .from("education_certificates")
          .insert({
            user_id: auth.user.id,
            product_slug: "corelearn",
            level_id: levelId,
            certificate_code: newCode,
          });

        if (!certError) {
          certificateCode = newCode;
        }
      }
    }

    return NextResponse.json(
      {
        ok: true,
        score,
        total,
        passed,
        certificateCode,
      },
      { status: 200 }
    );
  } catch (e: any) {
    if (e instanceof HttpError) {
      return NextResponse.json({ error: e.message }, { status: e.status });
    }
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}