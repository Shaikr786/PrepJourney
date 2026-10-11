import Link from "next/link";
import { getWeeklyLeaderboard } from "@/lib/actions/leaderboard";
import { formatDuration } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LeaderboardVisibility } from "@/components/leaderboard/opt-in";
import { Trophy, Flame, Target, TrendingUp, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function LeaderboardPage() {
  const session = await auth();
  const { rows, youHidden, yourRank, yourWeeklyScore, yourWeeklyMinutes } =
    await getWeeklyLeaderboard();

  let totalScore = 0;
  if (session?.user?.id) {
    const agg = await prisma.learningSession.aggregate({
      where: { userId: session.user.id },
      _sum: { scorePoints: true },
    });
    totalScore = agg._sum.scorePoints || 0;
  }

  const topMinutes = rows[0]?.weeklyMinutes ?? 0;
  const yourShare =
    topMinutes > 0 && yourWeeklyMinutes > 0
      ? Math.min(100, Math.round((yourWeeklyMinutes / topMinutes) * 100))
      : yourWeeklyMinutes > 0
        ? 100
        : 0;

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-500">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2 flex items-center gap-2">
          <Trophy className="h-6 w-6 text-amber-500" />
          Score points & ranking
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Who logged the most study time this week — a simple list.
        </p>
      </div>

      {/* Stats row — full width */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="transition hover:shadow-md">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Your total points</p>
            <p className="text-2xl font-bold text-amber-600 tabular-nums">
              {totalScore.toFixed(1)}
            </p>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow-md">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">This week</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">
              {formatDuration(yourWeeklyMinutes)}
            </p>
            <p className="text-xs text-slate-400">{yourWeeklyScore.toFixed(0)} pts</p>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow-md">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Your rank</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {youHidden ? "Hidden" : yourRank != null ? `#${yourRank}` : "—"}
            </p>
          </CardContent>
        </Card>
        <Card className="transition hover:shadow-md col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">People on the list</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              {rows.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <LeaderboardVisibility hidden={youHidden} />

      {/* Two columns on large screens — fills empty right side */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-start">
        {/* Main list */}
        <Card className="xl:col-span-3 overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">This week’s list</CardTitle>
            <p className="text-xs text-slate-500">
              Ordered by hours studied · first name only
            </p>
          </CardHeader>
          <CardContent>
            {rows.length === 0 ? (
              <p className="text-sm text-slate-500 py-12 text-center">
                No sessions logged this week yet. Log a session to appear on the
                list.
              </p>
            ) : (
              <ol className="space-y-2">
                {rows.map((r, index) => (
                  <li
                    key={r.userId}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 transition-all duration-300",
                      "hover:scale-[1.01] hover:shadow-sm",
                      r.isYou
                        ? "bg-amber-50 dark:bg-amber-950/30 ring-1 ring-amber-200 dark:ring-amber-800"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                    )}
                    style={{
                      animationDelay: `${index * 60}ms`,
                    }}
                  >
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition",
                        r.rank === 1 &&
                          "bg-amber-400 text-amber-950 shadow-md shadow-amber-400/30",
                        r.rank === 2 &&
                          "bg-slate-300 text-slate-800 dark:bg-slate-600 dark:text-white",
                        r.rank === 3 && "bg-orange-300 text-orange-950",
                        r.rank > 3 &&
                          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      )}
                    >
                      {r.rank}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {r.name}
                        {r.isYou && (
                          <span className="ml-2 text-xs font-medium text-amber-600">
                            (you)
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-500">
                        {r.weeklySessions} session
                        {r.weeklySessions !== 1 ? "s" : ""}
                        {" · "}
                        {r.weeklyScore.toFixed(0)} pts
                        {" · "}
                        streak {r.streak}d
                      </p>
                      {/* Mini progress vs #1 */}
                      <div className="mt-1.5 h-1.5 w-full max-w-[200px] rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            r.rank === 1 ? "bg-amber-400" : "bg-blue-500"
                          )}
                          style={{
                            width: `${
                              topMinutes
                                ? Math.max(
                                    8,
                                    Math.round(
                                      (r.weeklyMinutes / topMinutes) * 100
                                    )
                                  )
                                : 0
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums shrink-0">
                      {formatDuration(r.weeklyMinutes)}
                    </span>
                  </li>
                ))}
              </ol>
            )}
          </CardContent>
        </Card>

        {/* Right panel — uses empty space on wide screens */}
        <div className="xl:col-span-2 space-y-4">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-slate-900 border-amber-200/50 dark:border-amber-900/40">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <TrendingUp className="h-5 w-5" />
                <p className="font-semibold text-sm">Your week at a glance</p>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                {yourWeeklyMinutes === 0
                  ? "Log a session this week to join the ranking and track your pace."
                  : yourRank === 1
                    ? "You’re leading this week — keep the streak going."
                    : `You’re at ${yourShare}% of the leader’s time. A focused session can move you up.`}
              </p>
              <div className="h-2 rounded-full bg-white/60 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-amber-500 transition-all duration-1000"
                  style={{ width: `${yourShare}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" />
                How ranking works
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-slate-500 space-y-2 leading-relaxed">
              <p>1. More study minutes this week → higher rank.</p>
              <p>2. Ties broken by score points, then streak.</p>
              <p>3. Only first names are shown — not email.</p>
              <p>4. Hide yourself anytime with the button above.</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-900 dark:text-white flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-500" />
                Quick links
              </p>
              <Link
                href="/timer"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Start timer →
              </Link>
              <Link
                href="/sessions/new"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Log a session →
              </Link>
              <Link
                href="/skills"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                View skills →
              </Link>
              <Link
                href="/hours"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Activity calendar →
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
