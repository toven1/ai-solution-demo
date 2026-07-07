import { Coins } from "lucide-react";

import { BillingClient } from "@/components/billing/billing-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentOrDemoUser } from "@/lib/auth/session";
import { getBillingConfig } from "@/lib/billing/config";
import { billingPlans } from "@/lib/billing/plans";
import { getCreditBalance } from "@/lib/credits/service";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

const ledgerTypeLabels: Record<string, string> = {
  GRANT: "지급",
  SPEND: "사용",
  ADJUSTMENT: "조정"
};

async function loadCredits(userId: string) {
  try {
    const [balance, ledger] = await Promise.all([
      getCreditBalance(userId),
      prisma.creditLedger.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);
    return { balance, ledger };
  } catch {
    return { balance: null, ledger: [] };
  }
}

export default async function BillingPage() {
  const user = await getCurrentOrDemoUser();
  const billingConfig = getBillingConfig();
  const [paymentMethods, subscriptions] = user
    ? await Promise.all([
        prisma.paymentMethod.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } }),
        prisma.subscription.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" } })
      ])
    : [[], []];
  const credits = user ? await loadCredits(user.id) : null;
  const unlimited = Boolean(user && (user.hasUnlimitedCredits || user.isSuperAdmin));

  return (
    <main className="mx-auto grid max-w-7xl gap-5 px-5 py-8">
      <div>
        <p className="text-sm font-semibold text-accent">Billing</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-normal text-text">결제정보와 요금제</h1>
        <p className="mt-2 text-sm leading-6 text-textSub">
          실제 결제는 PG 결제창 연동 준비가 끝난 뒤에만 활성화됩니다. 현재 상태와 필요한 설정을 이 화면에서 확인합니다.
        </p>
      </div>

      {user && credits ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5 text-accentStrong" />
              크레딧
            </CardTitle>
            <CardDescription>AI 생성 작업마다 크레딧이 차감됩니다. 잔액이 부족하면 관리자에게 지급을 요청하세요.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-accentSoft p-4">
                <div className="text-xs font-medium uppercase text-textFaint">보유 크레딧</div>
                <div className="mt-1 text-2xl font-semibold text-accentStrong">
                  {unlimited ? "무제한" : credits.balance !== null ? credits.balance.toLocaleString("ko-KR") : "확인 불가"}
                </div>
              </div>
              <div className="rounded-md bg-surface p-4 md:col-span-2">
                <div className="text-xs font-medium uppercase text-textFaint">차감 기준</div>
                <p className="mt-1 text-sm leading-6 text-textSub">
                  추가 질문 5 · 시장조사/경쟁사/마케팅 카피 10 · 페르소나/Canvas/MVP/실험/IR 8 · 사업계획서 전체 20, 문항별 3 크레딧
                </p>
              </div>
            </div>
            <div className="grid gap-2">
              <div className="text-sm font-medium text-text">최근 크레딧 내역</div>
              {credits.ledger.length === 0 ? (
                <div className="rounded-md bg-surface p-3 text-sm text-textFaint">크레딧 내역이 없습니다.</div>
              ) : (
                credits.ledger.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between rounded-md border border-border p-3 text-sm">
                    <div>
                      <div className="font-medium text-text">
                        {ledgerTypeLabels[entry.type] ?? entry.type} · {entry.reason}
                      </div>
                      <div className="mt-1 text-xs text-textFaint">{new Date(entry.createdAt).toLocaleString("ko-KR")}</div>
                    </div>
                    <div className="text-right">
                      <div className={entry.amount >= 0 ? "font-semibold text-success" : "font-semibold text-danger"}>
                        {entry.amount >= 0 ? `+${entry.amount}` : entry.amount}
                      </div>
                      <div className="mt-1 text-xs text-textFaint">잔액 {entry.balanceAfter.toLocaleString("ko-KR")}</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      <BillingClient
        plans={[...billingPlans]}
        initialPaymentMethods={paymentMethods}
        initialSubscriptions={subscriptions}
        billingConfig={billingConfig}
      />
    </main>
  );
}
