import { NextResponse } from "next/server";
import { z } from "zod";

import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "로그인 정보를 확인해주세요." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email.toLowerCase() } });
  if (!user?.passwordHash || !verifyPassword(parsed.data.password, user.passwordHash)) {
    return NextResponse.json({ error: "이메일 또는 비밀번호가 올바르지 않습니다." }, { status: 401 });
  }

  await createSession(user.id);
  return NextResponse.json({ userId: user.id });
}
