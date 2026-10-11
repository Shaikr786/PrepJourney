"use client";

import { useActionState } from "react";
import { createDsaProblem, updateDsaProblem, type DsaActionState } from "@/lib/actions/dsa";
import { difficulties, problemStatuses } from "@/lib/validations/dsa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Props = {
  mode: "create" | "edit";
  problemId?: string;
  initial?: {
    title?: string;
    link?: string | null;
    difficulty?: string;
    status?: string;
    topicTags?: string[];
    notes?: string | null;
    timeSpent?: number | null;
  };
};

export function DsaForm({ mode, problemId, initial }: Props) {
  const action =
    mode === "edit" && problemId
      ? updateDsaProblem.bind(null, problemId)
      : createDsaProblem;

  const [state, formAction, isPending] = useActionState(
    action as (prev: DsaActionState, fd: FormData) => Promise<DsaActionState>,
    {}
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{mode === "create" ? "Log DSA Problem" : "Edit Problem"}</CardTitle>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input id="title" name="title" required defaultValue={initial?.title} placeholder="Two Sum" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="link">Link (LeetCode / GFG / etc.)</Label>
            <Input id="link" name="link" type="url" defaultValue={initial?.link || ""} placeholder="https://leetcode.com/problems/..." />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <select
                id="difficulty"
                name="difficulty"
                defaultValue={initial?.difficulty || "MEDIUM"}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                required
              >
                {difficulties.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                name="status"
                defaultValue={initial?.status || "TODO"}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                required
              >
                {problemStatuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="topicTags">Topic Tags (comma-separated)</Label>
            <Input id="topicTags" name="topicTags" defaultValue={initial?.topicTags?.join(", ")} placeholder="array, hash-map, two-pointers" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="timeSpent">Time Spent (minutes)</Label>
            <Input id="timeSpent" name="timeSpent" type="number" min={0} defaultValue={initial?.timeSpent || ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <textarea
              id="notes"
              name="notes"
              rows={3}
              defaultValue={initial?.notes || ""}
              placeholder="Approach, edge cases, what you learned…"
              className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
            />
          </div>
          {state.error && <p className="text-sm text-red-600">{state.error}</p>}
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : mode === "create" ? "Save Problem" : "Update"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
