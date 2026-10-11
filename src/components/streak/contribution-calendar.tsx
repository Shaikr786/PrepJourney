"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type DayActivity = {
  dateKey: string; // YYYY-MM-DD
  minutes: number;
  sessions: {
    id: string;
    title: string;
    topic: string;
    durationMinutes: number;
    category: string;
    confidence: string;
  }[];
};

type Props = {
  days: DayActivity[];
  year?: number;
};

function levelFromMinutes(m: number): 0 | 1 | 2 | 3 | 4 {
  if (m <= 0) return 0;
  if (m < 30) return 1;
  if (m < 60) return 2;
  if (m < 120) return 3;
  return 4;
}

const LEVEL_CLASS = [
  "bg-slate-200 dark:bg-slate-800",
  "bg-emerald-200 dark:bg-emerald-900",
  "bg-emerald-300 dark:bg-emerald-700",
  "bg-emerald-500 dark:bg-emerald-500",
  "bg-emerald-700 dark:bg-emerald-400",
];

export function ContributionCalendar({ days, year }: Props) {
  const y = year ?? new Date().getFullYear();
  const map = useMemo(() => {
    const m = new Map<string, DayActivity>();
    for (const d of days) m.set(d.dateKey, d);
    return m;
  }, [days]);

  const [selected, setSelected] = useState<string | null>(null);

  // Build weeks for the year (Sun–Sat columns like GitHub)
  const start = new Date(y, 0, 1);
  const end = new Date(y, 11, 31);
  // Align to Sunday before/on Jan 1
  const gridStart = new Date(start);
  gridStart.setDate(start.getDate() - start.getDay());

  const weeks: { key: string; minutes: number }[][] = [];
  const cur = new Date(gridStart);
  while (cur <= end || cur.getDay() !== 0) {
    const week: { key: string; minutes: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const key = cur.toLocaleDateString("en-CA"); // YYYY-MM-DD local
      const inYear = cur.getFullYear() === y;
      const minutes = inYear ? map.get(key)?.minutes ?? 0 : -1;
      week.push({ key, minutes });
      cur.setDate(cur.getDate() + 1);
    }
    weeks.push(week);
    if (cur > end && cur.getDay() === 0) break;
    if (weeks.length > 54) break;
  }

  const selectedDay = selected ? map.get(selected) : null;
  const totalActiveDays = days.filter((d) => d.minutes > 0).length;

  const monthLabels = useMemo(() => {
    const labels: { name: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeks.forEach((week, wi) => {
      const mid = week[3];
      if (!mid || mid.minutes < 0) return;
      const d = new Date(mid.key + "T12:00:00");
      if (d.getFullYear() !== y) return;
      const mo = d.getMonth();
      if (mo !== lastMonth) {
        labels.push({
          name: d.toLocaleString("en", { month: "short" }),
          weekIndex: wi,
        });
        lastMonth = mo;
      }
    });
    return labels;
  }, [weeks, y]);

  return (
    <div className="space-y-6 w-full">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm text-slate-500">
          <span className="font-semibold text-slate-900 dark:text-white">
            {totalActiveDays}
          </span>{" "}
          active day{totalActiveDays !== 1 ? "s" : ""} in {y}
        </p>
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span>Less</span>
          {LEVEL_CLASS.map((c, i) => (
            <span key={i} className={cn("h-3 w-3 rounded-sm", c)} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="inline-block min-w-max">
          {/* Month labels */}
          <div className="relative h-5 mb-1 ml-8">
            {monthLabels.map((m) => (
              <span
                key={m.name + m.weekIndex}
                className="absolute text-[10px] text-slate-500"
                style={{ left: `${m.weekIndex * 14}px` }}
              >
                {m.name}
              </span>
            ))}
          </div>

          <div className="flex gap-[3px]">
            {/* Weekday labels */}
            <div className="flex flex-col gap-[3px] pr-1 text-[10px] text-slate-500 justify-around h-[90px]">
              <span></span>
              <span>Mon</span>
              <span></span>
              <span>Wed</span>
              <span></span>
              <span>Fri</span>
              <span></span>
            </div>

            {weeks.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((cell) => {
                  if (cell.minutes < 0) {
                    return (
                      <span
                        key={cell.key + wi}
                        className="h-[11px] w-[11px] rounded-sm bg-transparent"
                      />
                    );
                  }
                  const level = levelFromMinutes(cell.minutes);
                  return (
                    <button
                      key={cell.key}
                      type="button"
                      title={`${cell.key}: ${cell.minutes} min`}
                      onClick={() =>
                        setSelected((s) => (s === cell.key ? null : cell.key))
                      }
                      className={cn(
                        "h-[11px] w-[11px] rounded-sm transition ring-offset-1",
                        LEVEL_CLASS[level],
                        selected === cell.key && "ring-2 ring-blue-500"
                      )}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Selected day detail — single source of truth, no duplicate filters */}
      {selected && (
        <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900 dark:text-white">
              {new Date(selected + "T12:00:00").toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </h3>
            <button
              type="button"
              className="text-xs text-slate-500 hover:underline"
              onClick={() => setSelected(null)}
            >
              Clear
            </button>
          </div>
          {!selectedDay || selectedDay.sessions.length === 0 ? (
            <p className="text-sm text-slate-500">No sessions logged this day.</p>
          ) : (
            <ul className="space-y-2">
              {selectedDay.sessions.map((s) => (
                <li key={s.id} className="text-sm flex justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      href={`/sessions/${s.id}/edit`}
                      className="font-medium text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {s.title}
                    </Link>
                    <p className="text-xs text-slate-500">
                      {s.topic} · {s.category.replace("_", " ")} ·{" "}
                      {s.confidence.replace("_", " ")}
                    </p>
                  </div>
                  <span className="shrink-0 text-slate-600 dark:text-slate-300">
                    {s.durationMinutes}m
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
