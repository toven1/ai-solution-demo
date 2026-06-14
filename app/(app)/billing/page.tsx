import { BillingClient } from "@/components/billing/billing-client";
import { getCurrentOrDemoUser } from "@/lib/auth/session";
import { billingPlans } from "@/lib/billing/plans";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await getCurrentOrDemoUser();
  const [paymentMethods, subscriptions] = user
    ? await Promise.all([
        prisma.paymentMethod.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
        prisma.subscription.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
      ])
    : [[], []];

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-5 py-8">
      <div>
        <p className="text-sm font-medium text-teal-800">Billing</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-slate-950">결제정보와 요금제</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          사업자등록 전에는 실제 PG 결제 대신 mock 결제 상태로 데모합니다. PG 신청 후 provider만 교체할 수 있도록 DB 구조를 분리했습니다.
        </p>
      </div>
      <BillingClient plans={[...billingPlans]} initialPaymentMethods={paymentMethods} initialSubscriptions={subscriptions} />
    </main>
  );
}
