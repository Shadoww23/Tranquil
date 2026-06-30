import type { DetectedPattern } from "@/lib/types";

const severityStyles: Record<DetectedPattern["severity"], string> = {
  low: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-400 dark:border-yellow-800",
  medium:
    "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-800",
  high: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-800",
};

interface Props {
  pattern: DetectedPattern;
}

export default function PatternBadge({ pattern }: Props) {
  return (
    <span
      className={`inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full border ${severityStyles[pattern.severity]}`}
      title={pattern.description}
    >
      {pattern.pattern}
    </span>
  );
}
