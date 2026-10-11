import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  PREP_TRACKS,
  aggregateByCategory,
  computeSubjectProgress,
  trackOverallPercent,
  confidenceLabel,
} from "@/lib/progress";
import { formatDuration } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrackTabs } from "@/components/progress/track-tabs";

export default async function ProgressPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const trackId = params.track || "interview";
  const track =
    PREP_TRACKS.find((t) => t.id === trackId) || PREP_TRACKS[0];

  const sessions = await prisma.learningSession.findMany({
    where: { userId: session.user.id },
    select: {
      category: true,
      durationMinutes: true,
      confidence: true,
    },
  });

  const agg = aggregateByCategory(sessions);
  const subjects = track.subjects.map((s) =>
    computeSubjectProgress(s, agg.get(s.category))
  );
  const overall = trackOverallPercent(subjects);
  const started = subjects.filter((s) => s.sessionCount > 0).length;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          Preparation progress
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Completion % updates automatically from your sessions — time logged +
          confidence depth. No manual level needed.
        </p>
      </div>

      <TrackTabs active={track.id} />

      {/* Overall ring-style summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="sm:col-span-1">
          <CardContent className="p-5 flex flex-col items-center justify-center text-center">
            <div className="relative h-28 w-28">
              <svg className="h-28 w-28 -rotate-90" viewBox="0 0 36 36">
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-slate-200 dark:stroke-slate-700"
                  strokeWidth="3"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  className="stroke-emerald-500 transition-all duration-1000"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${overall} 100`}
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-900 dark:text-white">
                {overall}%
              </span>
            </div>
            <p className="mt-2 text-sm font-medium text-slate-700 dark:text-slate-200">
              {track.name}
            </p>
            <p className="text-xs text-slate-500">Overall completion</p>
          </CardContent>
        </Card>

        <Card className="sm:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Track snapshot</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <p>{track.description}</p>
            <p>
              <span className="font-semibold text-slate-900 dark:text-white">
                {started}
              </span>{" "}
              of {subjects.length} subjects started
            </p>
            <p className="text-xs text-slate-500">
              Each subject bar = half from hours toward a ~10h goal, half from
              average confidence (Learning → Interview-ready).
            </p>
            <Link
              href="/sessions/new"
              className="inline-block text-blue-600 dark:text-blue-400 hover:underline text-sm"
            >
              Log a session to raise % →
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Subject list */}
      <div className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">
          Subjects in this path
        </h2>
        {subjects.map((s) => (
          <Card key={s.category}>
            <CardContent className="p-4 space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">
                    {s.label}
                  </p>
                  <p className="text-xs text-slate-500">
                    {s.sessionCount === 0
                      ? "Not started"
                      : `${s.sessionCount} session${s.sessionCount !== 1 ? "s" : ""} · ${formatDuration(s.totalMinutes)} · ${confidenceLabel(s.bestConfidence)}`}
                  </p>
                </div>
                <span className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
                  {s.percent}%
                </span>
              </div>

              {/* Main completion bar */}
              <div className="h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-500 transition-all duration-700"
                  style={{ width: `${s.percent}%` }}
                />
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500">
                <div>
                  <span className="text-slate-400">Time goal </span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {s.timePercent}%
                  </span>
                  <div className="mt-0.5 h-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-blue-400"
                      style={{ width: `${s.timePercent}%` }}
                    />
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Confidence </span>
                  <span className="font-medium text-slate-600 dark:text-slate-300">
                    {s.confidencePercent}%
                  </span>
                  <div className="mt-0.5 h-1 rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-violet-400"
                      style={{ width: `${s.confidencePercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {s.remainingHints.length > 0 && (
                <ul className="text-xs text-slate-500 space-y-0.5 border-t border-slate-100 dark:border-slate-800 pt-2">
                  {s.remainingHints.map((h, i) => (
                    <li key={i}>→ {h}</li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
