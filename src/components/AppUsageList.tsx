"use client";

import { appUsage } from "@/lib/data";

export default function AppUsageList() {
  return (
    <div className="rounded-2xl bg-white border border-stone-100 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-stone-800">App Usage Today</h2>
        <span className="text-xs text-stone-400">vs daily limit</span>
      </div>
      <div className="flex flex-col gap-3">
        {appUsage.map((app) => {
          const pct = Math.min((app.minutes / app.limit) * 100, 100);
          const overLimit = app.minutes >= app.limit;
          return (
            <div key={app.name}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-stone-700">{app.name}</span>
                <span
                  className={`text-xs font-medium ${
                    overLimit ? "text-rose-500" : "text-stone-400"
                  }`}
                >
                  {app.minutes}m / {app.limit}m
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-stone-100">
                <div
                  className={`h-2 rounded-full transition-all duration-700 ${
                    overLimit ? "bg-rose-400" : app.color
                  }`}
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
