"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, RotateCcw, Save, Sparkles, XCircle } from "lucide-react";

import { ConfidenceBadge } from "@/components/common/confidence-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type PlanSection = {
  id: string;
  sectionKey: string;
  title: string;
  guide: string;
  aiDraft: string | null;
  userContent: string | null;
  completenessScore: number;
  order: number;
};

export function BusinessPlanEditor({ projectId, sections }: { projectId: string; sections: PlanSection[] }) {
  const router = useRouter();
  const [contents, setContents] = useState<Record<string, string>>(
    Object.fromEntries(sections.map((section) => [section.id, section.userContent || section.aiDraft || ""]))
  );
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setContents(Object.fromEntries(sections.map((section) => [section.id, section.userContent || section.aiDraft || ""])));
  }, [sections]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const completedCount = useMemo(
    () => sections.filter((section) => section.completenessScore >= 60 || (section.userContent && section.userContent.trim().length > 20)).length,
    [sections]
  );

  async function generateAll() {
    setBusyKey("generate-all");
    const response = await fetch(`/api/projects/${projectId}/business-plan/generate`, { method: "POST" });
    setBusyKey(null);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setToast({ type: "error", message: data?.error ?? "전체 초안 생성에 실패했습니다." });
      return;
    }

    setToast({ type: "success", message: "14개 문항의 AI 초안을 생성했습니다." });
    router.refresh();
  }

  async function generateSection(sectionId: string) {
    setBusyKey(`generate-${sectionId}`);
    const response = await fetch(`/api/projects/${projectId}/business-plan/${sectionId}/generate`, { method: "POST" });
    setBusyKey(null);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setToast({ type: "error", message: data?.error ?? "문항 초안 생성에 실패했습니다." });
      return;
    }

    setToast({ type: "success", message: "문항 초안을 생성했습니다." });
    router.refresh();
  }

  async function saveSection(section: PlanSection) {
    setBusyKey(`save-${section.id}`);
    const response = await fetch(`/api/projects/${projectId}/business-plan/${section.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userContent: contents[section.id] ?? ""
      })
    });
    setBusyKey(null);

    if (!response.ok) {
      setToast({ type: "error", message: "문항 저장에 실패했습니다." });
      return;
    }

    setToast({ type: "success", message: "문항 수정본이 저장되었습니다." });
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>사업계획서 문항별 editor</CardTitle>
            <CardDescription>
              긴 textarea 하나가 아니라 14개 고정 문항별로 AI 초안과 사용자 수정본을 관리합니다.
            </CardDescription>
          </div>
          <Button onClick={generateAll} disabled={busyKey !== null}>
            <Sparkles className="h-4 w-4" />
            전체 초안 생성
          </Button>
        </CardHeader>
        <CardContent>
          {toast ? <Toast type={toast.type} message={toast.message} /> : null}
          <div className="rounded-md bg-surface p-3 text-sm text-textSub">
            완료 문항 {completedCount}/{sections.length}
          </div>
        </CardContent>
      </Card>

      {sections.map((section) => {
        const hasDraft = Boolean(section.aiDraft && section.aiDraft.trim().length > 0);
        const confidence = section.completenessScore >= 70 ? "high" : section.completenessScore >= 35 ? "medium" : "low";

        return (
          <Card key={section.id}>
            <CardHeader>
              <div className="flex flex-col justify-between gap-3 md:flex-row md:items-start">
                <div>
                  <CardTitle className="text-base">{section.order}. {section.title}</CardTitle>
                  <CardDescription className="mt-2 leading-6">{section.guide}</CardDescription>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <ConfidenceBadge level={confidence} />
                  <span className="text-xs text-textFaint">{section.completenessScore}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-md bg-surface p-3">
                <div className="mb-2 text-xs font-medium uppercase tracking-wide text-textFaint">AI 초안</div>
                <p className="whitespace-pre-wrap text-sm leading-6 text-textSub">
                  {hasDraft ? section.aiDraft : "아직 생성된 AI 초안이 없습니다."}
                </p>
              </div>

              <div>
                <div className="mb-2 text-sm font-medium text-text">사용자 수정본</div>
                <Textarea
                  className="min-h-40"
                  value={contents[section.id] ?? ""}
                  onChange={(event) => setContents((current) => ({ ...current, [section.id]: event.target.value }))}
                  placeholder="AI 초안을 바탕으로 직접 수정해 저장하세요. 저장된 수정본이 이후 export에 우선 반영됩니다."
                />
              </div>

              <div className="flex flex-wrap justify-end gap-2">
                <Button
                  variant="secondary"
                  onClick={() => generateSection(section.id)}
                  disabled={busyKey !== null}
                >
                  {hasDraft ? <RotateCcw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                  {hasDraft ? "다시 생성하기" : "생성하기"}
                </Button>
                <Button onClick={() => saveSection(section)} disabled={busyKey !== null}>
                  <Save className="h-4 w-4" />
                  {busyKey === `save-${section.id}` ? "저장 중..." : "저장하기"}
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
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
