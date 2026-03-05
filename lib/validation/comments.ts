import { z } from "zod";

export const CreateCommentSchema = z
  .object({
    postId: z.string().uuid(),
    content: z.string().min(1).max(1000),
  })
  .strict();

export type CreateCommentInput = z.infer<typeof CreateCommentSchema>;