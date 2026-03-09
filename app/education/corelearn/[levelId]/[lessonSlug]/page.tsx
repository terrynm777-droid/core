import Link from "next/link";
import { notFound } from "next/navigation";
import { coreLearnContent } from "../../content";
import LessonViewer from "./LessonViewer";
import { createClient } from "@/lib/supabase/server";

export default async function CoreLearnLessonPage({
  params,
}: {
  params: Promise<{ levelId: string; lessonSlug: string }>;
}) {
  const { levelId, lessonSlug } = await params;

  const level = coreLearnContent.find((item) => item.id === levelId);
  if (!level) notFound();

  const lesson = level.lessons.find((item) => item.slug === lessonSlug);
  if (!lesson) notFound();

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();

  let initialCompleted = false;

  if (auth?.user) {
    const { data: progress } = await supabase
      .from("education_lesson_progress")
      .select("completed")
      .eq("user_id", auth.user.id)
      .eq("product_slug", "corelearn")
      .eq("level_id", levelId)
      .eq("lesson_slug", lessonSlug)
      .maybeSingle();

    initialCompleted = !!progress?.completed;
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

        <LessonViewer
          level={level}
          lesson={lesson}
          initialCompleted={initialCompleted}
        />
      </div>
    </main>
  );
}