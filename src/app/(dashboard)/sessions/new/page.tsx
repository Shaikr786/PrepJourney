import { SessionForm } from "@/components/sessions/session-form";
import Link from "next/link";

type Props = {
  searchParams: Promise<{ duration?: string; topic?: string }>;
};

export default async function NewSessionPage({ searchParams }: Props) {
  const params = await searchParams;
  const defaultDuration = params.duration ? parseInt(params.duration, 10) : undefined;
  const defaultTopic = params.topic;

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
        mode="create"
        defaultDuration={defaultDuration}
        defaultTopic={defaultTopic}
      />
    </div>
  );
}
