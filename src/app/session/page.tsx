import Link from "next/link";
import Header from "@/components/Header";
import DailyIntention from "@/components/DailyIntention";
import PomodoroTimer from "@/components/PomodoroTimer";
import BreathingExercise from "@/components/BreathingExercise";
import FocusTimeline from "@/components/FocusTimeline";

export default function SessionPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-stone-400 dark:text-stone-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to library
        </Link>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            Mindful Session
          </h1>
          <p className="text-stone-500 dark:text-stone-400 max-w-2xl">
            Set an intention, pace your focus, and breathe. Play with purpose.
          </p>
        </div>

        {/* Daily Intention */}
        <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
            Intention
          </p>
          <DailyIntention />
        </div>

        {/* Timer + Breathing side by side on large screens */}
        <div className="grid sm:grid-cols-2 gap-4">
          <PomodoroTimer />
          <BreathingExercise />
        </div>

        {/* Focus Timeline */}
        <FocusTimeline />

        {/* Tips */}
        <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
            Mindful Gaming Tips
          </p>
          <ul className="space-y-2.5">
            {[
              "Set a clear end time before you start — the game will still be there tomorrow.",
              "Use the focus timer for one gaming session, then take a real break away from screens.",
              "If you feel the urge to open a loot box, breathe first. The urge usually passes.",
              "High design-risk games are engineered to override your stop signal. The timer helps.",
            ].map((tip) => (
              <li key={tip} className="flex items-start gap-2.5 text-sm text-stone-500 dark:text-stone-400">
                <span className="mt-0.5 w-4 h-4 rounded-full bg-violet-100 dark:bg-violet-950/60 flex items-center justify-center shrink-0">
                  <svg className="w-2.5 h-2.5 text-violet-500" fill="currentColor" viewBox="0 0 8 8" aria-hidden>
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      </main>

      <footer className="text-center text-xs text-stone-300 dark:text-stone-700 pb-8 pt-4">
        Anti-FOMO &middot; Evidence-based gaming insights &middot; Open source
      </footer>
    </div>
  );
}
