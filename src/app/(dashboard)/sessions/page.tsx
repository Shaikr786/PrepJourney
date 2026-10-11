import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDateLong, formatDuration } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteSessionButton } from "@/components/sessions/delete-button";

const confidenceBadge: Record<string, string> = {
  LEARNING: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  PRACTICED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  REVISION: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  INTERVIEW_READY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
};

export default async function SessionsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const sessions = await prisma.learningSession.findMany({
    where: { userId: session.user.id },
    orderBy: { date: "desc" },
    take: 50,
  });

  const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const totalScore = sessions.reduce((sum, s) => sum + s.scorePoints, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Learning Sessions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {sessions.length} sessions · {formatDuration(totalMinutes)} ·{" "}
            {totalScore.toFixed(1)} pts
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/export/sessions"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Export CSV
          </a>
          <Link
            href="/sessions/new"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition"
          >
            + Add Session
          </Link>
        </div>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4">
              No sessions yet. Log your first study block or start the timer.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/sessions/new"
                className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Add Session
              </Link>
              <Link
                href="/timer"
                className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Start Timer
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sessions.map((s) => (
            <Card key={s.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                        {s.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          confidenceBadge[s.confidence] || confidenceBadge.LEARNING
                        }`}
                      >
                        {s.confidence.replace("_", " ")}
                      </span>
                      {s.revisionNeeded && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300">
                          Revision
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {s.topic} · {s.category.replace("_", " ")} · {formatDateLong(s.date)} ·{" "}
                      {formatDuration(s.durationMinutes)} · {s.scorePoints} pts
                    </p>
                    {s.keyTakeaway && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
                        {s.keyTakeaway}
                      </p>
                    )}
                    {s.conceptsCovered.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {s.conceptsCovered.map((c) => (
                          <span
                            key={c}
                            className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 shrink-0 items-center">
                    <Link
                      href={`/sessions/${s.id}/edit`}
                      className="text-sm text-blue-600 hover:underline dark:text-blue-400"
                    >
                      Edit
                    </Link>
                    <DeleteSessionButton id={s.id} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
