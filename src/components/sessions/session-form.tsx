"use client";

import { useActionState } from "react";
import { createSession, updateSession, type SessionActionState } from "@/lib/actions/sessions";
import { categories, confidenceLevels } from "@/lib/validations/session";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileUpload } from "@/components/sessions/file-upload";

type SessionFormProps = {
  mode: "create" | "edit";
  sessionId?: string;
  initial?: {
    title?: string;
    topic?: string;
    category?: string;
    date?: string;
    durationMinutes?: number;
    conceptsCovered?: string[];
    practiceNotes?: string | null;
    keyTakeaway?: string | null;
    confidence?: string;
    revisionNeeded?: boolean;
    nextStep?: string | null;
  };
  defaultDuration?: number; // from timer
  defaultTopic?: string;
};

const confidenceLabels: Record<string, string> = {
  LEARNING: "Learning – I understand when looking at notes",
  PRACTICED: "Practiced – I wrote working examples",
  REVISION: "Revision – I can recall without notes",
  INTERVIEW_READY: "Interview-ready – I can explain + answer follow-ups",
};

export function SessionForm({
  mode,
  sessionId,
  initial,
  defaultDuration,
  defaultTopic,
}: SessionFormProps) {
  const action =
    mode === "edit" && sessionId
      ? updateSession.bind(null, sessionId)
      : createSession;

  const [state, formAction, isPending] = useActionState(
    action as (prev: SessionActionState, formData: FormData) => Promise<SessionActionState>,
    {}
  );

  const today = new Date().toISOString().slice(0, 10);
  const fromTimer = typeof defaultDuration === "number" && defaultDuration > 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {mode === "create" ? "Log a Learning Session" : "Edit Session"}
        </CardTitle>
        {fromTimer && mode === "create" && (
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">
            Duration filled from your timer ({defaultDuration} min). Add a title and save to keep this session.
          </p>
        )}
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                name="title"
                placeholder="e.g. Java Constructors deep dive"
                defaultValue={initial?.title || (defaultTopic ? `${defaultTopic} session` : "")}
                required
              />
              {state.fieldErrors?.title && (
                <p className="text-xs text-red-600">{state.fieldErrors.title[0]}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                name="topic"
                placeholder="e.g. Java constructors"
                defaultValue={initial?.topic || defaultTopic}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <select
                id="category"
                name="category"
                defaultValue={initial?.category || "JAVA"}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                required
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c.replace("_", " ")}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                name="date"
                type="date"
                defaultValue={initial?.date || today}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="durationMinutes">Duration (minutes) *</Label>
              <Input
                id="durationMinutes"
                name="durationMinutes"
                type="number"
                min={1}
                max={600}
                defaultValue={initial?.durationMinutes || defaultDuration || 30}
                required
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="conceptsCovered">
                Concepts Covered (comma-separated)
              </Label>
              <Input
                id="conceptsCovered"
                name="conceptsCovered"
                placeholder="default constructor, parameterized, private constructor"
                defaultValue={initial?.conceptsCovered?.join(", ")}
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="practiceNotes">Practice Notes</Label>
              <textarea
                id="practiceNotes"
                name="practiceNotes"
                rows={3}
                placeholder="What did you implement or try?"
                defaultValue={initial?.practiceNotes || ""}
                className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="keyTakeaway">Key Takeaway</Label>
              <textarea
                id="keyTakeaway"
                name="keyTakeaway"
                rows={2}
                placeholder="One sentence you would say in an interview"
                defaultValue={initial?.keyTakeaway || ""}
                className="flex w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="confidence">Confidence Level *</Label>
              <select
                id="confidence"
                name="confidence"
                defaultValue={initial?.confidence || "LEARNING"}
                className="flex h-10 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900"
                required
              >
                {confidenceLevels.map((c) => (
                  <option key={c} value={c}>
                    {confidenceLabels[c]}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="nextStep">Next Step</Label>
              <Input
                id="nextStep"
                name="nextStep"
                placeholder="What will you do next with this topic?"
                defaultValue={initial?.nextStep || ""}
              />
            </div>

            <div className="flex items-center gap-2 sm:col-span-2">
              <input
                id="revisionNeeded"
                name="revisionNeeded"
                type="checkbox"
                defaultChecked={initial?.revisionNeeded}
                className="h-4 w-4 rounded border-slate-300"
              />
              <Label htmlFor="revisionNeeded" className="font-normal">
                Mark for revision (adds to revision queue)
              </Label>
            </div>
          </div>

          <div className="space-y-2 sm:col-span-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Label>Attachments (optional)</Label>
            <p className="text-xs text-slate-500 mb-2">
              Screenshots of code, notes, or a PDF of what you worked on.
            </p>
            <FileUpload sessionId={sessionId} />
          </div>

          {state.error && (
            <p className="text-sm text-red-600 dark:text-red-400">{state.error}</p>
          )}

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? "Saving..."
                : mode === "create"
                ? "Save Session"
                : "Update Session"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
