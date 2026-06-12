import { NextResponse } from "next/server";
import { z } from "zod";

import { createMentorComment } from "@/lib/shares/service";

const schema = z.object({
  authorName: z.string().max(80).optional(),
  authorEmail: z.string().email().optional().or(z.literal("")),
  sectionKey: z.string().max(80).optional(),
  documentId: z.string().optional(),
  body: z.string().min(2).max(2000)
});

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "코멘트 내용을 확인해주세요." }, { status: 400 });

  try {
    const { token } = await params;
    const comment = await createMentorComment({
      token,
      authorName: parsed.data.authorName,
      authorEmail: parsed.data.authorEmail || undefined,
      sectionKey: parsed.data.sectionKey,
      documentId: parsed.data.documentId,
      body: parsed.data.body
    });
    return NextResponse.json({ comment });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "공유 링크가 비활성화되었거나 코멘트 작성에 실패했습니다." }, { status: 500 });
  }
}
