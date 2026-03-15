import { coreLearnContent } from "./content";

export const coreLearnLevels = coreLearnContent.map((level) => ({
  id: level.id,
  title: level.title,
  desc: level.desc,
  lessons: level.lessons.map((lesson) => ({
    slug: lesson.slug,
    title: lesson.title,
    desc: lesson.desc,
  })),
}));