import { NextResponse } from "next/server";
import { UsageEventType } from "@prisma/client";

import { prisma } from "@/lib/db";
import { updateProjectSchema } from "@/lib/validators/project";

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = updateProjectSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
  }

  try {
    const existing = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true, organizationId: true }
    });

    if (!existing) {
      return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
    }

    const industryTemplate = parsed.data.industry
      ? await prisma.industryTemplate.findUnique({
          where: { industryName: parsed.data.industry },
          select: { id: true }
        })
      : null;

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...parsed.data,
        ...(parsed.data.industry ? { industryTemplateId: industryTemplate?.id ?? null } : {}),
        usageLogs: {
          create: {
            userId: existing.userId,
            organizationId: existing.organizationId,
            eventType: UsageEventType.SECTION_SAVE,
            provider: "app",
            creditsUsed: 0,
            metadata: { source: "project-detail-form" }
          }
        }
      },
      select: { id: true }
    });

    return NextResponse.json({ projectId: project.id });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "저장 중 문제가 발생했습니다." }, { status: 500 });
  }
}
