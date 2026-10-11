import { PracticeRecorder } from "@/components/practice/practice-recorder";

export default function PracticePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Practice — record yourself
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-1">
          Use your camera or microphone to practice interview answers. Recordings stay on your device only.
        </p>
      </div>
      <PracticeRecorder />
    </div>
  );
}
