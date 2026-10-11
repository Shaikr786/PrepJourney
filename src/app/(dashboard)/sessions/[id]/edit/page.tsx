import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SessionForm } from "@/components/sessions/session-form";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditSessionPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const existing = await prisma.learningSession.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!existing) notFound();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/sessions"
          className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          ← Sessions
        </Link>
      </div>
      <SessionForm
        mode="edit"
        sessionId={existing.id}
        initial={{
          title: existing.title,
          topic: existing.topic,
          category: existing.category,
          date: existing.date.toISOString().slice(0, 10),
          durationMinutes: existing.durationMinutes,
          conceptsCovered: existing.conceptsCovered,
          practiceNotes: existing.practiceNotes,
          keyTakeaway: existing.keyTakeaway,
          confidence: existing.confidence,
          revisionNeeded: existing.revisionNeeded,
          nextStep: existing.nextStep,
        }}
      />
    </div>
  );
}
