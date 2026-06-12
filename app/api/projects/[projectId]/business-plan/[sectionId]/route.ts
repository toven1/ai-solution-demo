import { NextResponse } from "next/server";
import { UsageEventType } from "@prisma/client";
import { z } from "zod";

import { refreshProjectReadiness } from "@/lib/ai/service";
import { prisma } from "@/lib/db";

const saveSectionSchema = z.object({
  userContent: z.string().max(12000),
  completenessScore: z.coerce.number().int().min(0).max(100).optional()
});

function scoreContent(content: string, fallback = 0) {
  const lengthScore = Math.min(70, Math.floor(content.trim().length / 12));
  const structureScore = content.includes("\n") || content.includes("-") ? 10 : 0;
  return Math.max(fallback, Math.min(100, lengthScore + structureScore));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string; sectionId: string }> }
) {
  const { projectId, sectionId } = await params;
  const body = await request.json().catch(() => null);
  const parsed = saveSectionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "문항 저장값을 확인해주세요." }, { status: 400 });
  }

  try {
    const section = await prisma.businessPlanSection.findFirst({
      where: {
        id: sectionId,
        projectId
      },
      include: {
        project: {
          select: {
            id: true,
            userId: true,
            organizationId: true,
            title: true
          }
        }
      }
    });

    if (!section) {
      return NextResponse.json({ error: "문항을 찾을 수 없습니다." }, { status: 404 });
    }

    const content = parsed.data.userContent;
    const completenessScore = parsed.data.completenessScore ?? scoreContent(content, section.completenessScore);

    await prisma.$transaction(async (tx) => {
      const updated = await tx.businessPlanSection.update({
        where: { id: section.id },
        data: {
          userContent: content,
          completenessScore
        }
      });

      let document = await tx.generatedDocument.findFirst({
        where: {
          projectId,
          type: "business-plan-section",
          title: updated.title
        },
        include: { versions: true }
      });

      if (!document) {
        document = await tx.generatedDocument.create({
          data: {
            projectId,
            type: "business-plan-section",
            title: updated.title,
            format: "markdown",
            content: content || updated.aiDraft || ""
          },
          include: { versions: true }
        });
      } else {
        document = await tx.generatedDocument.update({
          where: { id: document.id },
          data: {
            content: content || updated.aiDraft || ""
          },
          include: { versions: true }
        });
      }

      await tx.documentVersion.create({
        data: {
          documentId: document.id,
          version: document.versions.length + 1,
          content: content || updated.aiDraft || ""
        }
      });

      await tx.usageLog.create({
        data: {
          userId: section.project.userId,
          organizationId: section.project.organizationId,
          projectId: section.project.id,
          eventType: UsageEventType.SECTION_SAVE,
          provider: "app",
          creditsUsed: 0,
          metadata: { action: "save-business-plan-section", sectionKey: section.sectionKey }
        }
      });
    });

    await refreshProjectReadiness(projectId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "문항 저장에 실패했습니다." }, { status: 500 });
  }
}
