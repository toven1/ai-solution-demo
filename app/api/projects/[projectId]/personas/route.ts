import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const schema = z.object({
  personas: z.array(z.object({
    id: z.string(),
    name: z.string(),
    segment: z.string(),
    description: z.string(),
    jobsToBeDone: z.array(z.string()),
    pains: z.array(z.string()),
    gains: z.array(z.string()),
    buyingTriggers: z.array(z.string()),
    objections: z.array(z.string()),
    interviewQuestions: z.array(z.string())
  }))
});

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "입력값을 확인해주세요." }, { status: 400 });
  try {
    for (const persona of parsed.data.personas) {
      await prisma.persona.updateMany({ where: { id: persona.id, projectId }, data: persona });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "페르소나 저장에 실패했습니다." }, { status: 500 });
  }
}
