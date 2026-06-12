import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  customerSegments: z.string(),
  valuePropositions: z.string(),
  channels: z.string(),
  customerRelationships: z.string(),
  revenueStreams: z.string(),
  keyResources: z.string(),
  keyActivities: z.string(),
  keyPartners: z.string(),
  costStructure: z.string()
});

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
  try {
    await prisma.bMCanvas.upsert({ where: { projectId }, update: parsed.data, create: { projectId, ...parsed.data } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "BM Canvas 저장에 실패했습니다." }, { status: 500 });
  }
}
