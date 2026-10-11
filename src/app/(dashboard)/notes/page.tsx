import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { NoteActions } from "@/components/notes/note-actions";
import { Pin } from "lucide-react";

export default async function NotesPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const notes = await prisma.note.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isPinned: "desc" }, { updatedAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Notes</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Quick messages to yourself · {notes.length} notes
          </p>
        </div>
        <Link
          href="/notes/new"
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          + New Note
        </Link>
      </div>

      {notes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No notes yet. Capture a thought or reminder.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {notes.map((n) => (
            <Card key={n.id} className={n.isPinned ? "border-amber-300 dark:border-amber-700" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      {n.isPinned && <Pin className="h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />}
                      {n.title && (
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {n.title}
                        </h3>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 whitespace-pre-wrap line-clamp-4">
                      {n.content}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {n.tags.map((t) => (
                        <span
                          key={t}
                          className="text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-400 pt-1">{formatDate(n.updatedAt)}</p>
                  </div>
                  <NoteActions id={n.id} isPinned={n.isPinned} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
