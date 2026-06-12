"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Search, XCircle } from "lucide-react";

import { AssumptionBadge } from "@/components/common/assumption-badge";
import { ConfidenceBadge } from "@/components/common/confidence-badge";
import { EmptyState } from "@/components/common/empty-state";
import { SourceCard } from "@/components/common/source-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MarketInsight = {
  id: string;
  category: string;
  title: string;
  content: string;
  confidenceLevel: string;
  evidenceSourceIds: string[];
  isAssumption: boolean;
  isAiAssumed: boolean;
};

type ResearchSource = {
  id: string;
  title: string;
  url: string;
  publisher: string | null;
  notes: string | null;
};

const categoryLabels: Record<string, string> = {
  keyword: "시장 키워드",
  trend: "시장 트렌드",
  customer_problem: "고객 문제",
  opportunity: "기회 요인",
  risk: "리스크 요인"
};

export function ResearchReport({
  projectId,
  insights,
  sources
}: {
  projectId: string;
  insights: MarketInsight[];
  sources: ResearchSource[];
}) {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const sourceMap = new Map(sources.map((source) => [source.id, source]));

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function generateResearch() {
    setIsGenerating(true);
    const response = await fetch(`/api/projects/${projectId}/research/generate`, { method: "POST" });
    setIsGenerating(false);

    if (!response.ok) {
      setToast({ type: "error", message: "시장조사 생성에 실패했습니다." });
      return;
    }

    setToast({ type: "success", message: "MockResearchProvider가 시장조사를 생성했습니다." });
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>Research Report</CardTitle>
            <CardDescription>외부 리서치 provider 교체를 전제로 저장되는 시장조사 리포트입니다.</CardDescription>
          </div>
          <Button onClick={generateResearch} disabled={isGenerating}>
            <Search className="h-4 w-4" />
            {insights.length > 0 ? "다시 생성" : "시장조사 생성"}
          </Button>
        </CardHeader>
        <CardContent>
          {toast ? <Toast type={toast.type} message={toast.message} /> : null}
          {insights.length === 0 ? (
            <EmptyState title="아직 시장조사가 없습니다" description="시장조사 생성 버튼을 누르면 데모 출처, MarketInsight, ResearchSource가 DB에 저장됩니다." />
          ) : (
            <div className="grid gap-3">
              {insights.map((insight) => {
                const evidence = insight.evidenceSourceIds.map((id) => sourceMap.get(id)).filter(Boolean) as ResearchSource[];

                return (
                  <div key={insight.id} className="rounded-md border bg-white p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                        {categoryLabels[insight.category] ?? insight.category}
                      </span>
                      <ConfidenceBadge level={insight.confidenceLevel === "high" ? "high" : insight.confidenceLevel === "low" ? "low" : "medium"} />
                      {insight.isAssumption || insight.isAiAssumed || evidence.length === 0 ? <AssumptionBadge /> : null}
                    </div>
                    <h3 className="mt-3 font-semibold">{insight.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{insight.content}</p>
                    <div className="mt-3 text-xs text-slate-500">
                      근거 링크 {evidence.length}개
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>근거 링크</CardTitle>
          <CardDescription>MockResearchProvider가 반환한 출처는 데모 출처로 표시됩니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {sources.length > 0 ? (
            sources.map((source) => <SourceCard key={source.id} {...source} />)
          ) : (
            <EmptyState title="저장된 출처가 없습니다" description="ResearchSource는 시장조사 생성 시 반드시 DB에 저장됩니다." />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Toast({ type, message }: { type: "success" | "error"; message: string }) {
  return (
    <div className="mb-4 flex items-center gap-2 rounded-md border bg-white p-3 text-sm shadow-sm">
      {type === "success" ? <CheckCircle2 className="h-4 w-4 text-teal-700" /> : <XCircle className="h-4 w-4 text-red-600" />}
      <span className={type === "success" ? "text-teal-900" : "text-red-700"}>{message}</span>
    </div>
  );
}
