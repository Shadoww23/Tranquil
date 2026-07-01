"use client";

import { useState, useEffect } from "react";
import type { DesignRiskScore, PreferenceProfile } from "@/lib/types";
import { personalizedConcern, nudgeProfile, DIMENSION_META } from "@/lib/engines";
import { getPreferences, savePreferences, PREFERENCES_CHANGED_EVENT } from "@/lib/userLibrary";
import { riskColor } from "@/lib/colorUtils";

// The personal layer, shown alongside the objective Design Risk Score. It reads
// the user's local preference profile, re-weights the objective factors into a
// "For you" reading, and learns from 👍/👎 feedback over time.
export default function ForYouConcern({ score }: { score: DesignRiskScore }) {
  const [profile, setProfile] = useState<PreferenceProfile | null>(null);
  const [reacted, setReacted] = useState<"fine" | "bothers" | null>(null);

  useEffect(() => {
    const reload = () => setProfile(getPreferences());
    reload();
    // Stay in sync if preferences change elsewhere (Settings on the same page,
    // or another tab).
    document.addEventListener(PREFERENCES_CHANGED_EVENT, reload);
    window.addEventListener("storage", reload);
    return () => {
      document.removeEventListener(PREFERENCES_CHANGED_EVENT, reload);
      window.removeEventListener("storage", reload);
    };
  }, []);

  if (!profile) {
    return <div className="h-24 rounded-2xl bg-stone-100 dark:bg-stone-800 animate-pulse" />;
  }

  const personal = personalizedConcern(score, profile);
  const hasFactors = score.factors.length > 0;

  const react = (r: "fine" | "bothers") => {
    const next = nudgeProfile(profile, score, r);
    savePreferences(next);
    setProfile(next);
    setReacted(r);
  };

  const note = (() => {
    if (!hasFactors) return "Nothing here that tends to bother players.";
    if (personal.delta <= -4) {
      return "Lower than the objective score — this sits within your tolerances.";
    }
    if (personal.delta >= 4) {
      const drivers = personal.topDimensions
        .map((d) => DIMENSION_META[d].label.toLowerCase())
        .join(" and ");
      return `Higher for you — you're more sensitive to ${drivers}.`;
    }
    return "Close to the objective score for your preferences.";
  })();

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800 border border-violet-100 dark:border-violet-900/50 shadow-sm p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-500 dark:text-violet-400">
          For you
        </p>
        <span className="text-[11px] text-stone-400 dark:text-stone-500">
          personalised · facts unchanged
        </span>
      </div>

      <p className={`text-4xl font-bold tabular-nums ${riskColor(personal.score)}`}>
        {personal.score}
        <span className="text-lg font-normal text-stone-400">/100</span>
      </p>
      <p className={`text-sm font-semibold mt-1 ${riskColor(personal.score)}`}>
        {personal.label} concern
      </p>
      <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 leading-relaxed">{note}</p>

      {hasFactors && (
        <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-700">
          {reacted ? (
            <p className="text-xs text-violet-600 dark:text-violet-400">
              Thanks — tuned to your preferences.{" "}
              <button
                onClick={() => setReacted(null)}
                className="underline hover:text-violet-700 dark:hover:text-violet-300"
              >
                Adjust
              </button>
            </p>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 dark:text-stone-400 mr-1">Does this feel right?</span>
              <button
                onClick={() => react("fine")}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-emerald-300 dark:hover:border-emerald-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
              >
                This is fine
              </button>
              <button
                onClick={() => react("bothers")}
                className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:border-amber-300 dark:hover:border-amber-800 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                This bothers me
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
