import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { BlogActions } from "@/components/blog/blog-actions";
import type { BlogPost as BlogPostRecord } from "@prisma/client";

export default async function BlogPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const posts = await prisma.blogPost.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reflections</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Technical write-ups and weekly retrospectives · {posts.length} posts
          </p>
        </div>
        <Link
          href="/blog/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Reflection
        </Link>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No reflections yet. Write about one concept you understood this week.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {posts.map((p: BlogPostRecord) => (
            <Card key={p.id}>
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          p.isPublished
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {p.isPublished ? "Published" : "Draft"}
                      </span>
                    </div>
                    {p.excerpt && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{p.excerpt}</p>
                    )}
                    <p className="text-xs text-slate-400">
                      {formatDate(p.updatedAt)}
                      {p.tags.length > 0 && ` · ${p.tags.join(", ")}`}
                    </p>
                  </div>
                  <BlogActions id={p.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
