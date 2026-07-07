"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Question = {
  id: string;
  question: string;
  answer: string | null;
  order: number;
};

export function FollowupQuestionsPanel({ projectId, questions }: { projectId: string; questions: Question[] }) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(questions.map((question) => [question.id, question.answer ?? ""]))
  );
  const [busyAction, setBusyAction] = useState<"generate" | "save" | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    setAnswers(Object.fromEntries(questions.map((question) => [question.id, question.answer ?? ""])));
  }, [questions]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function generateQuestions() {
    setBusyAction("generate");
    const response = await fetch(`/api/projects/${projectId}/questions/generate`, { method: "POST" });
    setBusyAction(null);

    if (!response.ok) {
      const data = await response.json().catch(() => null);
      setToast({ type: "error", message: data?.error ?? "질문 생성에 실패했습니다." });
      return;
    }

    setToast({ type: "success", message: "MockAI가 추가 질문을 생성했습니다." });
    router.refresh();
  }

  async function saveAnswers() {
    setBusyAction("save");
    const response = await fetch(`/api/projects/${projectId}/questions`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: Object.entries(answers).map(([id, answer]) => ({ id, answer }))
      })
    });
    setBusyAction(null);

    if (!response.ok) {
      setToast({ type: "error", message: "답변 저장에 실패했습니다." });
      return;
    }

    setToast({ type: "success", message: "답변이 저장되었습니다." });
    router.refresh();
  }

  return (
    <div className="grid gap-4">
      <Card>
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div>
            <CardTitle>추가 질문</CardTitle>
            <CardDescription>MockAIProvider가 프로젝트 정보를 바탕으로 검증 질문 5~7개를 생성합니다.</CardDescription>
          </div>
          <Button onClick={generateQuestions} disabled={busyAction !== null}>
            <Sparkles className="h-4 w-4" />
            {questions.length > 0 ? "다시 생성" : "질문 생성"}
          </Button>
        </CardHeader>
        <CardContent>
          {toast ? <Toast type={toast.type} message={toast.message} /> : null}
          {questions.length === 0 ? (
            <EmptyState title="아직 생성된 질문이 없습니다" description="질문 생성 버튼을 누르면 MockAI가 5~7개의 추가 질문을 생성하고 DB에 저장합니다." />
          ) : (
            <div className="grid gap-3">
              {questions.map((question) => (
                <div key={question.id} className="rounded-md border border-border p-4">
                  <div className="mb-2 text-xs font-medium text-textFaint">Question {question.order}</div>
                  <div className="font-medium leading-6 text-text">{question.question}</div>
                  <Textarea
                    className="mt-3 min-h-24"
                    value={answers[question.id] ?? ""}
                    onChange={(event) => setAnswers((current) => ({ ...current, [question.id]: event.target.value }))}
                    placeholder="답변을 입력하세요."
                  />
                </div>
              ))}
              <div className="flex justify-end">
                <Button onClick={saveAnswers} disabled={busyAction !== null}>
                  {busyAction === "save" ? "저장 중..." : "답변 저장"}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
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
