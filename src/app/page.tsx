import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="max-w-2xl text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white">
            PrepJourney
          </h1>
          <p className="text-lg text-slate-600 dark:text-slate-300">
            Log any preparation journey — skills, exams, career switch, or daily learning — with real time, notes, and progress.
            Sessions, timer, practice recordings, files, revision, and insights in one place.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow hover:bg-blue-700 transition"
          >
            Get Started
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-lg border border-slate-300 dark:border-slate-700 px-6 py-3 text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Sign In
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 text-sm text-slate-500 dark:text-slate-400">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4">
            <div className="font-semibold text-slate-900 dark:text-white">Sessions</div>
            <div>Log & score</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4">
            <div className="font-semibold text-slate-900 dark:text-white">Timer</div>
            <div>Real-time</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4">
            <div className="font-semibold text-slate-900 dark:text-white">DSA</div>
            <div>Problem tracker</div>
          </div>
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-4">
            <div className="font-semibold text-slate-900 dark:text-white">Notes</div>
            <div>Self-messaging</div>
          </div>
        </div>
      </div>
    </div>
  );
}
