import { z } from "zod";

export const noteSchema = z.object({
  title: z.string().max(120).optional(),
  content: z.string().min(1, "Content is required").max(5000),
  isPinned: z.coerce.boolean().default(false),
  tags: z.string().optional(), // comma-separated
});

export type NoteFormValues = z.infer<typeof noteSchema>;
