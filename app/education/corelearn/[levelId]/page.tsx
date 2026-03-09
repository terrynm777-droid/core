import Link from "next/link";
import { notFound } from "next/navigation";
import { coreLearnContent } from "../content";
import { createClient } from "@/lib/supabase/server";

export default async function CoreLearnLevelPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;
  const level = coreLearnContent.find((item) => item.id === levelId);

  if (!level) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  let completedLessonCount = 0;
  let certificateCode: string | null = null;
  let completedLessons = new Set<string>();

  if (auth?.user) {
    const { data: progressRows } = await supabase
      .from("education_lesson_progress")
      .select("lesson_slug, completed")
      .eq("user_id", auth.user.id)
      .eq("product_slug", "corelearn")
      .eq("level_id", levelId)
      .eq("completed", true);

    completedLessonCount = progressRows?.length ?? 0;
    completedLessons = new Set((progressRows ?? []).map((row) => row.lesson_slug));

    const { data: cert } = await supabase
      .from("education_certificates")
      .select("certificate_code")
      .eq("user_id", auth.user.id)
      .eq("product_slug", "corelearn")
      .eq("level_id", levelId)
      .maybeSingle();

    certificateCode = cert?.certificate_code ?? null;
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] px-6 py-10 text-[#0B0F0E]">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/education/corelearn"
          className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium text-[#0B0F0E] hover:bg-[#F7FAF8]"
        >
          Back to CORELEARN
        </Link>

        <div className="mt-6 max-w-3xl">
          <div className="text-4xl font-semibold leading-tight text-[#0B0F0E]">{level.title}</div>
          <p className="mt-4 text-lg leading-8 text-[#37413D]">{level.desc}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-[#D7E4DD] bg-white p-5 text-sm text-[#37413D] shadow-sm">
          Progress: {completedLessonCount} / {level.lessons.length} lessons completed
        </div>

        <div className="mt-10 grid gap-5">
          {level.lessons.map((lesson, i) => {
            const isDone = completedLessons.has(lesson.slug);

            return (
              <div
                key={lesson.slug}
                className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm text-[#6B7A74]">Lesson {i + 1}</div>
                  <div
                    className={[
                      "rounded-2xl border px-3 py-1 text-xs font-medium",
                      isDone
                        ? "border-[#BFE8CF] bg-[#E9F9EF] text-[#16A34A]"
                        : "border-[#D7E4DD] bg-[#F7FAF8] text-[#6B7A74]",
                    ].join(" ")}
                  >
                    {isDone ? "Completed" : "Not completed"}
                  </div>
                </div>

                <div className="mt-2 text-xl font-semibold text-[#0B0F0E]">{lesson.title}</div>
                <p className="mt-3 text-sm leading-6 text-[#37413D]">{lesson.desc}</p>

                <div className="mt-5 flex gap-3">
                  <Link
                    href={`/education/corelearn/${level.id}/${lesson.slug}`}
                    className="inline-flex rounded-2xl bg-[#22C55E] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Open lesson
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex gap-3">
          <Link
            href={`/education/corelearn/${level.id}/quiz`}
            className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium text-[#0B0F0E] hover:bg-[#F7FAF8]"
          >
            Take mini quiz
          </Link>

          {certificateCode ? (
            <Link
              href={`/education/corelearn/${level.id}/certificate`}
              className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium text-[#0B0F0E] hover:bg-[#F7FAF8]"
            >
              View certificate
            </Link>
          ) : null}
        </div>
      </div>
    </main>
  );
}