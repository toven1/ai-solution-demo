import { NextResponse } from "next/server";
import { ProjectStage, UsageEventType } from "@prisma/client";

import { getCurrentOrDemoUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { businessPlanSectionTemplates } from "@/lib/plan-sections";
import { createProjectSchema } from "@/lib/validators/project";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = createProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
  }

  try {
    const industryTemplate = await prisma.industryTemplate.findUnique({
      where: { industryName: parsed.data.industry },
      select: { id: true }
    });

    const currentUser = await getCurrentOrDemoUser();
    const organizationId = currentUser?.organizationId ?? "demo-org";
    const organization = await prisma.organization.upsert({
      where: { id: organizationId },
      update: {},
      create: { id: organizationId, name: "FounderOS Demo Studio" }
    });
    const user =
      currentUser ??
      (await prisma.user.upsert({
        where: { email: "demo@founderos.ai" },
        update: { organizationId: organization.id },
        create: {
          email: "demo@founderos.ai",
          name: "Demo Founder",
          organizationId: organization.id
        }
      }));

    const project = await prisma.project.create({
      data: {
        ...parsed.data,
        userId: user.id,
        organizationId: organization.id,
        industryTemplateId: industryTemplate?.id,
        stage: ProjectStage.IDEA,
        progress: 8,
        readinessScore: 20,
        businessPlan: {
          create: businessPlanSectionTemplates.map(([sectionKey, title, guide], index) => ({
            sectionKey,
            title,
            guide,
            aiDraft: "",
            userContent: "",
            evidenceSourceIds: [],
            completenessScore: 0,
            order: index + 1
          }))
        },
        usageLogs: {
          create: {
            userId: user.id,
            organizationId: organization.id,
            eventType: UsageEventType.PROJECT_CREATE,
            provider: "app",
            operation: "project-create",
            status: "success",
            creditsUsed: 0,
            metadata: { source: "project-create-form" }
          }
        }
      },
      select: { id: true }
    });

    return NextResponse.json({ projectId: project.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "DB 연결 또는 저장 중 문제가 발생했습니다." }, { status: 500 });
  }
}
