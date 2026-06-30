import CalmScoreRing from "@/components/CalmScoreRing";
import StatCard from "@/components/StatCard";
import ScreenTimeChart from "@/components/ScreenTimeChart";
import AppUsageList from "@/components/AppUsageList";
import WhatYouDidntMiss from "@/components/WhatYouDidntMiss";
import PomodoroTimer from "@/components/PomodoroTimer";
import BreathingExercise from "@/components/BreathingExercise";
import DailyIntention from "@/components/DailyIntention";
import { dailyStats } from "@/lib/data";

export default function Home() {
  const date = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-400 flex items-center justify-center">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M12 3C7 3 3 7 3 12s4 9 9 9 9-4 9-9-4-9-9-9z" stroke="white" strokeWidth="2" fill="none" />
                <path d="M12 7v5l3 3" stroke="white" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="font-semibold text-stone-800 text-lg tracking-tight">Tranquil</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-400 hidden sm:block">{date}</span>
            <div className="w-8 h-8 rounded-full bg-stone-200 flex items-center justify-center text-xs font-semibold text-stone-500">
              Y
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100 p-6">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <CalmScoreRing score={dailyStats.calmScore} />
            <div className="flex-1 flex flex-col gap-3 text-center sm:text-left w-full">
              <div>
                <h1 className="text-2xl font-semibold text-stone-800">Good {greeting}.</h1>
                <p className="text-stone-500 mt-1 text-sm max-w-sm">
                  {dailyStats.screenFreeHours}h screen-free and {dailyStats.focusSessions} focus sessions today.
                </p>
              </div>
              <DailyIntention />
              <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 text-sm font-medium px-4 py-2 rounded-full shadow-sm self-center sm:self-start">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                FOMO Risk: Low ({dailyStats.fomoScore}%)
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatCard
            label="Screen-Free Hours"
            value={`${dailyStats.screenFreeHours}h`}
            sub="Today"
            accent="bg-emerald-50"
            icon={
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1M4.22 4.22l.707.707m12.02 12.02.707.707M3 12h1m16 0h1M4.927 19.073l.707-.707M18.364 4.636l.707-.707" />
              </svg>
            }
          />
          <StatCard
            label="Focus Sessions"
            value={dailyStats.focusSessions}
            sub="3 completed"
            accent="bg-sky-50"
            icon={
              <svg className="w-5 h-5 text-sky-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" />
                <path strokeLinecap="round" d="M12 7v5l3 3" />
              </svg>
            }
          />
          <StatCard
            label="Mindful Breaks"
            value={dailyStats.mindfulBreaks}
            sub="Goal: 6"
            accent="bg-violet-50"
            icon={
              <svg className="w-5 h-5 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 010 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            }
          />
          <StatCard
            label="Limit Resets"
            value={dailyStats.limitResets}
            sub="Keep it low"
            accent="bg-amber-50"
            icon={
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            }
          />
        </div>

        {/* Timer + Breathing */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PomodoroTimer />
          <BreathingExercise />
        </div>

        {/* Screen time + App usage */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ScreenTimeChart />
          <AppUsageList />
        </div>

        {/* What you didn't miss */}
        <WhatYouDidntMiss />
      </main>

      <footer className="text-center text-xs text-stone-300 pb-8 pt-4">
        Tranquil · Your digital calm companion
      </footer>
    </div>
  );
}
