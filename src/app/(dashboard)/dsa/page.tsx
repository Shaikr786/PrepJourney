import Link from "next/link";
import { ProblemStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { DsaActions } from "@/components/dsa/dsa-actions";

const difficultyColor: Record<string, string> = {
  EASY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  HARD: "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300",
};

const statusColor: Record<string, string> = {
  TODO: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  ATTEMPTED: "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300",
  SOLVED: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  REVISIT: "bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300",
};

export default async function DsaPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) return null;

  const params = await searchParams;
  const statusFilter = Object.values(ProblemStatus).find(
    (status) => status === params.status
  );

  const problems = await prisma.dsaProblem.findMany({
    where: {
      userId: session.user.id,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    orderBy: { updatedAt: "desc" },
  });

  const counts = await prisma.dsaProblem.groupBy({
    by: ["status"],
    where: { userId: session.user.id },
    _count: true,
  });

  const countMap = Object.fromEntries(counts.map((c) => [c.status, c._count]));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">DSA Problems</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Solved: {countMap.SOLVED || 0} · Attempted: {countMap.ATTEMPTED || 0} · Todo: {countMap.TODO || 0}
          </p>
        </div>
        <Link
          href="/dsa/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + Add Problem
        </Link>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/dsa"
          className={`text-xs px-3 py-1 rounded-full border ${!statusFilter ? "bg-blue-600 text-white border-blue-600" : "border-slate-300 dark:border-slate-700"}`}
        >
          All
        </Link>
        {[ProblemStatus.TODO, ProblemStatus.ATTEMPTED, ProblemStatus.SOLVED, ProblemStatus.REVISIT].map((s) => (
          <Link
            key={s}
            href={`/dsa?status=${s}`}
            className={`text-xs px-3 py-1 rounded-full border ${statusFilter === s ? "bg-blue-600 text-white border-blue-600" : "border-slate-300 dark:border-slate-700"}`}
          >
            {s} ({countMap[s] || 0})
          </Link>
        ))}
      </div>

      {problems.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No problems logged yet. Start tracking the ones you solve.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {problems.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {p.link ? (
                        <a
                          href={p.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {p.title}
                        </a>
                      ) : (
                        <h3 className="font-semibold text-slate-900 dark:text-white">{p.title}</h3>
                      )}
                      <span className={`text-xs px-2 py-0.5 rounded-full ${difficultyColor[p.difficulty]}`}>
                        {p.difficulty}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${statusColor[p.status]}`}>
                        {p.status}
                      </span>
                    </div>
                    {p.topicTags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {p.topicTags.map((t) => (
                          <span key={t} className="text-xs px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                            {t}
                          </span>
                        ))}
                      </div>
                    )}
                    {p.notes && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">{p.notes}</p>
                    )}
                  </div>
                  <DsaActions id={p.id} currentStatus={p.status} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
