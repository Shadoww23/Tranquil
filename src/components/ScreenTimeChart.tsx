"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import type { AnalyzedGame } from "@/lib/types";

interface Props {
  games: AnalyzedGame[];
}

const VERDICT_COLORS: Record<AnalyzedGame["recommendation"]["verdict"], string> = {
  healthy: "#10b981",
  mindful: "#3b82f6",
  caution: "#f59e0b",
  "red-flag": "#ef4444",
};

export default function ScreenTimeChart({ games }: Props) {
  const top = [...games]
    .sort((a, b) => b.hoursPlayed - a.hoursPlayed)
    .slice(0, 12)
    .map((g) => ({
      name: g.title.length > 16 ? g.title.slice(0, 14) + "…" : g.title,
      fullName: g.title,
      hours: g.hoursPlayed,
      verdict: g.recommendation.verdict,
      color: VERDICT_COLORS[g.recommendation.verdict],
    }));

  if (top.length === 0) return null;

  return (
    <div className="rounded-2xl bg-white dark:bg-stone-800 border border-stone-100 dark:border-stone-700 shadow-sm p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400 dark:text-stone-500">Time Investment</p>
        <p className="text-xs text-stone-400 dark:text-stone-500">Top {top.length} by hours</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={top} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 10, fill: "#a8a29e" }} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}h`} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#a8a29e" }} tickLine={false} axisLine={false} width={90} />
          <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            const d = payload[0].payload;
            return (
              <div className="bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-3 py-2 shadow-lg text-xs">
                <p className="font-semibold text-stone-800 dark:text-stone-100 mb-0.5">{d.fullName}</p>
                <p className="text-stone-500 dark:text-stone-400">{d.hours.toLocaleString()}h played</p>
                <p className="capitalize mt-0.5" style={{ color: d.color }}>{d.verdict.replace("-", " ")}</p>
              </div>
            );
          }} />
          <Bar dataKey="hours" radius={[0, 4, 4, 0]} maxBarSize={14}>
            {top.map((entry, i) => <Cell key={i} fill={entry.color} fillOpacity={0.85} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap gap-3 mt-3 pt-3 border-t border-stone-100 dark:border-stone-700">
        {(["healthy", "mindful", "caution", "red-flag"] as const).map((v) => (
          <div key={v} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: VERDICT_COLORS[v] }} />
            <span className="text-xs text-stone-400 dark:text-stone-500 capitalize">{v.replace("-", " ")}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
