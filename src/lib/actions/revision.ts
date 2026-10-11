"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function completeRevisionItem(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.revisionItem.updateMany({
    where: { id, userId: session.user.id },
    data: {
      completed: true,
      completedAt: new Date(),
    },
  });

  revalidatePath("/revision");
}

export async function reopenRevisionItem(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.revisionItem.updateMany({
    where: { id, userId: session.user.id },
    data: {
      completed: false,
      completedAt: null,
    },
  });

  revalidatePath("/revision");
}

export async function deleteRevisionItem(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.revisionItem.deleteMany({
    where: { id, userId: session.user.id },
  });

  revalidatePath("/revision");
}

export async function createRevisionItem(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const topic = formData.get("topic") as string;
  const concept = formData.get("concept") as string;
  const reason = (formData.get("reason") as string) || undefined;
  const priority = parseInt((formData.get("priority") as string) || "1", 10);

  if (!topic || !concept) return;

  await prisma.revisionItem.create({
    data: {
      userId: session.user.id,
      topic,
      concept,
      reason: reason || null,
      priority: Math.min(3, Math.max(1, priority)),
    },
  });

  revalidatePath("/revision");
}
