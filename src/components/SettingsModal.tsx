"use client";

import { useState, useEffect } from "react";
import {
  getStoredLibrary,
  clearLibrary,
  getPreferences,
  savePreferences,
  clearPreferences,
} from "@/lib/userLibrary";
import {
  DIMENSIONS,
  DIMENSION_META,
  SENSITIVITY_LEVELS,
  defaultProfile,
  weightToLevel,
} from "@/lib/engines";
import type { ConcernDimension, PreferenceProfile } from "@/lib/types";
import { useModalDismiss } from "@/lib/useModalDismiss";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Theme = "light" | "dark" | "system";

export default function SettingsModal({ open, onClose }: Props) {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<Theme>("system");
  const [steamConnected, setSteamConnected] = useState(false);
  const [steamId, setSteamId] = useState<string | null>(null);
  const [gameCount, setGameCount] = useState(0);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [profile, setProfile] = useState<PreferenceProfile>(() => defaultProfile());

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted) return;
    const stored = localStorage.getItem("tranquil-theme");
    setTheme(stored === "dark" ? "dark" : stored === "light" ? "light" : "system");
    const lib = getStoredLibrary();
    setSteamConnected(!!lib);
    setSteamId(lib?.meta.steamId ?? null);
    setGameCount(lib?.meta.gameCount ?? 0);
    setShowClearConfirm(false);
    setProfile(getPreferences());
  }, [open, mounted]);

  const setSensitivity = (dim: ConcernDimension, weight: number) => {
    const next: PreferenceProfile = {
      weights: { ...profile.weights, [dim]: weight },
      updatedAt: new Date().toISOString(),
    };
    setProfile(next);
    savePreferences(next);
  };

  useModalDismiss(onClose, open && mounted);

  if (!mounted || !open) return null;

  const applyTheme = (t: Theme) => {
    setTheme(t);
    if (t === "dark") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("tranquil-theme", "dark");
    } else if (t === "light") {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("tranquil-theme", "light");
    } else {
      localStorage.removeItem("tranquil-theme");
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  };

  const handleExportLibrary = () => {
    const lib = getStoredLibrary();
    if (!lib) return;
    const json = JSON.stringify(lib.games, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "anti-fomo-library.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDisconnectSteam = () => {
    clearLibrary();
    setSteamConnected(false);
    setSteamId(null);
    setGameCount(0);
    document.dispatchEvent(new CustomEvent("open-steam-connect"));
  };

  const handleClearAll = () => {
    clearLibrary();
    clearPreferences();
    localStorage.removeItem("tranquil-sessions");
    localStorage.removeItem("tranquil-intention");
    setShowClearConfirm(false);
    onClose();
    window.location.reload();
  };

  const THEME_OPTIONS: { value: Theme; label: string }[] = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "Auto" },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label="Settings"
    >
      <div className="w-full max-w-md bg-white dark:bg-stone-800 rounded-2xl shadow-xl border border-stone-100 dark:border-stone-700 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 dark:border-stone-700">
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-stone-400 dark:text-stone-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h2 className="font-semibold text-stone-800 dark:text-stone-100">Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-5 py-5 space-y-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
          {/* Appearance */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
              Appearance
            </p>
            <div className="flex gap-2">
              {THEME_OPTIONS.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => applyTheme(value)}
                  className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-colors ${
                    theme === value
                      ? "bg-violet-50 dark:bg-violet-950/40 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800"
                      : "border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-violet-200 dark:hover:border-violet-800 hover:text-stone-700 dark:hover:text-stone-200"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* What matters to you — drives the "For you" concern layer */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-1">
              What matters to you
            </p>
            <p className="text-xs text-stone-400 dark:text-stone-500 mb-3">
              Personalises the &ldquo;For you&rdquo; reading on each game. Objective scores never change.
            </p>
            <div className="space-y-3">
              {DIMENSIONS.map((dim) => {
                const current = weightToLevel(profile.weights[dim]);
                return (
                  <div key={dim}>
                    <div className="flex items-baseline justify-between mb-1">
                      <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                        {DIMENSION_META[dim].label}
                      </span>
                      <span className="text-[11px] text-stone-400 dark:text-stone-500 truncate ml-2">
                        {DIMENSION_META[dim].description}
                      </span>
                    </div>
                    <div className="flex gap-1 bg-stone-100 dark:bg-stone-700/60 rounded-lg p-0.5">
                      {SENSITIVITY_LEVELS.map((lvl) => (
                        <button
                          key={lvl.key}
                          onClick={() => setSensitivity(dim, lvl.weight)}
                          className={`flex-1 text-[11px] font-medium py-1 rounded-md transition-colors ${
                            current === lvl.key
                              ? "bg-white dark:bg-stone-600 text-violet-600 dark:text-violet-300 shadow-sm"
                              : "text-stone-400 dark:text-stone-500 hover:text-stone-600 dark:hover:text-stone-300"
                          }`}
                        >
                          {lvl.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Steam */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
              Steam Library
            </p>
            {steamConnected ? (
              <div className="space-y-2.5">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800">
                  <div className="w-2 h-2 rounded-full bg-sky-500 shrink-0" aria-hidden />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-sky-700 dark:text-sky-300">Connected</p>
                    <p className="text-xs text-sky-500 dark:text-sky-400 truncate">
                      {gameCount} games · ID {steamId}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleDisconnectSteam}
                  className="w-full py-2 rounded-xl text-xs font-semibold border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:border-red-300 dark:hover:border-red-800 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  Disconnect &amp; reconnect
                </button>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-700/50 border border-stone-200 dark:border-stone-700">
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  No library connected. Use the{" "}
                  <button
                    onClick={() => {
                      onClose();
                      document.dispatchEvent(new CustomEvent("open-steam-connect"));
                    }}
                    className="font-semibold text-sky-500 hover:text-sky-700 dark:hover:text-sky-300 transition-colors underline"
                  >
                    Connect Steam
                  </button>{" "}
                  button in the header.
                </p>
              </div>
            )}
          </section>

          {/* Data */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
              Data
            </p>
            <div className="space-y-2">
              <button
                onClick={handleExportLibrary}
                disabled={!steamConnected}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-violet-300 dark:hover:border-violet-700 hover:text-violet-600 dark:hover:text-violet-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>Export library as JSON</span>
                <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              {!showClearConfirm ? (
                <button
                  onClick={() => setShowClearConfirm(true)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium border border-stone-200 dark:border-stone-700 text-stone-400 dark:text-stone-500 hover:border-red-300 dark:hover:border-red-800 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                >
                  <span>Clear all data</span>
                  <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              ) : (
                <div className="rounded-xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-3">
                  <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                    This clears your Steam library, focus sessions, and daily intentions. This cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleClearAll}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold bg-red-500 hover:bg-red-600 text-white transition-colors"
                    >
                      Clear everything
                    </button>
                    <button
                      onClick={() => setShowClearConfirm(false)}
                      className="flex-1 py-1.5 rounded-lg text-xs font-semibold border border-stone-200 dark:border-stone-700 text-stone-500 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* About */}
          <section>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3">
              About
            </p>
            <div className="rounded-xl bg-stone-50 dark:bg-stone-700/50 border border-stone-100 dark:border-stone-700 divide-y divide-stone-100 dark:divide-stone-700 overflow-hidden">
              <div className="flex justify-between items-center px-3 py-2.5 text-xs">
                <span className="text-stone-500 dark:text-stone-400">Product</span>
                <span className="font-medium text-stone-700 dark:text-stone-200">Anti-FOMO Gaming Insights</span>
              </div>
              <div className="flex justify-between items-center px-3 py-2.5 text-xs">
                <span className="text-stone-500 dark:text-stone-400">Version</span>
                <span className="font-medium text-stone-700 dark:text-stone-200">0.1.0</span>
              </div>
              <div className="flex justify-between items-center px-3 py-2.5 text-xs">
                <span className="text-stone-500 dark:text-stone-400">License</span>
                <span className="font-medium text-stone-700 dark:text-stone-200">MIT · Open source</span>
              </div>
              <a
                href="https://github.com/shadoww23/Tranquil"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-3 py-2.5 text-xs text-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <span>View on GitHub</span>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
