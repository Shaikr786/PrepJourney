"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sessionSchema } from "@/lib/validations/session";
import { calculateSessionScore, calculateStreak, toDayKey, yesterdayKey } from "@/lib/scoring";
import { ConfidenceLevel, Category } from "@prisma/client";
import { syncSkillsFromSession } from "@/lib/actions/skills";

export type SessionActionState = {
  error?: string;
  success?: boolean;
  fieldErrors?: Record<string, string[]>;
};

function parseConcepts(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);
}

async function updatePerformanceLog(
  userId: string,
  durationMinutes: number,
  scorePoints: number
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const previousSessions = await prisma.learningSession.findMany({
    where: { userId },
    select: { date: true },
    orderBy: { date: "desc" },
    take: 60,
  });

  const streak = calculateStreak(previousSessions.map((s) => s.date));

  await prisma.performanceLog.upsert({
    where: {
      userId_date: { userId, date: today },
    },
    create: {
      userId,
      date: today,
      totalMinutes: durationMinutes,
      sessionsCount: 1,
      scorePoints,
      streakDays: streak,
    },
    update: {
      totalMinutes: { increment: durationMinutes },
      sessionsCount: { increment: 1 },
      scorePoints: { increment: scorePoints },
      streakDays: streak,
    },
  });
}

export async function createSession(
  _prev: SessionActionState,
  formData: FormData
): Promise<SessionActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in" };
  }

  const raw = {
    title: formData.get("title"),
    topic: formData.get("topic"),
    category: formData.get("category"),
    date: formData.get("date"),
    durationMinutes: formData.get("durationMinutes"),
    conceptsCovered: formData.get("conceptsCovered") || undefined,
    practiceNotes: formData.get("practiceNotes") || undefined,
    keyTakeaway: formData.get("keyTakeaway") || undefined,
    confidence: formData.get("confidence"),
    revisionNeeded:
      formData.get("revisionNeeded") === "on" ||
      formData.get("revisionNeeded") === "true",
    nextStep: formData.get("nextStep") || undefined,
  };

  const parsed = sessionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Please fix the form errors",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const concepts = parseConcepts(data.conceptsCovered);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weeklyAgg = await prisma.learningSession.aggregate({
    where: {
      userId: session.user.id,
      date: { gte: weekStart },
    },
    _sum: { durationMinutes: true },
  });

  const weeklyMinutesSoFar = weeklyAgg._sum.durationMinutes || 0;

  // Streak bonus: did user log any session on yesterday (IST calendar day)?
  const yKey = yesterdayKey();
  const recentForStreak = await prisma.learningSession.findMany({
    where: { userId: session.user.id },
    select: { date: true },
    orderBy: { date: "desc" },
    take: 30,
  });
  const studiedYesterday = recentForStreak.some((s) => toDayKey(s.date) === yKey);

  const scorePoints = calculateSessionScore({
    durationMinutes: data.durationMinutes,
    confidence: data.confidence as ConfidenceLevel,
    isStreakDay: studiedYesterday,
    weeklyMinutesSoFar,
  });

  // DB work in try/catch — redirect must stay OUTSIDE so NEXT_REDIRECT is not swallowed
  try {
    await prisma.learningSession.create({
      data: {
        userId: session.user.id,
        title: data.title,
        topic: data.topic,
        category: data.category as Category,
        date: new Date(data.date),
        durationMinutes: data.durationMinutes,
        conceptsCovered: concepts,
        practiceNotes: data.practiceNotes || null,
        keyTakeaway: data.keyTakeaway || null,
        confidence: data.confidence as ConfidenceLevel,
        revisionNeeded: data.revisionNeeded,
        nextStep: data.nextStep || null,
        scorePoints,
      },
    });

    if (data.revisionNeeded) {
      await prisma.revisionItem.create({
        data: {
          userId: session.user.id,
          topic: data.topic,
          concept: data.title,
          reason:
            data.keyTakeaway || "Marked for revision from learning session",
          priority: 1,
        },
      });
    }

    await updatePerformanceLog(
      session.user.id,
      data.durationMinutes,
      scorePoints
    );
  } catch (err) {
    console.error("createSession error:", err);
    return { error: "Failed to save session. Please try again." };
  }

  try {
    await syncSkillsFromSession({
      userId: session.user.id,
      category: data.category,
      title: data.title,
      topic: data.topic,
      conceptsCovered: concepts,
      confidence: data.confidence,
      durationMinutes: data.durationMinutes,
      date: new Date(data.date),
    });
  } catch (e) {
    console.error("skills sync:", e);
  }

  revalidatePath("/dashboard");
  revalidatePath("/sessions");
  revalidatePath("/revision");
  revalidatePath("/skills");
  // redirect throws NEXT_REDIRECT — never put this inside the catch above
  redirect("/sessions");
}

export async function updateSession(
  id: string,
  _prev: SessionActionState,
  formData: FormData
): Promise<SessionActionState> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be signed in" };
  }

  const existing = await prisma.learningSession.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) {
    return { error: "Session not found" };
  }

  const raw = {
    title: formData.get("title"),
    topic: formData.get("topic"),
    category: formData.get("category"),
    date: formData.get("date"),
    durationMinutes: formData.get("durationMinutes"),
    conceptsCovered: formData.get("conceptsCovered") || undefined,
    practiceNotes: formData.get("practiceNotes") || undefined,
    keyTakeaway: formData.get("keyTakeaway") || undefined,
    confidence: formData.get("confidence"),
    revisionNeeded:
      formData.get("revisionNeeded") === "on" ||
      formData.get("revisionNeeded") === "true",
    nextStep: formData.get("nextStep") || undefined,
  };

  const parsed = sessionSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      error: "Please fix the form errors",
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  const concepts = parseConcepts(data.conceptsCovered);

  const scorePoints = calculateSessionScore({
    durationMinutes: data.durationMinutes,
    confidence: data.confidence as ConfidenceLevel,
    isStreakDay: false,
    weeklyMinutesSoFar: 0,
  });

  try {
    await prisma.learningSession.update({
      where: { id },
      data: {
        title: data.title,
        topic: data.topic,
        category: data.category as Category,
        date: new Date(data.date),
        durationMinutes: data.durationMinutes,
        conceptsCovered: concepts,
        practiceNotes: data.practiceNotes || null,
        keyTakeaway: data.keyTakeaway || null,
        confidence: data.confidence as ConfidenceLevel,
        revisionNeeded: data.revisionNeeded,
        nextStep: data.nextStep || null,
        scorePoints,
      },
    });
  } catch (err) {
    console.error("updateSession error:", err);
    return { error: "Failed to update session." };
  }

  revalidatePath("/dashboard");
  revalidatePath("/sessions");
  revalidatePath(`/sessions/${id}`);
  redirect("/sessions");
}

export async function deleteSession(id: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await prisma.learningSession.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/sessions");
}
