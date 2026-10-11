import { ConfidenceLevel } from "@prisma/client";

export interface ScoringInput {
  durationMinutes: number;
  confidence: ConfidenceLevel;
  isStreakDay: boolean; // true if user also studied on the previous calendar day
  weeklyMinutesSoFar: number;
  weeklyGoalMinutes?: number; // default 600 = 10 hours
}

const CONFIDENCE_MULTIPLIER: Record<ConfidenceLevel, number> = {
  LEARNING: 1.0,
  PRACTICED: 1.3,
  REVISION: 1.6,
  INTERVIEW_READY: 2.0,
};

/**
 * Score for one learning session.
 *
 * Formula:
 *   base     = durationMinutes / 10          (1 point per 10 minutes)
 *   × confidence multiplier
 *       LEARNING         × 1.0
 *       PRACTICED        × 1.3
 *       REVISION         × 1.6
 *       INTERVIEW_READY  × 2.0
 *   + 5   if isStreakDay (studied yesterday too)
 *   + 15  when this session first crosses the weekly goal (default 10h)
 */
export function calculateSessionScore(input: ScoringInput): number {
  const {
    durationMinutes,
    confidence,
    isStreakDay,
    weeklyMinutesSoFar,
    weeklyGoalMinutes = 600,
  } = input;

  let points = durationMinutes / 10;
  points *= CONFIDENCE_MULTIPLIER[confidence];

  if (isStreakDay) {
    points += 5;
  }

  if (
    weeklyMinutesSoFar + durationMinutes >= weeklyGoalMinutes &&
    weeklyMinutesSoFar < weeklyGoalMinutes
  ) {
    points += 15;
  }

  return Math.round(points * 10) / 10;
}

/** Calendar day key in Asia/Kolkata: "2026-10-11" */
export function toDayKey(date: Date | string): string {
  return new Date(date).toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
}

/** Yesterday's key in IST */
export function yesterdayKey(from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() - 1);
  return toDayKey(d);
}

/**
 * Current streak in days (IST calendar days).
 *
 * Rules:
 * - A "study day" = at least one LearningSession on that calendar day (IST).
 * - Streak counts consecutive days ending at today OR yesterday.
 * - If last study was 2+ days ago → streak = 0.
 * - Example: studied Fri + Sat, today is Sun with no session yet → streak still 2
 *   (until Monday without study, then it breaks).
 */
export function calculateStreak(sessionDates: Date[]): number {
  if (sessionDates.length === 0) return 0;

  const uniqueDays = [
    ...new Set(sessionDates.map((d) => toDayKey(d))),
  ].sort(); // ascending YYYY-MM-DD

  const today = toDayKey(new Date());
  const yesterday = yesterdayKey();

  const last = uniqueDays[uniqueDays.length - 1];

  // Must have studied today or yesterday to have an active streak
  if (last !== today && last !== yesterday) {
    return 0;
  }

  // Walk backwards counting consecutive days
  let streak = 1;
  for (let i = uniqueDays.length - 1; i > 0; i--) {
    const curr = uniqueDays[i];
    const prev = uniqueDays[i - 1];

    // Difference in days between curr and prev
    const currDate = new Date(curr + "T12:00:00");
    const prevDate = new Date(prev + "T12:00:00");
    const diff = Math.round(
      (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
