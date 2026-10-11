"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { dsaSchema } from "@/lib/validations/dsa";
import { Difficulty, ProblemStatus } from "@prisma/client";

export type DsaActionState = {
  error?: string;
  success?: boolean;
};

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function createDsaProblem(
  _prev: DsaActionState,
  formData: FormData
): Promise<DsaActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    title: formData.get("title") as string,
    link: (formData.get("link") as string) || "",
    difficulty: formData.get("difficulty") as string,
    status: formData.get("status") as string,
    topicTags: (formData.get("topicTags") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    timeSpent: formData.get("timeSpent") || undefined,
  };

  const parsed = dsaSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  const data = parsed.data;

  await prisma.dsaProblem.create({
    data: {
      userId: session.user.id,
      title: data.title,
      link: data.link || null,
      difficulty: data.difficulty as Difficulty,
      status: data.status as ProblemStatus,
      topicTags: parseTags(data.topicTags),
      notes: data.notes || null,
      timeSpent: data.timeSpent || null,
      solvedAt: data.status === "SOLVED" ? new Date() : null,
    },
  });

  revalidatePath("/dsa");
  revalidatePath("/dashboard");
  redirect("/dsa");
}

export async function updateDsaProblem(
  id: string,
  _prev: DsaActionState,
  formData: FormData
): Promise<DsaActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const existing = await prisma.dsaProblem.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { error: "Problem not found" };

  const raw = {
    title: formData.get("title") as string,
    link: (formData.get("link") as string) || "",
    difficulty: formData.get("difficulty") as string,
    status: formData.get("status") as string,
    topicTags: (formData.get("topicTags") as string) || undefined,
    notes: (formData.get("notes") as string) || undefined,
    timeSpent: formData.get("timeSpent") || undefined,
  };

  const parsed = dsaSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  const data = parsed.data;

  await prisma.dsaProblem.update({
    where: { id },
    data: {
      title: data.title,
      link: data.link || null,
      difficulty: data.difficulty as Difficulty,
      status: data.status as ProblemStatus,
      topicTags: parseTags(data.topicTags),
      notes: data.notes || null,
      timeSpent: data.timeSpent || null,
      solvedAt:
        data.status === "SOLVED"
          ? existing.solvedAt || new Date()
          : null,
    },
  });

  revalidatePath("/dsa");
  revalidatePath("/dashboard");
  redirect("/dsa");
}

export async function updateDsaStatus(id: string, status: ProblemStatus) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.dsaProblem.updateMany({
    where: { id, userId: session.user.id },
    data: {
      status,
      solvedAt: status === "SOLVED" ? new Date() : null,
    },
  });

  revalidatePath("/dsa");
  revalidatePath("/dashboard");
}

export async function deleteDsaProblem(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.dsaProblem.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/dsa");
  revalidatePath("/dashboard");
}
