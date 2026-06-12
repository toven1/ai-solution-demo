import { NextResponse } from "next/server";
import { UsageEventType } from "@prisma/client";
import { z } from "zod";

import { refreshProjectReadiness } from "@/lib/ai/service";
import { prisma } from "@/lib/db";

const saveQuestionsSchema = z.object({
  answers: z.array(
    z.object({
      id: z.string().min(1),
      answer: z.string().max(4000)
    })
  )
});

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = saveQuestionsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "답변 입력값을 확인해주세요." }, { status: 400 });
  }

  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, userId: true, organizationId: true }
    });

    if (!project) {
      return NextResponse.json({ error: "프로젝트를 찾을 수 없습니다." }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      for (const item of parsed.data.answers) {
        await tx.projectQuestion.updateMany({
          where: {
            id: item.id,
            projectId
          },
          data: {
            answer: item.answer
          }
        });
      }

      await tx.usageLog.create({
        data: {
          userId: project.userId,
          organizationId: project.organizationId,
          projectId: project.id,
          eventType: UsageEventType.SECTION_SAVE,
          provider: "app",
          creditsUsed: 0,
          metadata: { action: "save-followup-answers", count: parsed.data.answers.length }
        }
      });
    });

    await refreshProjectReadiness(projectId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "답변 저장에 실패했습니다." }, { status: 500 });
  }
}
