"use client";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  accent?: string;
  icon: React.ReactNode;
}

export default function StatCard({ label, value, sub, accent = "bg-stone-100", icon }: StatCardProps) {
  return (
    <div className="rounded-2xl bg-white border border-stone-100 shadow-sm p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-semibold tracking-tight text-stone-900">{value}</p>
        <p className="text-sm font-medium text-stone-500 mt-0.5">{label}</p>
        {sub && <p className="text-xs text-stone-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}
