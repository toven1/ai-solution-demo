import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";

import { refreshArtifactReadiness } from "@/lib/artifacts/service";
import { prisma } from "@/lib/db";

const copySchema = z.object({
  copies: z.array(z.object({
    id: z.string(),
    channel: z.string(),
    headline: z.string(),
    subheadline: z.string().nullable().optional(),
    cta: z.string().nullable().optional(),
    body: z.string(),
    problemSection: z.string().nullable().optional(),
    solutionSection: z.string().nullable().optional(),
    featureSection: z.string().nullable().optional(),
    socialProof: z.string().nullable().optional(),
    pricingCopy: z.string().nullable().optional(),
    faqs: z.any().optional(),
    variants: z.any().optional()
  }))
});

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const parsed = copySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
  try {
    for (const copy of parsed.data.copies) {
      await prisma.marketingCopy.updateMany({
        where: { id: copy.id, projectId },
        data: {
          channel: copy.channel,
          headline: copy.headline,
          subheadline: copy.subheadline,
          cta: copy.cta,
          body: copy.body,
          problemSection: copy.problemSection,
          solutionSection: copy.solutionSection,
          featureSection: copy.featureSection,
          socialProof: copy.socialProof,
          pricingCopy: copy.pricingCopy,
          faqs: copy.faqs as Prisma.InputJsonValue,
          variants: copy.variants as Prisma.InputJsonValue
        }
      });
    }
    await refreshArtifactReadiness(projectId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "마케팅 카피 저장에 실패했습니다." }, { status: 500 });
  }
}
