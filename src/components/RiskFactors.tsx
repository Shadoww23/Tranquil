import type { DesignRiskScore, RiskFactor } from "@/lib/types";

const CATEGORY_STYLE: Record<RiskFactor["category"], { dot: string; label: string }> = {
  monetization: { dot: "bg-rose-400", label: "text-rose-600 dark:text-rose-400" },
  manipulation: { dot: "bg-amber-400", label: "text-amber-600 dark:text-amber-400" },
  compulsion: { dot: "bg-violet-400", label: "text-violet-600 dark:text-violet-400" },
};

/** Small badge stating whether the score is from verified data or a store guess. */
export function ConfidenceBadge({ confidence }: { confidence: DesignRiskScore["confidence"] }) {
  const verified = confidence === "high";
  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full ${
        verified
          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400"
          : "bg-stone-100 text-stone-500 dark:bg-stone-700 dark:text-stone-400"
      }`}
      title={
        verified
          ? "Scored from hand-verified mechanic data."
          : "Estimated from the Steam store listing — may be incomplete."
      }
    >
      <span className={`w-1.5 h-1.5 rounded-full ${verified ? "bg-emerald-500" : "bg-stone-400"}`} aria-hidden />
      {verified ? "Verified data" : "Estimated"}
    </span>
  );
}

/** Explains a Design Risk Score: each contributing factor, its points, and why. */
export function RiskFactorList({ score }: { score: DesignRiskScore }) {
  if (score.factors.length === 0) {
    return (
      <p className="text-sm text-stone-500 dark:text-stone-400">
        No concern patterns detected — clean monetisation and design.
      </p>
    );
  }

  const ordered = [...score.factors].sort((a, b) => b.points - a.points);

  return (
    <ul className="flex flex-col divide-y divide-stone-100 dark:divide-stone-700">
      {ordered.map((f) => {
        const style = CATEGORY_STYLE[f.category];
        return (
          <li key={f.label} className="flex items-start gap-3 py-2.5 first:pt-0 last:pb-0">
            <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${style.dot}`} aria-hidden />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-stone-800 dark:text-stone-100">{f.label}</span>
                <span className={`text-xs font-semibold tabular-nums shrink-0 ${style.label}`}>
                  +{f.points}
                </span>
              </div>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5 leading-relaxed">
                {f.reason}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
