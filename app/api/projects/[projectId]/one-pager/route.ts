import { NextResponse } from "next/server";
import { z } from "zod";
import { refreshArtifactReadiness } from "@/lib/artifacts/service";
import { prisma } from "@/lib/db";

const schema = z.object({
  problem: z.string(),
  solution: z.string(),
  customer: z.string(),
  market: z.string(),
  product: z.string(),
  businessModel: z.string(),
  competition: z.string(),
  goToMarket: z.string(),
  validationPlan: z.string(),
  team: z.string(),
  ask: z.string()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
  try {
    await prisma.iROnePager.upsert({ where: { projectId }, update: parsed.data, create: { projectId, ...parsed.data } });
    await refreshArtifactReadiness(projectId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "IR One-Pager 저장에 실패했습니다." }, { status: 500 });
  }
}
