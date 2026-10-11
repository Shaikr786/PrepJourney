import Link from "next/link";
import { BlogForm } from "@/components/blog/blog-form";

export default function NewBlogPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Link href="/blog" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
        ← Reflections
      </Link>
      <BlogForm mode="create" />
    </div>
  );
}
