"use client";

import type { AnalyzedGame } from "@/lib/types";

interface Props {
  games: AnalyzedGame[];
}

export default function CalmScoreRing({ games }: Props) {
  if (games.length === 0) return null;

  const healthy = games.filter((g) => g.recommendation.verdict === "healthy").length;
  const mindful = games.filter((g) => g.recommendation.verdict === "mindful").length;
  const caution = games.filter((g) => g.recommendation.verdict === "caution").length;
  const redFlag = games.filter((g) => g.recommendation.verdict === "red-flag").length;
  const cleanPct = Math.round(((healthy + mindful) / games.length) * 100);

  const radius = 48;
  const circumference = 2 * Math.PI * radius;

  const segments = [
    { count: healthy, color: "#10b981" },
    { count: mindful, color: "#3b82f6" },
    { count: caution, color: "#f59e0b" },
    { count: redFlag, color: "#ef4444" },
  ];

  let cumulativePct = 0;
  const arcs = segments
    .filter((s) => s.count > 0)
    .map((s) => {
      const pct = s.count / games.length;
      const dashArray = circumference * pct;
      const dashOffset = circumference * (1 - cumulativePct);
      cumulativePct += pct;
      return { ...s, dashArray, dashOffset };
    });

  const statusColor = cleanPct >= 70 ? "text-emerald-600 dark:text-emerald-400" : cleanPct >= 50 ? "text-blue-600 dark:text-blue-400" : "text-amber-600 dark:text-amber-400";
  const statusLabel = cleanPct >= 70 ? "Great library choices" : cleanPct >= 50 ? "Room to improve" : "High design risk detected";

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
      <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-4">Library Health</p>
      <div className="flex items-center gap-5">
        <div className="relative shrink-0">
          <svg width="120" height="120" viewBox="0 0 120 120" role="img" aria-label={`Library health: ${cleanPct}% clean`}>
            <circle cx="60" cy="60" r={radius} fill="none" stroke="var(--svg-ring-track)" strokeWidth="12" />
            {arcs.map((arc, i) => (
              <circle key={i} cx="60" cy="60" r={radius} fill="none" stroke={arc.color} strokeWidth="12"
                strokeDasharray={`${arc.dashArray} ${circumference}`} strokeDashoffset={arc.dashOffset}
                strokeLinecap="butt" transform="rotate(-90 60 60)" />
            ))}
            <text x="60" y="54" textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="700" fill="var(--svg-text-primary)">{cleanPct}%</text>
            <text x="60" y="70" textAnchor="middle" dominantBaseline="middle" fontSize="10" fill="var(--svg-text-secondary)">clean</text>
          </svg>
        </div>
        <div className="flex-1 space-y-2">
          {[
            { label: "Healthy", count: healthy, dot: "bg-emerald-500", text: "text-emerald-600 dark:text-emerald-400" },
            { label: "Mindful", count: mindful, dot: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" },
            { label: "Caution", count: caution, dot: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
            { label: "Red Flag", count: redFlag, dot: "bg-red-500", text: "text-red-600 dark:text-red-400" },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full shrink-0 ${item.dot}`} />
              <span className="text-xs text-stone-500 dark:text-stone-400 flex-1">{item.label}</span>
              <span className={`text-xs font-semibold ${item.text}`}>{item.count}</span>
            </div>
          ))}
          <div className="pt-1.5 border-t border-stone-100 dark:border-stone-700">
            <p className={`text-xs font-semibold ${statusColor}`}>{statusLabel}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
