import Link from "next/link";
import { ArrowUpRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/db";
import { demoProjectFallback } from "@/lib/demo";

export const dynamic = "force-dynamic";

async function getProjects() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        ideaSummary: true,
        industry: true,
        targetCustomer: true,
        stage: true,
        progress: true,
        readinessScore: true,
        updatedAt: true
      }
    });

    return projects.length > 0 ? projects : [demoProjectFallback];
  } catch {
    return [demoProjectFallback];
  }
}

export default async function DashboardPage() {
  const projects = await getProjects();

  return (
    <main className="mx-auto w-full max-w-7xl px-5 py-8">
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="text-sm font-medium text-teal-800">Dashboard</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-normal">사업화 프로젝트</h1>
          <p className="mt-2 text-sm text-slate-600">생성한 아이디어를 단계별 워크스페이스에서 관리합니다.</p>
        </div>
        <Button asChild>
          <Link href="/projects/new">
            <Plus className="h-4 w-4" /> 새 프로젝트
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {projects.map((project) => (
          <Card key={project.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="leading-6">{project.title}</CardTitle>
                  <CardDescription className="mt-2">{project.industry} · {project.targetCustomer}</CardDescription>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                  {project.stage}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="line-clamp-3 min-h-16 text-sm leading-6 text-slate-600">{project.ideaSummary}</p>
              <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
                <div className="rounded-md bg-slate-50 p-3">
                  <div className="text-slate-500">Progress</div>
                  <div className="mt-1 text-xl font-semibold">{project.progress}%</div>
                </div>
                <div className="rounded-md bg-amber-50 p-3">
                  <div className="text-slate-500">Readiness</div>
                  <div className="mt-1 text-xl font-semibold">{project.readinessScore}</div>
                </div>
              </div>
              <Button asChild variant="outline" className="mt-5 w-full">
                <Link href={`/projects/${project.id}`}>
                  워크스페이스 열기 <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
