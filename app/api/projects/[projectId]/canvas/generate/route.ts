import { NextResponse } from "next/server";
import { generateBMCanvas } from "@/lib/artifacts/service";

export async function POST(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  try {
    await generateBMCanvas((await params).projectId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "BM Canvas 생성에 실패했습니다." }, { status: 500 });
  }
}
