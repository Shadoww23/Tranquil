import type { DesignRiskScore } from "@/lib/types";

// Theoretical maximums per subcategory (from engine weights)
const MAX = { monetization: 80, manipulation: 23, compulsion: 22 } as const;

const categories = [
  { key: "monetization" as const, label: "Monetization", bar: "bg-rose-400 dark:bg-rose-500", text: "text-rose-600 dark:text-rose-400" },
  { key: "manipulation" as const, label: "Manipulation", bar: "bg-amber-400 dark:bg-amber-500", text: "text-amber-600 dark:text-amber-400" },
  { key: "compulsion"  as const, label: "Compulsion",   bar: "bg-violet-400 dark:bg-violet-500", text: "text-violet-600 dark:text-violet-400" },
];

interface Props {
  score: DesignRiskScore;
  compact?: boolean;
}

export default function RiskBreakdownBar({ score, compact = false }: Props) {
  return (
    <div className={`flex flex-col ${compact ? "gap-2" : "gap-3"}`}>
      {categories.map(({ key, label, bar, text }) => {
        const value = score.breakdown[key];
        const pct = Math.min(100, Math.round((value / MAX[key]) * 100));
        return (
          <div key={key}>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-stone-500 dark:text-stone-400">{label}</span>
              <span className={`font-semibold ${text}`}>{value}pts</span>
            </div>
            <div
              className={`rounded-full bg-stone-100 dark:bg-stone-700 overflow-hidden ${compact ? "h-1" : "h-1.5"}`}
              role="progressbar"
              aria-valuenow={value}
              aria-valuemin={0}
              aria-valuemax={MAX[key]}
              aria-label={`${label}: ${value} points`}
            >
              <div
                className={`h-full rounded-full ${bar}`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
