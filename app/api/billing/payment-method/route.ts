import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentOrDemoUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

const schema = z.object({
  billingName: z.string().min(2),
  cardNumber: z.string().min(12),
  expiryMonth: z.string().min(1).max(2),
  expiryYear: z.string().min(2).max(4)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "결제정보를 확인해주세요." }, { status: 400 });

  const user = await getCurrentOrDemoUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const digits = parsed.data.cardNumber.replace(/\D/g, "");
  const maskedNumber = `**** **** **** ${digits.slice(-4)}`;

  await prisma.paymentMethod.updateMany({
    where: { userId: user.id },
    data: { isDefault: false }
  });

  const paymentMethod = await prisma.paymentMethod.create({
    data: {
      userId: user.id,
      provider: "mock-pg",
      methodType: "card",
      billingName: parsed.data.billingName,
      maskedNumber,
      expiryMonth: parsed.data.expiryMonth.padStart(2, "0"),
      expiryYear: parsed.data.expiryYear.length === 2 ? `20${parsed.data.expiryYear}` : parsed.data.expiryYear,
      isDefault: true,
      metadata: { pgStatus: "business_registration_required", storedRawCard: false }
    }
  });

  await prisma.billingEvent.create({
    data: {
      userId: user.id,
      organizationId: user.organizationId,
      provider: "mock-pg",
      eventType: "payment_method_registered",
      status: "success",
      metadata: { paymentMethodId: paymentMethod.id }
    }
  });

  return NextResponse.json({ paymentMethod });
}
