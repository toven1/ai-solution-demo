import { NextResponse } from "next/server";
import { generateMarketingCopy } from "@/lib/artifacts/service";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    await generateMarketingCopy((await params).projectId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "마케팅 카피 생성에 실패했습니다." }, { status: 500 });
  }
}
