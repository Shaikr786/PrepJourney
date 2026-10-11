import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BlogForm } from "@/components/blog/blog-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditBlogPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const post = await prisma.blogPost.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!post) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
        ← Reflections
      </Link>
      <BlogForm
        mode="edit"
        postId={post.id}
        initial={{
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          tags: post.tags,
          isPublished: post.isPublished,
        }}
      />
    </div>
  );
}
