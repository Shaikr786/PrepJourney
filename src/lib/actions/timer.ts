"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function startTimer(topic?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Stop any existing active timer first
  await prisma.studyTimer.updateMany({
    where: { userId: session.user.id, isActive: true },
    data: {
      isActive: false,
      endedAt: new Date(),
    },
  });

  // Calculate duration for any that were left open
  const openOnes = await prisma.studyTimer.findMany({
    where: { userId: session.user.id, endedAt: { not: null }, durationSec: null },
  });
  for (const t of openOnes) {
    if (t.endedAt) {
      const durationSec = Math.floor(
        (t.endedAt.getTime() - t.startedAt.getTime()) / 1000
      );
      await prisma.studyTimer.update({
        where: { id: t.id },
        data: { durationSec },
      });
    }
  }

  const timer = await prisma.studyTimer.create({
    data: {
      userId: session.user.id,
      topic: topic || null,
      isActive: true,
      startedAt: new Date(),
    },
  });

  revalidatePath("/timer");
  revalidatePath("/dashboard");
  return timer;
}

export async function stopTimer(timerId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const timer = await prisma.studyTimer.findFirst({
    where: { id: timerId, userId: session.user.id, isActive: true },
  });

  if (!timer) {
    return { error: "No active timer found" };
  }

  const endedAt = new Date();
  const durationSec = Math.floor(
    (endedAt.getTime() - timer.startedAt.getTime()) / 1000
  );

  const updated = await prisma.studyTimer.update({
    where: { id: timerId },
    data: {
      isActive: false,
      endedAt,
      durationSec,
    },
  });

  revalidatePath("/timer");
  revalidatePath("/dashboard");
  return {
    ...updated,
    durationMinutes: Math.max(1, Math.round(durationSec / 60)),
  };
}

export async function getActiveTimer() {
  const session = await auth();
  if (!session?.user?.id) return null;

  return prisma.studyTimer.findFirst({
    where: { userId: session.user.id, isActive: true },
  });
}
