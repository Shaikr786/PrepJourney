import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate, formatDuration } from "@/lib/utils";
import { getSkillSuggestions } from "@/lib/actions/skills";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddSkillForm } from "@/components/skills/add-skill-form";
import { SkillRow } from "@/components/skills/skill-row";
import { RebuildSkillsButton } from "@/components/skills/rebuild-button";
import { Sparkles } from "lucide-react";

const TYPE_LABEL: Record<string, string> = {
  TECH: "Tech",
  TOOL: "Tool",
  SOFT: "Soft",
  DOMAIN: "Domain",
};

export default async function SkillsPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  const [skills, suggestions] = await Promise.all([
    prisma.skill.findMany({
      where: { userId },
      orderBy: [{ level: "desc" }, { totalMinutes: "desc" }],
    }),
    getSkillSuggestions(userId),
  ]);

  return (
    <div className="space-y-6 w-full max-w-3xl">
      <div>
        <Link
          href="/dashboard"
          className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
          Skills
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Built automatically from your sessions (category, topic, concepts). You can
          also add skills manually.
        </p>
        <div className="mt-3">
          <RebuildSkillsButton />
        </div>
      </div>

      {suggestions.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-500" />
              Suggestions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {suggestions.map((s, i) => (
                <li
                  key={i}
                  className="text-sm text-slate-600 dark:text-slate-300 border-l-2 border-amber-400 pl-3"
                >
                  {s.message}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <AddSkillForm />

      {skills.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-slate-500">
            No skills yet.{" "}
            <Link href="/sessions/new" className="text-blue-600 hover:underline">
              Log a session
            </Link>{" "}
            with a category (e.g. Java, DSA) — skills will show up here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {skills.map((s) => (
            <SkillRow
              key={s.id}
              id={s.id}
              name={s.name}
              typeLabel={TYPE_LABEL[s.type] || s.type}
              level={s.level}
              sessionCount={s.sessionCount}
              totalMinutes={s.totalMinutes}
              lastPracticed={
                s.lastPracticed ? formatDate(s.lastPracticed) : null
              }
              source={s.source}
            />
          ))}
        </div>
      )}
    </div>
  );
}
