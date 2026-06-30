export function joyColor(score: number): string {
  if (score >= 70) return "text-emerald-600 dark:text-emerald-400";
  if (score >= 50) return "text-blue-600 dark:text-blue-400";
  if (score >= 25) return "text-amber-600 dark:text-amber-400";
  return "text-red-500 dark:text-red-400";
}

export function riskColor(score: number): string {
  if (score <= 15) return "text-emerald-600 dark:text-emerald-400";
  if (score <= 40) return "text-amber-600 dark:text-amber-400";
  if (score <= 65) return "text-orange-600 dark:text-orange-400";
  return "text-red-600 dark:text-red-400";
}

export function riskBarColor(score: number): string {
  if (score <= 15) return "bg-emerald-400";
  if (score <= 40) return "bg-yellow-400";
  if (score <= 65) return "bg-orange-400";
  return "bg-red-500";
}
