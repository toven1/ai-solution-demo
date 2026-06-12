import Link from "next/link";
import { ArrowLeft, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProgressCard } from "@/components/project/progress-card";
import { ReadinessScoreCard } from "@/components/project/readiness-score-card";

type ProjectHeaderProps = {
  project: {
    id: string;
    title: string;
    ideaSummary: string;
    industry: string;
    targetCustomer: string;
    progress: number;
    readinessScore: number;
  };
};

export function ProjectHeader({ project }: ProjectHeaderProps) {
  return (
    <div className="grid gap-4">
      <Button asChild variant="ghost" size="sm" className="w-fit px-0">
        <Link href="/dashboard">
          <ArrowLeft className="h-4 w-4" /> Dashboard
        </Link>
      </Button>
      <Card>
        <CardContent className="grid gap-5 p-5 xl:grid-cols-[1fr_220px_220px]">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800">{project.industry}</span>
              <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">{project.targetCustomer}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-normal text-slate-950">{project.title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{project.ideaSummary}</p>
            <Button asChild variant="outline" size="sm" className="mt-4">
              <Link href={`/projects/${project.id}?edit=1`}>
                <Pencil className="h-4 w-4" /> 상세 수정
              </Link>
            </Button>
          </div>
          <ProgressCard progress={project.progress} />
          <ReadinessScoreCard score={project.readinessScore} />
        </CardContent>
      </Card>
    </div>
  );
}
