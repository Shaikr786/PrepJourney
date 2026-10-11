"use client";

import { useTransition } from "react";
import { deleteNote, togglePinNote } from "@/lib/actions/notes";
import { Pin, Trash2 } from "lucide-react";

export function NoteActions({ id, isPinned }: { id: string; isPinned: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => startTransition(() => togglePinNote(id))}
        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
        title={isPinned ? "Unpin" : "Pin"}
      >
        <Pin className={`h-4 w-4 ${isPinned ? "fill-amber-500 text-amber-500" : ""}`} />
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (confirm("Delete this note?")) {
            startTransition(() => deleteNote(id));
          }
        }}
        className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-red-500"
        title="Delete"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}
