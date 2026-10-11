"use client";

import { useTransition } from "react";
import { completeRevisionItem, reopenRevisionItem, deleteRevisionItem } from "@/lib/actions/revision";
import { Check, RotateCcw, Trash2 } from "lucide-react";

export function RevisionActions({
  id,
  completed,
}: {
  id: string;
  completed: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-1">
      {!completed ? (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => completeRevisionItem(id))}
          className="p-1.5 rounded hover:bg-emerald-50 dark:hover:bg-emerald-950 text-emerald-600"
          title="Mark complete"
        >
          <Check className="h-4 w-4" />
        </button>
      ) : (
        <button
          type="button"
          disabled={isPending}
          onClick={() => startTransition(() => reopenRevisionItem(id))}
          className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
          title="Reopen"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
      )}
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this revision item?")) {
            startTransition(() => deleteRevisionItem(id));
          }
        }}
        className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-950 text-red-500"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
