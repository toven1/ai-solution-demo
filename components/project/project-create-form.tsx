"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createProjectSchema, type CreateProjectInput } from "@/lib/validators/project";

type Props = {
  industries: string[];
};

export function ProjectCreateForm({ industries }: Props) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<CreateProjectInput>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: "",
      ideaSummary: "",
      ideaDescription: "",
      industry: industries[0] ?? "SaaS",
      targetCustomer: "",
      goal: "",
      teamSize: 1,
      availableResources: "",
      mainConcern: ""
    }
  });

  async function onSubmit(values: CreateProjectInput) {
    setServerError(null);
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setServerError(payload?.error ?? "프로젝트 생성에 실패했습니다.");
      return;
    }

    const payload = (await response.json()) as { projectId: string };
    router.push(`/projects/${payload.projectId}`);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>기본 정보</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-5">
          <Field label="프로젝트명" error={errors.title?.message}>
            <Input placeholder="예: 동네 학원을 위한 AI 상담 자동화 SaaS" {...register("title")} />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
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
              <Input type="number" min={1} {...register("teamSize", { valueAsNumber: true })} />
            </Field>
          </div>

          <Field label="아이디어 요약" error={errors.ideaSummary?.message}>
            <Textarea placeholder="한 문장으로 핵심 아이디어를 설명하세요." {...register("ideaSummary")} />
          </Field>

          <Field label="아이디어 설명" error={errors.ideaDescription?.message}>
            <Textarea placeholder="문제, 고객, 해결 방식, 현재 가설을 조금 더 자세히 적어주세요." {...register("ideaDescription")} />
          </Field>

          <div className="grid gap-5 md:grid-cols-2">
            <Field label="목표 고객" error={errors.targetCustomer?.message}>
              <Input placeholder="예: 초중등 보습학원 원장" {...register("targetCustomer")} />
            </Field>
            <Field label="이번 검증 목표" error={errors.goal?.message}>
              <Input placeholder="예: 4주 안에 파일럿 3곳 확보" {...register("goal")} />
            </Field>
          </div>

          <Field label="활용 가능한 자원" error={errors.availableResources?.message}>
            <Textarea placeholder="네트워크, 데이터, 예산, 팀 역량 등을 적어주세요." {...register("availableResources")} />
          </Field>

          <Field label="가장 큰 걱정" error={errors.mainConcern?.message}>
            <Textarea placeholder="시장성, 지불 의사, 기술 구현, 운영 리스크 등" {...register("mainConcern")} />
          </Field>

          {serverError ? <p className="rounded-md bg-red-50 p-3 text-sm text-red-700">{serverError}</p> : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "생성 중..." : "프로젝트 생성"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
    </div>
  );
}
