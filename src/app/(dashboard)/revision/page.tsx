import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RevisionActions } from "@/components/revision/revision-actions";
import { createRevisionItem } from "@/lib/actions/revision";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function RevisionPage() {
  const session = await auth();
  if (!session?.user?.id) return null;

  const [pending, completed] = await Promise.all([
    prisma.revisionItem.findMany({
      where: { userId: session.user.id, completed: false },
      orderBy: [{ priority: "asc" }, { createdAt: "desc" }],
    }),
    prisma.revisionItem.findMany({
      where: { userId: session.user.id, completed: true },
      orderBy: { completedAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Revision Queue</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {pending.length} pending · Concepts that need revisiting
        </p>
      </div>

      {/* Quick add */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add to queue</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createRevisionItem} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="space-y-1">
              <Label htmlFor="topic">Topic</Label>
              <Input id="topic" name="topic" required placeholder="Java" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="concept">Concept</Label>
              <Input id="concept" name="concept" required placeholder="Private constructors" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reason">Reason (optional)</Label>
              <Input id="reason" name="reason" placeholder="Confused in mock" />
            </div>
            <Button type="submit">Add</Button>
          </form>
        </CardContent>
      </Card>

      {/* Pending */}
      <div className="space-y-3">
        <h2 className="font-semibold text-slate-900 dark:text-white">Pending</h2>
        {pending.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              Queue is empty. Mark sessions for revision or add items manually.
            </CardContent>
          </Card>
        ) : (
          pending.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">
                    {item.concept}
                  </p>
                  <p className="text-sm text-slate-500">
                    {item.topic}
                    {item.reason && ` · ${item.reason}`}
                    {` · Priority ${item.priority}`}
                  </p>
                  <p className="text-xs text-slate-400">{formatDate(item.createdAt)}</p>
                </div>
                <RevisionActions id={item.id} completed={false} />
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Completed */}
      {completed.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold text-slate-900 dark:text-white">Recently completed</h2>
          {completed.map((item) => (
            <Card key={item.id} className="opacity-70">
              <CardContent className="p-4 flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0">
                  <p className="font-medium line-through text-slate-600 dark:text-slate-400">
                    {item.concept}
                  </p>
                  <p className="text-sm text-slate-500">{item.topic}</p>
                </div>
                <RevisionActions id={item.id} completed={true} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
