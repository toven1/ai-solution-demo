import { NextResponse } from "next/server";
import { z } from "zod";

import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  organizationName: z.string().min(2)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "회원가입 정보를 확인해주세요." }, { status: 400 });

  try {
    const user = await prisma.$transaction(async (tx) => {
      const organization = await tx.organization.create({
        data: { name: parsed.data.organizationName }
      });
      return tx.user.create({
        data: {
          email: parsed.data.email.toLowerCase(),
          name: parsed.data.name,
          passwordHash: hashPassword(parsed.data.password),
          organizationId: organization.id,
          creditLedger: {
            create: {
              organizationId: organization.id,
              type: "GRANT",
              amount: 300,
              balanceAfter: 300,
              reason: "Signup trial credits"
            }
          }
        }
      });
    });

    await createSession(user.id);
    return NextResponse.json({ userId: user.id });
  } catch (error: any) {
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "이미 가입된 이메일입니다." }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json({ error: "회원가입에 실패했습니다." }, { status: 500 });
  }
}
