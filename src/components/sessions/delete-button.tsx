"use client";

import { useTransition } from "react";
import { deleteSession } from "@/lib/actions/sessions";

export function DeleteSessionButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (confirm("Delete this session?")) {
          startTransition(async () => {
            await deleteSession(id);
          });
        }
      }}
      className="text-sm text-red-600 hover:underline dark:text-red-400 disabled:opacity-50"
    >
      {isPending ? "…" : "Delete"}
    </button>
  );
}
