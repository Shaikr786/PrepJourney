"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  extractSkillsFromSession,
  deriveLevel,
} from "@/lib/skills-map";
import { SkillType } from "@prisma/client";

export async function syncSkillsFromSession(input: {
  userId: string;
  category: string;
  title: string;
  topic: string;
  conceptsCovered: string[];
  confidence: string;
  durationMinutes: number;
  date: Date;
}) {
  const hints = extractSkillsFromSession({
    category: input.category,
    title: input.title,
    topic: input.topic,
    conceptsCovered: input.conceptsCovered,
  });

  for (const hint of hints) {
    const existing = await prisma.skill.findUnique({
      where: {
        userId_name: { userId: input.userId, name: hint.name },
      },
    });

    if (!existing) {
      await prisma.skill.create({
        data: {
          userId: input.userId,
          name: hint.name,
          type: hint.type as SkillType,
          level: deriveLevel(input.confidence, 1, input.durationMinutes),
          sessionCount: 1,
          totalMinutes: input.durationMinutes,
          lastPracticed: input.date,
          source: "auto",
        },
      });
    } else {
      const sessionCount = existing.sessionCount + 1;
      const totalMinutes = existing.totalMinutes + input.durationMinutes;
      const level = Math.max(
        existing.level,
        deriveLevel(input.confidence, sessionCount, totalMinutes)
      );
      await prisma.skill.update({
        where: { id: existing.id },
        data: {
          sessionCount,
          totalMinutes,
          level,
          lastPracticed: input.date,
        },
      });
    }
  }
}

export async function createManualSkill(name: string, type: SkillType) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const trimmed = name.trim();
  if (trimmed.length < 2) return { error: "Name too short" };

  try {
    await prisma.skill.create({
      data: {
        userId: session.user.id,
        name: trimmed,
        type,
        level: 1,
        source: "manual",
      },
    });
  } catch {
    return { error: "Skill already exists" };
  }

  revalidatePath("/skills");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function setSkillLevel(id: string, level: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const lv = Math.min(5, Math.max(1, Math.round(level)));
  await prisma.skill.updateMany({
    where: { id, userId: session.user.id },
    data: { level: lv },
  });

  revalidatePath("/skills");
  return { success: true };
}

export async function deleteSkill(id: string) {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  await prisma.skill.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/skills");
  revalidatePath("/dashboard");
}

export type SkillSuggestion = {
  message: string;
  skillName?: string;
};

export async function getSkillSuggestions(userId: string): Promise<SkillSuggestion[]> {
  const skills = await prisma.skill.findMany({
    where: { userId },
    orderBy: { lastPracticed: "asc" },
  });

  const suggestions: SkillSuggestion[] = [];
  const now = Date.now();
  const day = 86400000;

  for (const s of skills) {
    if (!s.lastPracticed) {
      suggestions.push({
        message: `Start a session for “${s.name}” to build this skill.`,
        skillName: s.name,
      });
      continue;
    }
    const age = (now - s.lastPracticed.getTime()) / day;
    if (age >= 14) {
      suggestions.push({
        message: `“${s.name}” hasn’t been practiced in ${Math.floor(age)} days — schedule a revision session.`,
        skillName: s.name,
      });
    } else if (s.totalMinutes >= 120 && s.level <= 2) {
      suggestions.push({
        message: `You’ve logged time on “${s.name}” but level is still low — aim for Practiced / Interview-ready confidence.`,
        skillName: s.name,
      });
    }
  }

  if (skills.length === 0) {
    suggestions.push({
      message:
        "Log a learning session (pick a category + topic). Skills will appear here automatically.",
    });
  }

  return suggestions.slice(0, 5);
}

/** Rebuild skills from all existing sessions (one-time / repair) */
export async function rebuildSkillsFromSessions() {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const userId = session.user.id;
  await prisma.skill.deleteMany({ where: { userId, source: "auto" } });

  const sessions = await prisma.learningSession.findMany({
    where: { userId },
    orderBy: { date: "asc" },
  });

  for (const s of sessions) {
    await syncSkillsFromSession({
      userId,
      category: s.category,
      title: s.title,
      topic: s.topic,
      conceptsCovered: s.conceptsCovered,
      confidence: s.confidence,
      durationMinutes: s.durationMinutes,
      date: s.date,
    });
  }

  revalidatePath("/skills");
  revalidatePath("/dashboard");
  return { success: true, count: sessions.length };
}
