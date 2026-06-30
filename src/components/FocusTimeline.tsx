"use client";

import { useState, useEffect } from "react";

type SessionEntry = {
  ts: number;
  mode: "focus" | "shortBreak" | "longBreak";
  minutes: number;
};

export default function FocusTimeline() {
  const [mounted, setMounted] = useState(false);
  const [sessions, setSessions] = useState<SessionEntry[]>([]);

  const reload = () => {
    try {
      const raw = localStorage.getItem("tranquil-sessions");
      setSessions(raw ? (JSON.parse(raw) as SessionEntry[]) : []);
    } catch {}
  };

  useEffect(() => {
    setMounted(true);
    reload();
  }, []);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "tranquil-sessions") reload();
    };
    const onCustom = () => reload();
    window.addEventListener("storage", onStorage);
    document.addEventListener("tranquil-session-saved", onCustom);
    return () => {
      window.removeEventListener("storage", onStorage);
      document.removeEventListener("tranquil-session-saved", onCustom);
    };
  }, []);

  if (!mounted) return null;

  const focusSessions = sessions.filter((s) => s.mode === "focus");
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const weekSessions = focusSessions.filter((s) => s.ts >= weekAgo);
  const totalMinutes = focusSessions.reduce((sum, s) => sum + s.minutes, 0);
  const weekMinutes = weekSessions.reduce((sum, s) => sum + s.minutes, 0);

  const days: { label: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    const start = d.getTime();
    const end = start + 24 * 60 * 60 * 1000;
    const label =
      i === 0
        ? "Today"
        : i === 1
        ? "Yest"
        : d.toLocaleDateString("en", { weekday: "short" });
    const minutes = focusSessions
      .filter((s) => s.ts >= start && s.ts < end)
      .reduce((sum, s) => sum + s.minutes, 0);
    days.push({ label, minutes });
  }
  const maxMinutes = Math.max(...days.map((d) => d.minutes), 25);

  const recent = sessions.slice(0, 12);

  if (focusSessions.length === 0) {
    return (
      <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
          Focus History
        </p>
        <div className="py-8 text-center">
          <div className="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-950/40 flex items-center justify-center mx-auto mb-3">
            <svg
              className="w-5 h-5 text-violet-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            No focus sessions yet
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500 mt-1">
            Complete a timer above to build your history
          </p>
        </div>
      </div>
    );
  }

  const totalH = Math.floor(totalMinutes / 60);
  const totalM = totalMinutes % 60;

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">
          Focus History
        </p>
        <p className="text-xs text-stone-400 dark:text-stone-500">
          {weekMinutes}min this week
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <div className="text-center">
          <p className="text-lg font-bold text-stone-800 dark:text-stone-100">
            {totalH > 0 ? `${totalH}h ${totalM}m` : `${totalM}m`}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">Total focus</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-stone-800 dark:text-stone-100">
            {focusSessions.length}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">
            Session{focusSessions.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-stone-800 dark:text-stone-100">
            {weekSessions.length}
          </p>
          <p className="text-xs text-stone-400 dark:text-stone-500">This week</p>
        </div>
      </div>

      {/* 7-day bar chart */}
      <div className="flex items-end gap-1.5 mb-1" style={{ height: 64 }}>
        {days.map((d) => {
          const pct = Math.max(d.minutes > 0 ? 8 : 0, (d.minutes / maxMinutes) * 100);
          return (
            <div
              key={d.label}
              className="flex-1 flex flex-col items-center gap-1"
              style={{ height: 64 }}
            >
              <div
                className="w-full flex items-end"
                style={{ height: 48 }}
              >
                <div
                  className={`w-full rounded-t-md transition-all ${
                    d.minutes > 0
                      ? "bg-violet-400 dark:bg-violet-500"
                      : "bg-stone-100 dark:bg-stone-700"
                  }`}
                  style={{ height: `${Math.max(pct, d.minutes > 0 ? 8 : 4)}%` }}
                  title={`${d.minutes}min`}
                />
              </div>
              <p className="text-[9px] text-stone-400 dark:text-stone-600 leading-none">
                {d.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent sessions */}
      <div className="mt-4 pt-4 border-t border-stone-100 dark:border-stone-700">
        <p className="text-xs text-stone-400 dark:text-stone-500 mb-2.5">Recent sessions</p>
        <div className="flex flex-col gap-2">
          {recent.map((s, i) => {
            const d = new Date(s.ts);
            const isToday = d.toDateString() === new Date().toDateString();
            const timeLabel = isToday
              ? d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" })
              : d.toLocaleDateString("en", { month: "short", day: "numeric" });
            const modeLabel =
              s.mode === "focus"
                ? "Focus"
                : s.mode === "shortBreak"
                ? "Short break"
                : "Long break";
            const dot =
              s.mode === "focus"
                ? "bg-emerald-400"
                : s.mode === "shortBreak"
                ? "bg-sky-400"
                : "bg-violet-400";
            const color =
              s.mode === "focus"
                ? "text-emerald-600 dark:text-emerald-400"
                : s.mode === "shortBreak"
                ? "text-sky-500 dark:text-sky-400"
                : "text-violet-500 dark:text-violet-400";
            return (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${dot}`} aria-hidden />
                <span className={`font-medium ${color}`}>{modeLabel}</span>
                <span className="text-stone-300 dark:text-stone-600">·</span>
                <span className="text-stone-500 dark:text-stone-400">{s.minutes}min</span>
                <span className="text-stone-300 dark:text-stone-600 ml-auto">{timeLabel}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
