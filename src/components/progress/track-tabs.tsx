"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "interview", label: "Interview" },
  { id: "exam", label: "Exams (GATE-style)" },
  { id: "career", label: "Career growth" },
] as const;

export function TrackTabs({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
      {TABS.map((t) => (
        <Link
          key={t.id}
          href={`/progress?track=${t.id}`}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition",
            active === t.id
              ? "bg-blue-600 text-white"
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          )}
        >
          {t.label}
        </Link>
      ))}
    </div>
  );
}
