import { cn } from "@/lib/utils";

const tone = {
  high: "bg-teal-50 text-teal-800 border-teal-200",
  medium: "bg-amber-50 text-amber-800 border-amber-200",
  low: "bg-slate-50 text-slate-700 border-slate-200"
};

export function ConfidenceBadge({ level }: { level: "high" | "medium" | "low" }) {
  const label = level === "high" ? "높은 신뢰" : level === "medium" ? "중간 신뢰" : "낮은 신뢰";

  return <span className={cn("rounded-md border px-2 py-1 text-xs font-medium", tone[level])}>{label}</span>;
}
