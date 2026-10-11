import { z } from "zod";

export const blogSchema = z.object({
  title: z.string().min(3, "Title is required").max(150),
  content: z.string().min(10, "Content is too short").max(20000),
  excerpt: z.string().max(300).optional(),
  tags: z.string().optional(),
  isPublished: z.coerce.boolean().default(false),
});

export type BlogFormValues = z.infer<typeof blogSchema>;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
