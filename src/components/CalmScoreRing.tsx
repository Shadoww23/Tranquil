"use client";

interface CalmScoreRingProps {
  score: number;
}

export default function CalmScoreRing({ score }: CalmScoreRingProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    score >= 75 ? "#34d399" : score >= 50 ? "#fbbf24" : "#f87171";

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <svg width="140" height="140" viewBox="0 0 140 140">
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke="var(--svg-ring-track)"
          strokeWidth="12"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 70 70)"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
        <text
          x="70"
          y="65"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="28"
          fontWeight="700"
          fill="var(--svg-text-primary)"
        >
          {score}
        </text>
        <text
          x="70"
          y="88"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="11"
          fill="var(--svg-text-secondary)"
        >
          Calm Score
        </text>
      </svg>
    </div>
  );
}
