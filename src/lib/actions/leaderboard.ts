"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { calculateStreak } from "@/lib/scoring";

export async function setLeaderboardHidden(hidden: boolean) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // leaderboardOptIn true = visible, false = hidden
  await prisma.user.update({
    where: { id: session.user.id },
    data: { leaderboardOptIn: !hidden },
  });

  revalidatePath("/leaderboard");
  revalidatePath("/scores");
  revalidatePath("/dashboard");
}

export type LeaderboardRow = {
  rank: number;
  userId: string;
  name: string;
  weeklyMinutes: number;
  weeklySessions: number;
  weeklyScore: number;
  streak: number;
  isYou: boolean;
};

function weekStartDate(): Date {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? 6 : day - 1;
  const start = new Date(now);
  start.setDate(now.getDate() - diff);
  start.setHours(0, 0, 0, 0);
  return start;
}

/**
 * Rank users who logged sessions this week.
 * Hidden users (leaderboardOptIn === false) are excluded.
 * Name = first name from account (no extra display-name setup).
 */
export async function getWeeklyLeaderboard(): Promise<{
  rows: LeaderboardRow[];
  youHidden: boolean;
  yourRank: number | null;
  yourWeeklyScore: number;
  yourWeeklyMinutes: number;
}> {
  const session = await auth();
  if (!session?.user?.id) {
    return {
      rows: [],
      youHidden: false,
      yourRank: null,
      yourWeeklyScore: 0,
      yourWeeklyMinutes: 0,
    };
  }

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { leaderboardOptIn: true },
  });

  // false = explicitly hidden; null/true = visible (treat missing as visible)
  const youHidden = me?.leaderboardOptIn === false;

  const weekStart = weekStartDate();

  // Users with any session this week
  const sessionsThisWeek = await prisma.learningSession.findMany({
    where: { date: { gte: weekStart } },
    select: {
      userId: true,
      durationMinutes: true,
      scorePoints: true,
      date: true,
      user: {
        select: {
          id: true,
          name: true,
          leaderboardOptIn: true,
        },
      },
    },
  });

  type Agg = {
    userId: string;
    name: string;
    weeklyMinutes: number;
    weeklySessions: number;
    weeklyScore: number;
    hidden: boolean;
  };

  const map = new Map<string, Agg>();

  for (const s of sessionsThisWeek) {
    if (s.user.leaderboardOptIn === false) continue;
    const existing = map.get(s.userId);
    const firstName = s.user.name?.split(" ")[0] || "Learner";
    if (!existing) {
      map.set(s.userId, {
        userId: s.userId,
        name: firstName,
        weeklyMinutes: s.durationMinutes,
        weeklySessions: 1,
        weeklyScore: s.scorePoints,
        hidden: false,
      });
    } else {
      existing.weeklyMinutes += s.durationMinutes;
      existing.weeklySessions += 1;
      existing.weeklyScore += s.scorePoints;
    }
  }

  // Include current user in personal stats even if hidden from list
  const myWeek = sessionsThisWeek.filter((s) => s.userId === session.user!.id);
  const yourWeeklyMinutes = myWeek.reduce((a, s) => a + s.durationMinutes, 0);
  const yourWeeklyScore = myWeek.reduce((a, s) => a + s.scorePoints, 0);

  const list = Array.from(map.values());

  const withStreak = await Promise.all(
    list.map(async (u) => {
      const recent = await prisma.learningSession.findMany({
        where: { userId: u.userId },
        select: { date: true },
        orderBy: { date: "desc" },
        take: 60,
      });
      return {
        ...u,
        streak: calculateStreak(recent.map((r) => r.date)),
        isYou: u.userId === session.user!.id,
      };
    })
  );

  withStreak.sort((a, b) => {
    if (b.weeklyMinutes !== a.weeklyMinutes)
      return b.weeklyMinutes - a.weeklyMinutes;
    if (b.weeklyScore !== a.weeklyScore) return b.weeklyScore - a.weeklyScore;
    return b.streak - a.streak;
  });

  const rows: LeaderboardRow[] = withStreak.map((r, i) => ({
    rank: i + 1,
    userId: r.userId,
    name: r.name,
    weeklyMinutes: r.weeklyMinutes,
    weeklySessions: r.weeklySessions,
    weeklyScore: r.weeklyScore,
    streak: r.streak,
    isYou: r.isYou,
  }));

  const yourRank = rows.find((r) => r.isYou)?.rank ?? null;

  return {
    rows,
    youHidden,
    yourRank,
    yourWeeklyScore,
    yourWeeklyMinutes,
  };
}
