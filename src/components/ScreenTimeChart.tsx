"use client";

import { weeklyScreenTime } from "@/lib/data";

export default function ScreenTimeChart() {
  const max = Math.max(...weeklyScreenTime.map((d) => d.hours));
  const today = new Date().toLocaleDateString("en-US", { weekday: "short" }).slice(0, 3);

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-stone-800 dark:text-stone-100">Weekly Screen Time</h2>
        <span className="text-xs text-stone-400 dark:text-stone-500 bg-stone-100 dark:bg-stone-700 px-2 py-1 rounded-full">
          hrs / day
        </span>
      </div>
      <div className="flex items-end gap-2 h-32">
        {weeklyScreenTime.map((d) => {
          const isToday = d.day === today;
          const heightPct = (d.hours / max) * 100;
          return (
            <div key={d.day} className="flex flex-col items-center gap-1.5 flex-1">
              <span className="text-xs text-stone-400 dark:text-stone-500">{d.hours}h</span>
              <div className="w-full rounded-t-lg relative" style={{ height: "80px" }}>
                <div
                  className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-700 ${
                    isToday ? "bg-emerald-400" : "bg-stone-200 dark:bg-stone-600"
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span
                className={`text-xs font-medium ${
                  isToday ? "text-emerald-600 dark:text-emerald-400" : "text-stone-400 dark:text-stone-500"
                }`}
              >
                {d.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
