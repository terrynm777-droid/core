import { coreLearnContent } from "@/app/education/corelearn/content";

export function isCourseComplete({
  lessonRows,
  quizRows,
}: {
  lessonRows: { level_id: string; lesson_slug: string }[];
  quizRows: { level_id: string; passed: boolean | null }[];
}) {
  const completedSet = new Set(
    lessonRows.map((row) => `${row.level_id}:${row.lesson_slug}`)
  );

  const allLessonsComplete = coreLearnContent.every((level) =>
    level.lessons.every((lesson) =>
      completedSet.has(`${level.id}:${lesson.slug}`)
    )
  );

  const passedSet = new Set(
    quizRows.filter((row) => row.passed).map((row) => row.level_id)
  );

  const allQuizzesPassed = coreLearnContent.every((level) =>
    passedSet.has(level.id)
  );

  return allLessonsComplete && allQuizzesPassed;
}