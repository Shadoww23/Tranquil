"use client";

import { focusHistory } from "@/lib/data";

export default function FocusTimeline() {
  return (
    <div className="rounded-2xl bg-white border border-stone-100 shadow-sm p-5">
      <h2 className="font-semibold text-stone-800 mb-4">Focus Sessions</h2>
      <div className="flex flex-col gap-2">
        {focusHistory.map((session, i) => (
          <div key={i} className="flex items-center gap-3">
            <div
              className={`w-3 h-3 rounded-full flex-shrink-0 ${
                session.complete ? "bg-emerald-400" : "bg-stone-200 border-2 border-stone-300"
              }`}
            />
            <div className="flex-1 flex items-center justify-between">
              <div>
                <p
                  className={`text-sm font-medium ${
                    session.complete ? "text-stone-700" : "text-stone-400"
                  }`}
                >
                  {session.label}
                </p>
                <p className="text-xs text-stone-400">{session.time}</p>
              </div>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  session.complete
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-stone-100 text-stone-400"
                }`}
              >
                {session.duration}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
