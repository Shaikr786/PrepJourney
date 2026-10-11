"use client";

import { useTransition } from "react";
import { rebuildSkillsFromSessions } from "@/lib/actions/skills";
import { Button } from "@/components/ui/button";

export function RebuildSkillsButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={isPending}
      onClick={() =>
        startTransition(async () => {
          await rebuildSkillsFromSessions();
        })
      }
    >
      {isPending ? "Updating…" : "Refresh from past sessions"}
    </Button>
  );
}
