import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentOrDemoUser } from "@/lib/auth/session";
import { getPlan } from "@/lib/billing/plans";
import { prisma } from "@/lib/db";

const schema = z.object({
  planKey: z.string().min(1)
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "요금제를 선택해주세요." }, { status: 400 });

  const user = await getCurrentOrDemoUser();
  if (!user) return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });

  const plan = getPlan(parsed.data.planKey);
  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: { userId: user.id, isDefault: true },
    orderBy: { createdAt: "desc" }
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      organizationId: user.organizationId,
      provider: "mock-pg",
      planKey: plan.key,
      status: paymentMethod ? "active_mock" : "requires_payment_method",
      amountKrw: plan.priceKrw,
      billingInterval: "monthly",
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      paymentMethodId: paymentMethod?.id,
      metadata: {
        pgMode: "mock",
        businessRegistrationRequired: true,
        note: "실 PG 신청 전 데모용 결제 상태입니다."
      }
    }
  });

  await prisma.billingEvent.create({
    data: {
      userId: user.id,
      organizationId: user.organizationId,
      provider: "mock-pg",
      eventType: "subscription_created",
      status: subscription.status,
      amountKrw: plan.priceKrw,
      metadata: { subscriptionId: subscription.id, planKey: plan.key }
    }
  });

  return NextResponse.json({ subscription });
}
