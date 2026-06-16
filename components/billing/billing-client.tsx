"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, CreditCard, ShieldCheck, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { BillingRuntimeConfig } from "@/lib/billing/config";

type Plan = {
  key: string;
  name: string;
  priceKrw: number;
  credits: number;
  description: string;
  features: readonly string[];
};

type PaymentMethod = {
  id: string;
  provider: string;
  billingName: string;
  maskedNumber: string;
  expiryMonth: string;
  expiryYear: string;
};

type Subscription = {
  id: string;
  provider: string;
  planKey: string;
  status: string;
  amountKrw: number;
};

type ToastValue = { type: "success" | "error"; message: string } | null;

export function BillingClient({
  plans,
  initialPaymentMethods,
  initialSubscriptions,
  billingConfig
}: {
  plans: Plan[];
  initialPaymentMethods: PaymentMethod[];
  initialSubscriptions: Subscription[];
  billingConfig: BillingRuntimeConfig;
}) {
  const [toast, setToast] = useState<ToastValue>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);

  async function checkout(planKey: string) {
    setBusy(planKey);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey })
    });
    setBusy(null);
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      setToast({ type: "error", message: data?.error ?? "결제 준비 상태를 확인해주세요." });
      return;
    }
    setSubscriptions((current) => [data.subscription, ...current]);
    setToast({ type: "success", message: "구독이 생성되었습니다." });
  }

  return (
    <div className="grid gap-5">
      {toast ? (
        <div className="flex items-center gap-2 rounded-md border bg-white p-3 text-sm shadow-sm">
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 text-teal-700" /> : <XCircle className="h-4 w-4 text-red-600" />}
          <span className={toast.type === "success" ? "text-teal-900" : "text-red-700"}>{toast.message}</span>
        </div>
      ) : null}

      <Card className={billingConfig.isLiveReady ? "border-teal-200" : "border-amber-200 bg-amber-50/50"}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {billingConfig.isLiveReady ? <ShieldCheck className="h-5 w-5 text-teal-700" /> : <AlertTriangle className="h-5 w-5 text-amber-700" />}
            결제 운영 상태
          </CardTitle>
          <CardDescription>{billingConfig.commercialNotice}</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div className="grid gap-3 md:grid-cols-3">
            <StatusItem label="Billing mode" value={billingConfig.mode} />
            <StatusItem label="PG provider" value={billingConfig.provider} />
            <StatusItem label="Live ready" value={billingConfig.isLiveReady ? "ready" : "blocked"} />
          </div>
          {billingConfig.missingRequirements.length > 0 ? (
            <div className="rounded-md border border-amber-200 bg-white p-3">
              <div className="font-medium text-amber-900">실결제 활성화 전 필요한 설정</div>
              <ul className="mt-2 grid gap-1 text-amber-800">
                {billingConfig.missingRequirements.map((item) => (
                  <li key={item}>- {item}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="rounded-md border border-teal-200 bg-white p-3 text-teal-800">PG live 설정이 완료되었습니다. 실제 결제창 연동 경로를 사용할 수 있습니다.</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>결제수단</CardTitle>
          <CardDescription>
            상업용 운영에서는 카드번호를 FounderOS 서버에 직접 저장하지 않습니다. PG 결제창 또는 billing key 발급 결과만 저장합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {initialPaymentMethods.length ? (
            initialPaymentMethods.map((method) => (
              <div key={method.id} className="flex items-center justify-between rounded-md border bg-white p-3 text-sm">
                <div>
                  <div className="font-medium text-slate-950">{method.billingName}</div>
                  <div className="mt-1 text-slate-500">
                    {method.provider} · {method.maskedNumber} · {method.expiryMonth}/{method.expiryYear}
                  </div>
                </div>
                <CreditCard className="h-4 w-4 text-slate-400" />
              </div>
            ))
          ) : (
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">등록된 PG 결제수단이 없습니다.</div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.key}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div>
                <span className="text-3xl font-semibold">{plan.priceKrw.toLocaleString("ko-KR")}원</span>
                <span className="text-sm text-slate-500"> / 월</span>
              </div>
              <div className="text-sm text-slate-600">월 {plan.credits.toLocaleString("ko-KR")} credits</div>
              <ul className="grid gap-2 text-sm text-slate-700">
                {plan.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
              <Button onClick={() => checkout(plan.key)} disabled={!billingConfig.isLiveReady || Boolean(busy)}>
                {billingConfig.isLiveReady ? (busy === plan.key ? "처리 중..." : "결제창으로 이동") : "PG 준비 후 활성화"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>구독 상태</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3">
          {subscriptions.length === 0 ? (
            <div className="rounded-md bg-slate-50 p-3 text-sm text-slate-500">아직 구독이 없습니다.</div>
          ) : (
            subscriptions.map((subscription) => (
              <div key={subscription.id} className="rounded-md border p-3 text-sm">
                <div className="font-medium">{subscription.planKey} · {subscription.status}</div>
                <div className="mt-1 text-slate-500">
                  {subscription.provider} · {subscription.amountKrw.toLocaleString("ko-KR")}원 / 월
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatusItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border bg-white p-3">
      <div className="text-xs font-medium uppercase text-slate-500">{label}</div>
      <div className="mt-1 font-semibold text-slate-950">{value}</div>
    </div>
  );
}
