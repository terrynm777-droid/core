import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { coreLearnContent } from "../content";

export default async function CoreLearnDashboardPage() {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    return (
      <main className="min-h-screen px-6 py-10">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-3xl border border-[#D7E4DD] bg-white p-8 shadow-sm">
            <h1 className="text-3xl font-semibold">CORELEARN Dashboard</h1>
            <p className="mt-4 text-[#4B5B55]">
              Log in to track your course progress.
            </p>
            <div className="mt-6">
              <Link
                href="/auth?next=/education/corelearn/dashboard&mode=login"
                className="inline-flex rounded-2xl bg-[#22C55E] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { data: lessonRows } = await supabase
    .from("education_lesson_progress")
    .select("level_id, lesson_slug, completed")
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn")
    .eq("completed", true);

  const { data: quizRows } = await supabase
    .from("education_level_quiz_attempts")
    .select("level_id, score, total, passed")
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn");

  const { data: certRows } = await supabase
    .from("education_certificates")
    .select("level_id, certificate_code")
    .eq("user_id", auth.user.id)
    .eq("product_slug", "corelearn");

  const completedSet = new Set(
    (lessonRows ?? []).map((row) => `${row.level_id}:${row.lesson_slug}`)
  );

  const quizMap = new Map(
    (quizRows ?? []).map((row) => [row.level_id, row])
  );

  const certMap = new Map(
    (certRows ?? []).map((row) => [row.level_id, row.certificate_code])
  );

  const totalLessons = coreLearnContent.reduce((acc, level) => acc + level.lessons.length, 0);
  const doneLessons = lessonRows?.length ?? 0;
  const overallPct = totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0;

  return (
    <main className="min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-3xl">
          <div className="inline-flex rounded-2xl border border-[#D7E4DD] bg-[#E9F9EF] px-3 py-1 text-sm font-medium">
            CORELEARN
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight">
            Your learning dashboard
          </h1>
          <p className="mt-4 text-lg leading-8 text-[#4B5B55]">
            Track progress, continue levels, and see what is complete.
          </p>
        </div>

        <div className="mt-8 rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm">
          <div className="text-sm text-[#6B7A74]">Overall progress</div>
          <div className="mt-2 text-3xl font-semibold">{overallPct}%</div>
          <div className="mt-3 h-3 w-full overflow-hidden rounded-full bg-[#EEF4F0]">
            <div
              className="h-full rounded-full bg-[#22C55E]"
              style={{ width: `${overallPct}%` }}
            />
          </div>
          <div className="mt-3 text-sm text-[#4B5B55]">
            {doneLessons} / {totalLessons} lessons completed
          </div>
        </div>

        <div className="mt-8 grid gap-6">
          {coreLearnContent.map((level) => {
            const completedCount = level.lessons.filter((lesson) =>
              completedSet.has(`${level.id}:${lesson.slug}`)
            ).length;

            const levelPct =
              level.lessons.length > 0
                ? Math.round((completedCount / level.lessons.length) * 100)
                : 0;

            const quiz = quizMap.get(level.id) as
              | { level_id: string; score: number; total: number; passed: boolean }
              | undefined;

            const certCode = certMap.get(level.id);

            return (
              <div
                key={level.id}
                className="rounded-3xl border border-[#D7E4DD] bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="max-w-3xl">
                    <div className="text-xl font-semibold">{level.title}</div>
                    <p className="mt-3 text-sm leading-6 text-[#4B5B55]">
                      {level.desc}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] px-3 py-2 text-sm font-medium">
                    {completedCount} / {level.lessons.length} lessons
                  </div>
                </div>

                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-[#EEF4F0]">
                  <div
                    className="h-full rounded-full bg-[#22C55E]"
                    style={{ width: `${levelPct}%` }}
                  />
                </div>

                <div className="mt-4 flex flex-wrap gap-3 text-sm">
                  <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] px-3 py-2">
                    Quiz: {quiz ? `${quiz.score}/${quiz.total}` : "Not taken"}
                  </div>
                  <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] px-3 py-2">
                    Passed: {quiz?.passed ? "Yes" : "No"}
                  </div>
                  <div className="rounded-2xl border border-[#D7E4DD] bg-[#F7FAF8] px-3 py-2">
                    Certificate: {certCode ? "Issued" : "Not yet"}
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={`/education/corelearn/${level.id}`}
                    className="inline-flex rounded-2xl bg-[#22C55E] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                  >
                    Open level
                  </Link>

                  <Link
                    href={`/education/corelearn/${level.id}/quiz`}
                    className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:bg-[#F7FAF8]"
                  >
                    Quiz
                  </Link>

                  {certCode ? (
                    <Link
                      href={`/education/corelearn/${level.id}/certificate`}
                      className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium hover:bg-[#F7FAF8]"
                    >
                      Certificate
                    </Link>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}