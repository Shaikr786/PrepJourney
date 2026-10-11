import Link from "next/link";
import { NoteForm } from "@/components/notes/note-form";

export default function NewNotePage() {
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Link href="/notes" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white">
        ← Notes
      </Link>
      <NoteForm />
    </div>
  );
}
