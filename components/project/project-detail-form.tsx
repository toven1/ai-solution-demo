"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CheckCircle2, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateProjectSchema, type UpdateProjectInput } from "@/lib/validators/project";

type ProjectDetailFormProps = {
  project: {
    id: string;
    title: string;
    ideaSummary: string;
    ideaDescription: string;
    industry: string;
    targetCustomer: string;
    goal: string;
    teamSize: number;
    availableResources: string;
    mainConcern: string;
  };
  industries: string[];
};

export function ProjectDetailForm({ project, industries }: ProjectDetailFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isEditing, setIsEditing] = useState(searchParams.get("edit") === "1");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<UpdateProjectInput>({
    resolver: zodResolver(updateProjectSchema),
    defaultValues: project
  });

  async function onSubmit(values: UpdateProjectInput) {
    const response = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      setToast({ type: "error", message: "저장에 실패했습니다. 입력값과 DB 연결을 확인하세요." });
      return;
    }

    setToast({ type: "success", message: "프로젝트 상세가 저장되었습니다." });
    setIsEditing(false);
    router.refresh();
  }

  function cancelEdit() {
    reset(project);
    setIsEditing(false);
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>프로젝트 상세</CardTitle>
          <CardDescription>AI 질문과 산출물 생성을 위한 기준 정보입니다.</CardDescription>
        </div>
        {!isEditing ? (
          <Button variant="secondary" size="sm" onClick={() => setIsEditing(true)}>
            수정
          </Button>
        ) : null}
      </CardHeader>
      <CardContent>
        {toast ? (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-cardBorder bg-card p-3 text-sm shadow-card">
            {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-danger" />}
            <span className="text-text">{toast.message}</span>
          </div>
        ) : null}

        {isEditing ? (
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <Field label="프로젝트명" error={errors.title?.message}>
              <Input {...register("title")} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="업종 템플릿" error={errors.industry?.message}>
                <Select {...register("industry")}>
                  {industries.map((industry) => (
                    <option key={industry} value={industry}>
                      {industry}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="팀 규모" error={errors.teamSize?.message}>
                <Input type="number" min={1} {...register("teamSize")} />
              </Field>
            </div>
            <Field label="아이디어 요약" error={errors.ideaSummary?.message}>
              <Textarea {...register("ideaSummary")} />
            </Field>
            <Field label="아이디어 설명" error={errors.ideaDescription?.message}>
              <Textarea {...register("ideaDescription")} />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="목표 고객" error={errors.targetCustomer?.message}>
                <Input {...register("targetCustomer")} />
              </Field>
              <Field label="검증 목표" error={errors.goal?.message}>
                <Input {...register("goal")} />
              </Field>
            </div>
            <Field label="활용 가능한 자원" error={errors.availableResources?.message}>
              <Textarea {...register("availableResources")} />
            </Field>
            <Field label="가장 큰 걱정" error={errors.mainConcern?.message}>
              <Textarea {...register("mainConcern")} />
            </Field>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={cancelEdit} disabled={isSubmitting}>
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "저장 중..." : "저장"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="grid gap-3 text-sm">
            <Info label="아이디어 설명" value={project.ideaDescription} />
            <Info label="검증 목표" value={project.goal} />
            <Info label="활용 가능한 자원" value={project.availableResources} />
            <Info label="가장 큰 걱정" value={project.mainConcern} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-surface p-3">
      <div className="mb-1 text-xs font-medium uppercase tracking-wide text-textFaint">{label}</div>
      <div className="leading-6 text-textSub">{value}</div>
    </div>
  );
}
