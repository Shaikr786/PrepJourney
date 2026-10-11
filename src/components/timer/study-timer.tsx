"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { startTimer, stopTimer } from "@/lib/actions/timer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Square, Clock } from "lucide-react";

type ActiveTimer = {
  id: string;
  startedAt: string | Date;
  topic?: string | null;
};

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return [h, m, s].map((v) => v.toString().padStart(2, "0")).join(":");
}

export function StudyTimer({
  initialTimer,
}: {
  initialTimer: ActiveTimer | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [topic, setTopic] = useState(initialTimer?.topic || "");
  const [active, setActive] = useState<ActiveTimer | null>(initialTimer);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!active) {
      setElapsed(0);
      return;
    }
    const started = new Date(active.startedAt).getTime();
    const tick = () => setElapsed(Math.max(0, Math.floor((Date.now() - started) / 1000)));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [active]);

  function handleStart() {
    startTransition(async () => {
      try {
        const timer = await startTimer(topic || undefined);
        setActive({
          id: timer.id,
          startedAt: timer.startedAt,
          topic: timer.topic,
        });
        router.refresh();
      } catch (e) {
        console.error(e);
        alert("Could not start timer. Are you signed in?");
      }
    });
  }

  function handleStop(saveSession: boolean) {
    if (!active) return;
    startTransition(async () => {
      try {
        const result = await stopTimer(active.id);
        const topicVal = active.topic || topic || "";
        setActive(null);
        setElapsed(0);
        router.refresh();

        if (saveSession && result && "durationMinutes" in result) {
          const minutes = result.durationMinutes as number;
          const t = encodeURIComponent(topicVal);
          // Always land on session form with duration + topic filled
          router.push(`/sessions/new?duration=${minutes}&topic=${t}&from=timer`);
        }
      } catch (e) {
        console.error(e);
        alert("Could not stop timer.");
      }
    });
  }

  return (
    <Card className="max-w-md mx-auto w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Study Timer
        </CardTitle>
        <p className="text-sm text-slate-500">
          Timer keeps running when you open other pages — look for the green bar at the bottom.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-5xl sm:text-6xl font-mono font-bold tracking-wider text-slate-900 dark:text-white tabular-nums">
            {formatElapsed(elapsed)}
          </div>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {active ? "Timer running… (visible on all pages)" : "Ready to start"}
          </p>
        </div>

        {!active && (
          <div className="space-y-2">
            <Label htmlFor="topic">Topic (optional)</Label>
            <Input
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Java Collections"
              disabled={isPending}
            />
          </div>
        )}

        {active && active.topic && (
          <p className="text-center text-sm text-slate-600 dark:text-slate-300">
            Studying: <span className="font-medium">{active.topic}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row justify-center gap-3">
          {!active ? (
            <Button onClick={handleStart} disabled={isPending} size="lg" className="gap-2">
              <Play className="h-5 w-5" />
              {isPending ? "Starting…" : "Start"}
            </Button>
          ) : (
            <>
              <Button
                onClick={() => handleStop(true)}
                disabled={isPending}
                size="lg"
                className="gap-2"
              >
                <Square className="h-5 w-5" />
                {isPending ? "Stopping…" : "Stop & save session"}
              </Button>
              <Button
                onClick={() => handleStop(false)}
                disabled={isPending}
                variant="outline"
                size="lg"
              >
                Stop only
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
