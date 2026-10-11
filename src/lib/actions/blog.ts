"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { blogSchema, slugify } from "@/lib/validations/blog";

export type BlogActionState = {
  error?: string;
  success?: boolean;
};

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function createBlogPost(
  _prev: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    excerpt: (formData.get("excerpt") as string) || undefined,
    tags: (formData.get("tags") as string) || undefined,
    isPublished: formData.get("isPublished") === "on" || formData.get("isPublished") === "true",
  };

  const parsed = blogSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  const baseSlug = slugify(parsed.data.title);
  let slug = baseSlug;
  let attempt = 0;
  while (true) {
    const exists = await prisma.blogPost.findUnique({
      where: { userId_slug: { userId: session.user.id, slug } },
    });
    if (!exists) break;
    attempt++;
    slug = `${baseSlug}-${attempt}`;
  }

  await prisma.blogPost.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      slug,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt || null,
      tags: parseTags(parsed.data.tags),
      isPublished: parsed.data.isPublished,
      publishedAt: parsed.data.isPublished ? new Date() : null,
    },
  });

  revalidatePath("/blog");
  redirect("/blog");
}

export async function updateBlogPost(
  id: string,
  _prev: BlogActionState,
  formData: FormData
): Promise<BlogActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const existing = await prisma.blogPost.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { error: "Post not found" };

  const raw = {
    title: formData.get("title") as string,
    content: formData.get("content") as string,
    excerpt: (formData.get("excerpt") as string) || undefined,
    tags: (formData.get("tags") as string) || undefined,
    isPublished: formData.get("isPublished") === "on" || formData.get("isPublished") === "true",
  };

  const parsed = blogSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  await prisma.blogPost.update({
    where: { id },
    data: {
      title: parsed.data.title,
      content: parsed.data.content,
      excerpt: parsed.data.excerpt || null,
      tags: parseTags(parsed.data.tags),
      isPublished: parsed.data.isPublished,
      publishedAt: parsed.data.isPublished
        ? existing.publishedAt || new Date()
        : null,
    },
  });

  revalidatePath("/blog");
  redirect("/blog");
}

export async function deleteBlogPost(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.blogPost.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/blog");
}
