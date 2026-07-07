import { cn } from "@/lib/utils";

const tone = {
  high: "bg-surface text-success",
  medium: "bg-surface text-warning",
  low: "bg-surface text-textSub"
};

export function ConfidenceBadge({ level }: { level: "high" | "medium" | "low" }) {
  const label = level === "high" ? "높은 신뢰" : level === "medium" ? "중간 신뢰" : "낮은 신뢰";

  return <span className={cn("rounded-md px-2 py-1 text-xs font-medium", tone[level])}>{label}</span>;
}
