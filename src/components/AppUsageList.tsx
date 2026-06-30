"use client";

import { useState, useEffect } from "react";
import { appUsage as defaults } from "@/lib/data";

type AppEntry = typeof defaults[0];

function getApps(): AppEntry[] {
  try {
    const stored = localStorage.getItem("tranquil-limits");
    if (stored) return JSON.parse(stored) as AppEntry[];
  } catch {}
  return defaults;
}

export default function AppUsageList() {
  const [apps, setApps] = useState<AppEntry[]>(defaults);

  useEffect(() => {
    setApps(getApps());
    const refresh = () => setApps(getApps());
    window.addEventListener("tranquil-limits-changed", refresh);
    return () => window.removeEventListener("tranquil-limits-changed", refresh);
  }, []);

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-stone-800 dark:text-stone-100">App Usage Today</h2>
        <span className="text-xs text-stone-400 dark:text-stone-500">vs daily limit</span>
      </div>
      <div className="flex flex-col gap-3">
        {apps.map((app) => {
          const pct = Math.min((app.minutes / app.limit) * 100, 100);
          const overLimit = app.minutes >= app.limit;
          return (
            <div key={app.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-200">{app.name}</span>
                <span className={`text-xs font-medium ${overLimit ? "text-rose-500" : "text-stone-400 dark:text-stone-500"}`}>
                  {app.minutes}m / {app.limit}m
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-stone-100 dark:bg-stone-700">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${overLimit ? "bg-rose-400" : app.color}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
