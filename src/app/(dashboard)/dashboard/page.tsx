import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookOpen, Clock, Target, Trophy, Flame } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDuration, formatDate } from "@/lib/utils";
import { calculateStreak } from "@/lib/scoring";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const firstName = session.user.name?.split(" ")[0] || "there";

  const [sessionsAgg, problemsSolved, recentSessions, allDates] =
    await Promise.all([
      prisma.learningSession.aggregate({
        where: { userId },
        _sum: { durationMinutes: true, scorePoints: true },
        _count: true,
      }),
      prisma.dsaProblem.count({
        where: { userId, status: "SOLVED" },
      }),
      prisma.learningSession.findMany({
        where: { userId },
        orderBy: { date: "desc" },
        take: 5,
        select: {
          id: true,
          title: true,
          topic: true,
          durationMinutes: true,
          scorePoints: true,
          date: true,
        },
      }),
      prisma.learningSession.findMany({
        where: { userId },
        select: { date: true },
        orderBy: { date: "desc" },
        take: 90,
      }),
    ]);

  const totalMinutes = sessionsAgg._sum.durationMinutes || 0;
  const totalScore = sessionsAgg._sum.scorePoints || 0;
  const totalSessions = sessionsAgg._count || 0;
  const streak = calculateStreak(allDates.map((d) => d.date));

  const metrics = [
    {
      label: "Total hours",
      value: formatDuration(totalMinutes),
      icon: Clock,
      color: "text-blue-600",
      href: "/hours",
      hint: "Calendar view",
    },
    {
      label: "Sessions",
      value: String(totalSessions),
      icon: BookOpen,
      color: "text-emerald-600",
      href: "/sessions",
      hint: "All logs",
    },
    {
      label: "Problems solved",
      value: String(problemsSolved),
      icon: Target,
      color: "text-violet-600",
      href: "/dsa?status=SOLVED",
      hint: "DSA list",
    },
    {
      label: "Score points",
      value: totalScore.toFixed(1),
      icon: Trophy,
      color: "text-amber-600",
      href: "/leaderboard",
      hint: "Weekly ranking",
    },
    {
      label: "Current streak",
      value: streak > 0 ? `${streak}d` : "0d",
      icon: Flame,
      color: "text-orange-600",
      href: "/hours",
      hint: "Calendar view",
    },
  ];

  return (
    <div className="space-y-6 w-full">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Your preparation journey at a glance · click a metric for details
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {metrics.map((m) => (
          <Link key={m.label} href={m.href} className="group block h-full">
            <Card className="h-full hover:shadow-md transition-shadow hover:border-blue-300 dark:hover:border-blue-700">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-500">{m.label}</p>
                    <p className="mt-1 text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                      {m.value}
                    </p>
                  </div>
                  <m.icon className={`h-5 w-5 shrink-0 ${m.color} opacity-80`} />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400 group-hover:text-blue-500">
                  {m.hint} →
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">Recent sessions</CardTitle>
            <Link href="/sessions" className="text-sm text-blue-600 hover:underline dark:text-blue-400">
              View all
            </Link>
          </CardHeader>
          <CardContent>
            {recentSessions.length === 0 ? (
              <p className="text-sm text-slate-500 py-4">
                No sessions yet.{" "}
                <Link href="/timer" className="text-blue-600 hover:underline">
                  Start the timer
                </Link>
                .
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentSessions.map((s) => (
                  <li key={s.id} className="py-3 first:pt-0 last:pb-0">
                    <Link
                      href={`/sessions/${s.id}/edit`}
                      className="flex items-center justify-between gap-3 group"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-white truncate group-hover:text-blue-600">
                          {s.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDate(s.date)} · {s.topic} · {formatDuration(s.durationMinutes)}
                        </p>
                      </div>
                      <span className="text-xs font-medium text-amber-600 shrink-0">
                        {s.scorePoints} pts
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Quick actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            <Link
              href="/timer"
              className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white text-center hover:bg-blue-700"
            >
              Start timer
            </Link>
            <Link
              href="/sessions/new"
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-medium text-center hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Add session
            </Link>
            <Link
              href="/practice"
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-medium text-center hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Practice record
            </Link>
            <Link
              href="/files"
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-medium text-center hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Your files
            </Link>
            <Link
              href="/dsa/new"
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-medium text-center hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Log DSA problem
            </Link>
            <Link
              href="/progress"
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm font-medium text-center hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              Progress %
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
