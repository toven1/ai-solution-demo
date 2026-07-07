import { Gauge } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function ReadinessScoreCard({ score }: { score: number }) {
  const value = Math.max(0, Math.min(100, score));
  const label = value >= 70 ? "검증 준비 양호" : value >= 40 ? "가설 보강 필요" : "초기 정리 단계";

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text">Readiness Score</span>
          <Gauge className="h-4 w-4 text-accentStrong" />
        </div>
        <div className="mt-3 text-3xl font-semibold text-text">{value}</div>
        <p className="mt-1 text-xs text-textFaint">{label}</p>
      </CardContent>
    </Card>
  );
}
