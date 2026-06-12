import { notFound } from "next/navigation";

import { ErrorState } from "@/components/common/error-state";
import { IndustryGuidePanel } from "@/components/project/industry-guide-panel";
import { ProjectHeader } from "@/components/project/project-header";
import { ProjectSidebar } from "@/components/project/project-sidebar";
import { WorkspaceStepContent } from "@/components/project/workspace-step-content";
import { prisma } from "@/lib/db";
import { demoProjectFallback, industryFallback } from "@/lib/demo";
import { businessPlanSectionTemplates } from "@/lib/plan-sections";
import { workspaceSteps, type WorkspaceStep } from "@/lib/workspace-steps";

const validSteps = workspaceSteps.map(([, step]) => step);

export function normalizeWorkspaceStep(step?: string): WorkspaceStep | null {
  if (!step) return "overview";
  return validSteps.includes(step as WorkspaceStep) ? (step as WorkspaceStep) : null;
}

async function getWorkspaceData(projectId: string) {
  try {
    const [project, industries] = await Promise.all([
      prisma.project.findUnique({
        where: { id: projectId },
        include: {
          industryTemplate: true,
          businessPlan: { orderBy: { order: "asc" } },
          questions: { orderBy: { order: "asc" } },
          researchSources: { orderBy: { createdAt: "desc" } },
          marketInsights: { orderBy: { createdAt: "asc" } },
          competitors: { orderBy: { createdAt: "desc" } },
          personas: { orderBy: { createdAt: "desc" } },
          bmCanvas: true,
          mvpFeatures: { orderBy: { order: "asc" } },
          hypotheses: { orderBy: { createdAt: "desc" } },
          irOnePager: true,
          marketingCopy: { orderBy: { createdAt: "asc" } },
          generatedDocuments: {
            orderBy: { updatedAt: "desc" },
            include: {
              versions: { orderBy: { version: "desc" } }
            }
          },
          mentorShares: {
            orderBy: { createdAt: "desc" },
            include: {
              mentorComments: { select: { id: true } }
            }
          }
        }
      }),
      prisma.industryTemplate.findMany({
        orderBy: { industryName: "asc" },
        select: { industryName: true }
      })
    ]);

    if (!project) return null;

    const template =
      project.industryTemplate ??
      (await prisma.industryTemplate.findUnique({
        where: { industryName: project.industry }
      }));

    return {
      project: {
        ...project,
        industryTemplate: template
      },
      industries: industries.length > 0 ? industries.map((industry) => industry.industryName) : industryFallback,
      dbError: false
    };
  } catch {
    if (projectId !== demoProjectFallback.id) {
      return { project: null, industries: industryFallback, dbError: true };
    }

    return {
      project: {
        ...demoProjectFallback,
        industryTemplate: null,
        ideaDescription:
          "중소형 동네 학원은 학부모 상담, 학생별 피드백, 재등록 관리에 많은 시간을 쓰지만 체계적인 리포트 도구가 부족하다.",
        goal: "4주 안에 문제 인터뷰 15건과 리포트 MVP 파일럿 3곳을 확보한다.",
        teamSize: 2,
        availableResources: "교육업 지인 네트워크, 상담 스크립트 샘플, 노션 기반 수동 리포트 템플릿",
        mainConcern: "월 구독료를 낼 만큼 상담 자동화 문제를 크게 느끼는지 검증이 필요하다.",
        businessPlan: businessPlanSectionTemplates.map(([sectionKey, title, guide], index) => ({
          id: `${sectionKey}-fallback`,
          sectionKey,
          title,
          guide,
          aiDraft: "",
          userContent: "",
          evidenceSourceIds: [],
          completenessScore: 0,
          order: index + 1,
          projectId,
          createdAt: new Date(),
          updatedAt: new Date()
        })),
        questions: [],
        researchSources: [],
        marketInsights: [],
        competitors: [],
        personas: [],
        mvpFeatures: [],
        hypotheses: [],
        bmCanvas: null,
        irOnePager: null,
        marketingCopy: [],
        generatedDocuments: [],
        mentorShares: [],
        usageLogs: [],
        creditLedger: [],
        userId: "fallback-user",
        organizationId: "fallback-org",
        industryTemplateId: null
      },
      industries: industryFallback,
      dbError: true
    };
  }
}

export async function ProjectWorkspaceView({ projectId, step }: { projectId: string; step: WorkspaceStep }) {
  const data = await getWorkspaceData(projectId);

  if (!data?.project) {
    notFound();
  }

  return (
    <div className="flex flex-col lg:flex-row">
      <ProjectSidebar projectId={data.project.id} />
      <main className="min-w-0 flex-1 px-5 py-6 lg:px-8">
        <div className="grid gap-5">
          {data.dbError ? (
            <ErrorState title="DB 연결을 확인하세요" description="현재 화면은 데모 fallback으로 표시 중입니다. PostgreSQL을 실행하고 seed를 다시 적용하면 실제 데이터가 표시됩니다." />
          ) : null}
          <ProjectHeader project={data.project} />
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <WorkspaceStepContent step={step} project={data.project} industries={data.industries} />
            <IndustryGuidePanel template={data.project.industryTemplate} />
          </div>
        </div>
      </main>
    </div>
  );
}
