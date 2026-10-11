"use client";

import { useTransition } from "react";
import { setSkillLevel, deleteSkill } from "@/lib/actions/skills";
import { formatDuration } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function SkillRow({
  id,
  name,
  typeLabel,
  level,
  sessionCount,
  totalMinutes,
  lastPracticed,
  source,
}: {
  id: string;
  name: string;
  typeLabel: string;
  level: number;
  sessionCount: number;
  totalMinutes: number;
  lastPracticed: string | null;
  source: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold text-slate-900 dark:text-white">{name}</p>
            <p className="text-xs text-slate-500">
              {typeLabel}
              {source === "auto" ? " · from sessions" : " · manual"}
              {" · "}
              {sessionCount} session{sessionCount !== 1 ? "s" : ""}
              {" · "}
              {formatDuration(totalMinutes)}
              {lastPracticed && ` · last ${lastPracticed}`}
            </p>
          </div>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-red-600 shrink-0"
            disabled={isPending}
            onClick={() => {
              if (confirm(`Remove skill “${name}”?`)) {
                startTransition(async () => {
                  await deleteSkill(id);
                });
              }
            }}
          >
            Remove
          </Button>
        </div>

        {/* Level 1–5 */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-slate-500 w-10">Level</span>
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              disabled={isPending}
              title={`Set level ${n}`}
              onClick={() => {
                startTransition(async () => {
                  await setSkillLevel(id, n);
                });
              }}
              className={`h-2.5 flex-1 rounded-full transition ${
                n <= level
                  ? "bg-emerald-500"
                  : "bg-slate-200 dark:bg-slate-700"
              }`}
            />
          ))}
          <span className="text-xs font-medium text-slate-600 dark:text-slate-300 w-6 text-right">
            {level}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
