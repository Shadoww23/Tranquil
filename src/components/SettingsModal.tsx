"use client";

import { useState, useEffect } from "react";
import { appUsage as defaults } from "@/lib/data";

type AppEntry = { name: string; minutes: number; limit: number; color: string };

function getApps(): AppEntry[] {
  try {
    const stored = localStorage.getItem("tranquil-limits");
    if (stored) return JSON.parse(stored) as AppEntry[];
  } catch {}
  return defaults;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function SettingsModal({ open, onClose }: Props) {
  const [apps, setApps] = useState<AppEntry[]>(defaults);

  useEffect(() => {
    if (open) setApps(getApps());
  }, [open]);

  const updateLimit = (name: string, value: number) => {
    setApps((prev) =>
      prev.map((a) => (a.name === name ? { ...a, limit: value } : a))
    );
  };

  const save = () => {
    localStorage.setItem("tranquil-limits", JSON.stringify(apps));
    window.dispatchEvent(new Event("tranquil-limits-changed"));
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-semibold text-stone-800 text-lg">App Limits</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl bg-stone-100 hover:bg-stone-200 transition-colors text-stone-500 text-sm font-bold"
          >
            ✕
          </button>
        </div>
        <p className="text-xs text-stone-400 mb-4">
          Edit your daily time limits per app (in minutes).
        </p>
        <div className="flex flex-col gap-3">
          {apps.map((app) => (
            <div key={app.name} className="flex items-center gap-3">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${app.color}`} />
              <span className="text-sm font-medium text-stone-700 flex-1 truncate">
                {app.name}
              </span>
              <input
                type="number"
                min={1}
                max={480}
                value={app.limit}
                onChange={(e) => {
                  const v = parseInt(e.target.value);
                  if (!isNaN(v) && v > 0) updateLimit(app.name, v);
                }}
                className="w-16 text-sm text-right border border-stone-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-300 text-stone-700"
              />
              <span className="text-xs text-stone-400 w-6">min</span>
            </div>
          ))}
        </div>
        <button
          onClick={save}
          className="mt-6 w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
