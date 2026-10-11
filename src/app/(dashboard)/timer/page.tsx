import { getActiveTimer } from "@/lib/actions/timer";
import { StudyTimer } from "@/components/timer/study-timer";

export default async function TimerPage() {
  const active = await getActiveTimer();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Study Timer
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Track real study time with timestamps. Stop the timer to create a scored session.
        </p>
      </div>

      <StudyTimer
        initialTimer={
          active
            ? {
                id: active.id,
                startedAt: active.startedAt,
                topic: active.topic,
              }
            : null
        }
      />
    </div>
  );
}
