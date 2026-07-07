"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, ExternalLink, Search, XCircle } from "lucide-react";

import { AssumptionBadge } from "@/components/common/assumption-badge";
import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Competitor = {
  id: string;
  name: string;
  url: string | null;
  targetCustomer: string | null;
  coreFeatures: string[];
  pricing: string | null;
  strengths: string[];
  weaknesses: string[];
  differentiation: string | null;
  sourceUrl: string | null;
  sourceTitle: string | null;
  sourceIds: string[];
};

export function CompetitorMatrix({ projectId, competitors }: { projectId: string; competitors: Competitor[] }) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function generateCompetitors() {
    setIsGenerating(true);
    const response = await fetch(`/api/projects/${projectId}/competitors/generate`, { method: "POST" });
    setIsGenerating(false);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setToast({ type: "error", message: data?.error ?? "경쟁사 분석 생성에 실패했습니다." });
      return;
    }

    setToast({ type: "success", message: "MockResearchProvider가 경쟁사 매트릭스를 생성했습니다." });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>Competitor Matrix</CardTitle>
          <CardDescription>경쟁사명, 웹사이트, 타깃 고객, 기능, 가격, 강약점, 차별화를 표로 비교합니다.</CardDescription>
        </div>
        <Button onClick={generateCompetitors} disabled={isGenerating}>
          <Search className="h-4 w-4" />
          {competitors.length > 0 ? "다시 생성" : "경쟁사 분석 생성"}
        </Button>
      </CardHeader>
      <CardContent>
        {toast ? <Toast type={toast.type} message={toast.message} /> : null}
        {competitors.length === 0 ? (
          <EmptyState title="아직 경쟁사 분석이 없습니다" description="경쟁사 분석 생성 버튼을 누르면 Competitor와 ResearchSource가 DB에 저장됩니다." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full border-collapse text-sm">
              <thead>
                <tr className="border-b bg-surface text-left text-xs uppercase tracking-wide text-textFaint">
                  <th className="p-3">경쟁사명</th>
                  <th className="p-3">웹사이트</th>
                  <th className="p-3">타깃 고객</th>
                  <th className="p-3">핵심 기능</th>
                  <th className="p-3">가격</th>
                  <th className="p-3">강점</th>
                  <th className="p-3">약점</th>
                  <th className="p-3">차별화 포인트</th>
                  <th className="p-3">출처 링크</th>
                </tr>
              </thead>
              <tbody>
                {competitors.map((competitor) => (
                  <tr key={competitor.id} className="border-b align-top text-textSub">
                    <td className="p-3 font-medium text-text">{competitor.name}</td>
                    <td className="p-3">
                      {competitor.url ? (
                        <a href={competitor.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                          열기 <ExternalLink className="h-3 w-3" />
                        </a>
                      ) : (
                        <AssumptionBadge />
                      )}
                    </td>
                    <td className="p-3">{competitor.targetCustomer}</td>
                    <td className="p-3">{competitor.coreFeatures.join(", ")}</td>
                    <td className="p-3">{competitor.pricing}</td>
                    <td className="p-3">{competitor.strengths.join(", ")}</td>
                    <td className="p-3">{competitor.weaknesses.join(", ")}</td>
                    <td className="p-3">{competitor.differentiation}</td>
                    <td className="p-3">
                      {competitor.sourceUrl ? (
                        <a href={competitor.sourceUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline">
                          {competitor.sourceTitle ?? "데모 출처"}
                        </a>
                      ) : (
                        <AssumptionBadge />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Toast({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-md border border-cardBorder bg-card p-3 text-sm shadow-card">
      {type === "success" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-danger" />}
      <span className="text-text">{message}</span>
    </div>
  );
}
