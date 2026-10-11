"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { noteSchema } from "@/lib/validations/notes";

export type NoteActionState = {
  error?: string;
  success?: boolean;
};

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw.split(",").map((t) => t.trim()).filter(Boolean);
}

export async function createNote(
  _prev: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const raw = {
    title: (formData.get("title") as string) || undefined,
    content: formData.get("content") as string,
    isPinned: formData.get("isPinned") === "on" || formData.get("isPinned") === "true",
    tags: (formData.get("tags") as string) || undefined,
  };

  const parsed = noteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  await prisma.note.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title || null,
      content: parsed.data.content,
      isPinned: parsed.data.isPinned,
      tags: parseTags(parsed.data.tags),
    },
  });

  revalidatePath("/notes");
  revalidatePath("/dashboard");
  redirect("/notes");
}

export async function updateNote(
  id: string,
  _prev: NoteActionState,
  formData: FormData
): Promise<NoteActionState> {
  const session = await auth();
  if (!session?.user?.id) return { error: "Unauthorized" };

  const existing = await prisma.note.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!existing) return { error: "Note not found" };

  const raw = {
    title: (formData.get("title") as string) || undefined,
    content: formData.get("content") as string,
    isPinned: formData.get("isPinned") === "on" || formData.get("isPinned") === "true",
    tags: (formData.get("tags") as string) || undefined,
  };

  const parsed = noteSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message || "Invalid input" };
  }

  await prisma.note.update({
    where: { id },
    data: {
      title: parsed.data.title || null,
      content: parsed.data.content,
      isPinned: parsed.data.isPinned,
      tags: parseTags(parsed.data.tags),
    },
  });

  revalidatePath("/notes");
  redirect("/notes");
}

export async function deleteNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  await prisma.note.deleteMany({ where: { id, userId: session.user.id } });
  revalidatePath("/notes");
  revalidatePath("/dashboard");
}

export async function togglePinNote(id: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const note = await prisma.note.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!note) return;

  await prisma.note.update({
    where: { id },
    data: { isPinned: !note.isPinned },
  });
  revalidatePath("/notes");
}
