import Link from "next/link";
import { notFound } from "next/navigation";
import { coreLearnContent } from "../../content";
import LevelQuizClient from "./LevelQuizClient";
import { createClient } from "@/lib/supabase/server";

export default async function LevelQuizPage({
  params,
}: {
  params: Promise<{ levelId: string }>;
}) {
  const { levelId } = await params;
  const level = coreLearnContent.find((item) => item.id === levelId);

  if (!level) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  let initialScore: number | null = null;
  let initialTotal: number | null = null;
  let initialPassed = false;

  if (auth?.user) {
    const { data: attempt } = await supabase
      .from("education_level_quiz_attempts")
      .select("score,total,passed")
      .eq("user_id", auth.user.id)
      .eq("product_slug", "corelearn")
      .eq("level_id", levelId)
      .maybeSingle();

    if (attempt) {
      initialScore = attempt.score;
      initialTotal = attempt.total;
      initialPassed = attempt.passed;
    }
  }

  return (
    <main className="min-h-screen bg-[#F7FAF8] px-6 py-10 text-[#0B0F0E]">
      <div className="mx-auto max-w-4xl">
        <Link
          href={`/education/corelearn/${level.id}`}
          className="inline-flex rounded-2xl border border-[#D7E4DD] bg-white px-4 py-2 text-sm font-medium text-[#0B0F0E] hover:bg-[#F7FAF8]"
        >
          Back to level
        </Link>

        <LevelQuizClient
          level={level}
          initialScore={initialScore}
          initialTotal={initialTotal}
          initialPassed={initialPassed}
          initialCertificateCode={null}
        />
      </div>
    </main>
  );
}