"use client";

import { useTransition } from "react";
import { deleteBlogPost } from "@/lib/actions/blog";
import Link from "next/link";

export function BlogActions({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-3">
      <Link href={`/blog/${id}/edit`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        Edit
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this reflection?")) {
            startTransition(() => deleteBlogPost(id));
          }
        }}
        className="text-sm text-red-600 hover:underline dark:text-red-400 disabled:opacity-50"
      >
        {isPending ? "…" : "Delete"}
      </button>
    </div>
  );
}
