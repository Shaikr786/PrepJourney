import { prisma } from "@/lib/prisma";
import { startOfWeek, startOfMonth, subWeeks, subMonths, format } from "date-fns";

export async function getWeeklyChartData(userId: string) {
  const now = new Date();
  const start = startOfWeek(subWeeks(now, 7));

  const sessions = await prisma.learningSession.findMany({
    where: {
      userId,
      date: { gte: start },
    },
    select: {
      date: true,
      durationMinutes: true,
      scorePoints: true,
    },
  });

  const weeks: Record<string, { minutes: number; points: number; count: number }> = {};

  for (let i = 0; i < 8; i++) {
    const weekStart = startOfWeek(subWeeks(now, 7 - i));
    const key = format(weekStart, "yyyy-MM-dd");
    weeks[key] = { minutes: 0, points: 0, count: 0 };
  }

  for (const s of sessions) {
    const weekStart = startOfWeek(s.date);
    const key = format(weekStart, "yyyy-MM-dd");
    if (weeks[key]) {
      weeks[key].minutes += s.durationMinutes;
      weeks[key].points += s.scorePoints;
      weeks[key].count += 1;
    }
  }

  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      week: format(new Date(date), "MMM d"),
      hours: Math.round((data.minutes / 60) * 10) / 10,
      points: Math.round(data.points * 10) / 10,
      sessions: data.count,
    }));
}

export async function getMonthlyChartData(userId: string) {
  const now = new Date();
  const start = startOfMonth(subMonths(now, 5));

  const sessions = await prisma.learningSession.findMany({
    where: {
      userId,
      date: { gte: start },
    },
    select: {
      date: true,
      durationMinutes: true,
      scorePoints: true,
    },
  });

  const months: Record<string, { minutes: number; points: number; count: number }> = {};

  for (let i = 0; i < 6; i++) {
    const monthStart = startOfMonth(subMonths(now, 5 - i));
    const key = format(monthStart, "yyyy-MM");
    months[key] = { minutes: 0, points: 0, count: 0 };
  }

  for (const s of sessions) {
    const key = format(s.date, "yyyy-MM");
    if (months[key]) {
      months[key].minutes += s.durationMinutes;
      months[key].points += s.scorePoints;
      months[key].count += 1;
    }
  }

  return Object.entries(months)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, data]) => ({
      month: format(new Date(date + "-01"), "MMM yyyy"),
      hours: Math.round((data.minutes / 60) * 10) / 10,
      points: Math.round(data.points * 10) / 10,
      sessions: data.count,
    }));
}

export async function getCategoryBreakdown(userId: string) {
  const sessions = await prisma.learningSession.groupBy({
    by: ["category"],
    where: { userId },
    _sum: { durationMinutes: true },
    _count: true,
  });

  return sessions.map((s) => ({
    category: s.category.replace("_", " "),
    hours: Math.round(((s._sum.durationMinutes || 0) / 60) * 10) / 10,
    count: s._count,
  }));
}
