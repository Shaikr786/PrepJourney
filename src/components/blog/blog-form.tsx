"use client";

import { useActionState } from "react";
import { createBlogPost, updateBlogPost, type BlogActionState } from "@/lib/actions/blog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  mode: "create" | "edit";
  postId?: string;
  initial?: {
    title?: string;
    content?: string;
    excerpt?: string | null;
    tags?: string[];
    isPublished?: boolean;
  };
};

export function BlogForm({ mode, postId, initial }: Props) {
  const action =
    mode === "edit" && postId
      ? updateBlogPost.bind(null, postId)
      : createBlogPost;

  const [state, formAction, isPending] = useActionState(
    action as (prev: BlogActionState, fd: FormData) => Promise<BlogActionState>,
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "New Reflection" : "Edit Reflection"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required defaultValue={initial?.title} placeholder="What I learned about Java constructors" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="excerpt">Excerpt (optional)</Label>
            <Input id="excerpt" name="excerpt" defaultValue={initial?.excerpt || ""} placeholder="Short summary for the list" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <textarea
              id="content"
              name="content"
              rows={12}
              required
              defaultValue={initial?.content}
              placeholder="Write your reflection, explanation, or weekly retrospective…"
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" name="tags" defaultValue={initial?.tags?.join(", ")} placeholder="java, dsa, interview" />
          </div>
          <div className="flex items-center gap-2">
            <input
              id="isPublished"
              name="isPublished"
              type="checkbox"
              defaultChecked={initial?.isPublished}
              className="h-4 w-4 rounded"
            />
            <Label htmlFor="isPublished" className="font-normal">
              Mark as published (visible in public profile later)
            </Label>
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : mode === "create" ? "Save Reflection" : "Update"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
