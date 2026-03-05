import { z } from "zod";

export const CreatePostSchema = z
  .object({
    content: z.string().min(1).max(500),
  })
  .strict(); // rejects weird extra fields

export type CreatePostInput = z.infer<typeof CreatePostSchema>;