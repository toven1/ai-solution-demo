import { NextResponse } from "next/server";
import { z } from "zod";

import { getCurrentOrDemoUser } from "@/lib/auth/session";
import { getBillingConfig } from "@/lib/billing/config";
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
  const billingConfig = getBillingConfig();
  if (!billingConfig.isLiveReady) {
    await prisma.billingEvent.create({
      data: {
        userId: user.id,
        organizationId: user.organizationId,
        provider: billingConfig.provider,
        eventType: "checkout_blocked",
        status: "blocked",
        amountKrw: plan.priceKrw,
        metadata: {
          planKey: plan.key,
          mode: billingConfig.mode,
          missingRequirements: billingConfig.missingRequirements
        }
      }
    });

    return NextResponse.json(
      {
        error: "실결제 PG 설정이 완료되지 않아 결제를 진행할 수 없습니다.",
        missingRequirements: billingConfig.missingRequirements
      },
      { status: 409 }
    );
  }

  const paymentMethod = await prisma.paymentMethod.findFirst({
    where: { userId: user.id, isDefault: true },
    orderBy: { createdAt: "desc" }
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId: user.id,
      organizationId: user.organizationId,
      provider: billingConfig.provider,
      planKey: plan.key,
      status: paymentMethod ? "active" : "requires_payment_method",
      amountKrw: plan.priceKrw,
      billingInterval: "monthly",
      currentPeriodEnd: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      paymentMethodId: paymentMethod?.id,
      metadata: {
        pgMode: billingConfig.mode,
        note: "실제 PG 결제 승인 결과를 연결할 자리입니다."
      }
    }
  });

  await prisma.billingEvent.create({
    data: {
      userId: user.id,
      organizationId: user.organizationId,
      provider: billingConfig.provider,
      eventType: "subscription_created",
      status: subscription.status,
      amountKrw: plan.priceKrw,
      metadata: { subscriptionId: subscription.id, planKey: plan.key }
    }
  });

  return NextResponse.json({ subscription });
}
