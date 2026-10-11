"use client";

import { useActionState } from "react";
import { createNote, type NoteActionState } from "@/lib/actions/notes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function NoteForm() {
  const [state, formAction, isPending] = useActionState(createNote, {} as NoteActionState);

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Note</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title (optional)</Label>
            <Input id="title" name="title" placeholder="Quick note title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content *</Label>
            <textarea
              id="content"
              name="content"
              rows={5}
              required
              placeholder="Write a note to yourself…"
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" name="tags" placeholder="java, interview, todo" />
          </div>
          <div className="flex items-center gap-2">
            <input id="isPinned" name="isPinned" type="checkbox" className="h-4 w-4 rounded" />
            <Label htmlFor="isPinned" className="font-normal">Pin this note</Label>
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save Note"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
