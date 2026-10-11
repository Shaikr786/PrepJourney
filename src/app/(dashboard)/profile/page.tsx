import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDuration } from "@/lib/utils";
import { calculateStreak } from "@/lib/scoring";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;

  const [user, agg, dates, solved, fileCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true, createdAt: true },
    }),
    prisma.learningSession.aggregate({
      where: { userId },
      _sum: { durationMinutes: true, scorePoints: true },
      _count: true,
    }),
    prisma.learningSession.findMany({
      where: { userId },
      select: { date: true },
      orderBy: { date: "desc" },
      take: 90,
    }),
    prisma.dsaProblem.count({ where: { userId, status: "SOLVED" } }),
    prisma.attachment.count({ where: { userId } }),
  ]);

  const streak = calculateStreak(dates.map((d) => d.date));

  return (
    <div className="space-y-6 w-full max-w-2xl">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          Profile
        </h1>
        <p className="text-slate-500 mt-1 text-sm">Your account and prep summary</p>
      </div>

      <Card>
        <CardContent className="p-6 flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <User className="h-8 w-8" />
          </div>
          <div className="min-w-0 space-y-1">
            <p className="text-xl font-semibold text-slate-900 dark:text-white">
              {user?.name || "User"}
            </p>
            <p className="text-sm text-slate-500 break-all">{user?.email}</p>
            {user?.createdAt && (
              <p className="text-xs text-slate-400">Joined {formatDate(user.createdAt)}</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Prep snapshot</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Total hours</p>
            <p className="text-lg font-bold">{formatDuration(agg._sum.durationMinutes || 0)}</p>
          </div>
          <div>
            <p className="text-slate-500">Sessions</p>
            <p className="text-lg font-bold">{agg._count}</p>
          </div>
          <div>
            <p className="text-slate-500">Score points</p>
            <p className="text-lg font-bold">{(agg._sum.scorePoints || 0).toFixed(1)}</p>
          </div>
          <div>
            <p className="text-slate-500">Streak</p>
            <p className="text-lg font-bold">{streak} days</p>
          </div>
          <div>
            <p className="text-slate-500">DSA solved</p>
            <p className="text-lg font-bold">{solved}</p>
          </div>
          <div>
            <p className="text-slate-500">Uploaded files</p>
            <p className="text-lg font-bold">{fileCount}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-4 text-sm">
        <Link href="/files" className="text-blue-600 hover:underline">
          Your files →
        </Link>
        <Link href="/scores" className="text-blue-600 hover:underline">
          Score breakdown →
        </Link>
        <Link href="/hours" className="text-blue-600 hover:underline">
          Hours breakdown →
        </Link>
      </div>
    </div>
  );
}
