import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DsaForm } from "@/components/dsa/dsa-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditDsaPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) return null;

  const problem = await prisma.dsaProblem.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!problem) notFound();

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/dsa" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
        ← DSA Problems
      </Link>
      <DsaForm
        mode="edit"
        problemId={problem.id}
        initial={{
          title: problem.title,
          link: problem.link,
          difficulty: problem.difficulty,
          status: problem.status,
          topicTags: problem.topicTags,
          notes: problem.notes,
          timeSpent: problem.timeSpent,
        }}
      />
    </div>
  );
}
