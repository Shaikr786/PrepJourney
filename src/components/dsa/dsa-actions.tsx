"use client";

import { useTransition } from "react";
import { deleteDsaProblem, updateDsaStatus } from "@/lib/actions/dsa";
import { ProblemStatus } from "@prisma/client";
import Link from "next/link";

const statuses: ProblemStatus[] = ["TODO", "ATTEMPTED", "SOLVED", "REVISIT"];

export function DsaActions({ id, currentStatus }: { id: string; currentStatus: ProblemStatus }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={currentStatus}
        disabled={isPending}
        onChange={(e) => {
          startTransition(() => updateDsaStatus(id, e.target.value as ProblemStatus));
        }}
        className="text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1"
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <Link href={`/dsa/${id}/edit`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
        Edit
      </Link>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this problem?")) {
            startTransition(() => deleteDsaProblem(id));
          }
        }}
        className="text-sm text-red-600 hover:underline dark:text-red-400"
      >
        Delete
      </button>
    </div>
  );
}
