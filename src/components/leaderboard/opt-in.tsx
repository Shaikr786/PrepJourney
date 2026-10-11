"use client";

import { useTransition } from "react";
import { setLeaderboardHidden } from "@/lib/actions/leaderboard";
import { Button } from "@/components/ui/button";

export function LeaderboardVisibility({ hidden }: { hidden: boolean }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 text-sm">
      <p className="text-slate-600 dark:text-slate-300">
        {hidden
          ? "You are hidden from the public list."
          : "You appear on the list when you log sessions."}
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            await setLeaderboardHidden(!hidden);
          })
        }
      >
        {isPending ? "…" : hidden ? "Show me on the list" : "Hide me from the list"}
      </Button>
    </div>
  );
}
