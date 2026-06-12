import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  features: z.array(z.object({
    id: z.string(),
    title: z.string(),
    description: z.string().nullable().optional(),
    reach: z.coerce.number().int(),
    impact: z.coerce.number().int(),
    confidence: z.coerce.number().int(),
    effort: z.coerce.number().int(),
    riceScore: z.coerce.number(),
    priority: z.coerce.number().int(),
    moscowCategory: z.string()
  }))
});

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
  try {
    for (const feature of parsed.data.features) {
      await prisma.mVPFeature.updateMany({ where: { id: feature.id, projectId }, data: feature });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "MVP 저장에 실패했습니다." }, { status: 500 });
  }
}
