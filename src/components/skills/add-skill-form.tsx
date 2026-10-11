"use client";

import { useState, useTransition } from "react";
import { createManualSkill } from "@/lib/actions/skills";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SkillType } from "@prisma/client";

const TYPES: SkillType[] = ["TECH", "TOOL", "SOFT", "DOMAIN"];

export function AddSkillForm() {
  const [name, setName] = useState("");
  const [type, setType] = useState<SkillType>("TECH");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await createManualSkill(name, type);
      if (res?.error) setError(res.error);
      else setName("");
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2">
      <Input
        placeholder="Add skill (e.g. Selenium)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="sm:flex-1"
      />
      <select
        value={type}
        onChange={(e) => setType(e.target.value as SkillType)}
        className="rounded-lg border border-slate-200 dark:border-slate-700 bg-transparent px-3 py-2 text-sm"
      >
        {TYPES.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
      <Button type="submit" disabled={isPending || name.trim().length < 2}>
        {isPending ? "…" : "Add"}
      </Button>
      {error && <p className="text-xs text-red-600 w-full">{error}</p>}
    </form>
  );
}
