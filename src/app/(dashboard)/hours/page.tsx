import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDuration } from "@/lib/utils";
import { calculateStreak, toDayKey } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ContributionCalendar, type DayActivity } from "@/components/streak/contribution-calendar";

export default async function ActivityPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const year = new Date().getFullYear();

  const sessions = await prisma.learningSession.findMany({
    where: { userId },
    orderBy: { date: "desc" },
    select: {
      id: true,
      title: true,
      topic: true,
      category: true,
      date: true,
      durationMinutes: true,
      confidence: true,
    },
  });

  const totalMinutes = sessions.reduce((s, x) => s + x.durationMinutes, 0);
  const streak = calculateStreak(sessions.map((s) => s.date));

  // Group by day key (IST)
  const byDay = new Map<string, DayActivity>();
  for (const s of sessions) {
    const key = toDayKey(s.date);
    let entry = byDay.get(key);
    if (!entry) {
      entry = { dateKey: key, minutes: 0, sessions: [] };
      byDay.set(key, entry);
    }
    entry.minutes += s.durationMinutes;
    entry.sessions.push({
      id: s.id,
      title: s.title,
      topic: s.topic,
      durationMinutes: s.durationMinutes,
      category: s.category,
      confidence: s.confidence,
    });
  }

  const days = Array.from(byDay.values());

  return (
    <div className="space-y-6 w-full">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          Activity & streak
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Total logged:{" "}
          <span className="font-semibold text-slate-900 dark:text-white">
            {formatDuration(totalMinutes)}
          </span>
          {" · "}
          Current streak:{" "}
          <span className="font-semibold text-orange-600">
            {streak} day{streak !== 1 ? "s" : ""}
          </span>
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{year} contribution</CardTitle>
          <p className="text-sm text-slate-500">
            Each square is a day. Darker green = more time logged. Click a day to see
            sessions for that date only.
          </p>
        </CardHeader>
        <CardContent>
          <ContributionCalendar days={days} year={year} />
        </CardContent>
      </Card>
    </div>
  );
}
