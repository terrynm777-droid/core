import { z } from "zod";

export const CompleteLessonSchema = z.object({
  levelId: z.string().min(1).max(64),
  lessonSlug: z.string().min(1).max(128),
}).strict();

export const SubmitLevelQuizSchema = z.object({
  levelId: z.string().min(1).max(64),
  answers: z.array(z.number().int().min(0).max(10)).max(50),
}).strict();