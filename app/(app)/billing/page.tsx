import { BillingClient } from "@/components/billing/billing-client";
import { getCurrentOrDemoUser } from "@/lib/auth/session";
import { getBillingConfig } from "@/lib/billing/config";
import { billingPlans } from "@/lib/billing/plans";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function BillingPage() {
  const user = await getCurrentOrDemoUser();
  const billingConfig = getBillingConfig();
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
          실제 결제는 PG 결제창 연동 준비가 끝난 뒤에만 활성화됩니다. 현재 상태와 필요한 설정을 이 화면에서 확인합니다.
        </p>
      </div>
      <BillingClient
        plans={[...billingPlans]}
        initialPaymentMethods={paymentMethods}
        initialSubscriptions={subscriptions}
        billingConfig={billingConfig}
      />
    </main>
  );
}
