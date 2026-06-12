import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  experiments: z.array(z.object({
    id: z.string(),
    hypothesis: z.string(),
    method: z.string(),
    successMetric: z.string(),
    requiredData: z.string(),
    estimatedCost: z.string(),
    pivotCriteria: z.string(),
    timeline: z.string(),
    status: z.string()
  }))
});

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
  try {
    for (const experiment of parsed.data.experiments) {
      await prisma.validationHypothesis.updateMany({ where: { id: experiment.id, projectId }, data: experiment });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "검증 실험 저장에 실패했습니다." }, { status: 500 });
  }
}
