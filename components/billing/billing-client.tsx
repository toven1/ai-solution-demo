"use client";

import { useState } from "react";
import { CheckCircle2, CreditCard, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  billingName: string;
  maskedNumber: string;
  expiryMonth: string;
  expiryYear: string;
};

type Subscription = {
  id: string;
  planKey: string;
  status: string;
  amountKrw: number;
};

type ToastValue = { type: "success" | "error"; message: string } | null;

export function BillingClient({
  plans,
  initialPaymentMethods,
  initialSubscriptions
}: {
  plans: Plan[];
  initialPaymentMethods: PaymentMethod[];
  initialSubscriptions: Subscription[];
}) {
  const [toast, setToast] = useState<ToastValue>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState(initialPaymentMethods);
  const [subscriptions, setSubscriptions] = useState(initialSubscriptions);
  const [paymentForm, setPaymentForm] = useState({
    billingName: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: ""
  });

  async function savePaymentMethod() {
    setBusy("payment");
    const res = await fetch("/api/billing/payment-method", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(paymentForm)
    });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setToast({ type: "error", message: data?.error ?? "결제정보 등록에 실패했습니다." });
      return;
    }
    const data = await res.json();
    setPaymentMethods([data.paymentMethod]);
    setPaymentForm({ billingName: "", cardNumber: "", expiryMonth: "", expiryYear: "" });
    setToast({ type: "success", message: "결제정보를 등록했습니다. 실제 카드번호는 저장하지 않습니다." });
  }

  async function checkout(planKey: string) {
    setBusy(planKey);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planKey })
    });
    setBusy(null);
    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setToast({ type: "error", message: data?.error ?? "결제 처리에 실패했습니다." });
      return;
    }
    const data = await res.json();
    setSubscriptions((current) => [data.subscription, ...current]);
    setToast({ type: "success", message: "Mock PG로 구독 상태를 생성했습니다." });
  }

  return (
    <div className="grid gap-5">
      {toast ? (
        <div className="flex items-center gap-2 rounded-md border bg-white p-3 text-sm shadow-sm">
          {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 text-teal-700" /> : <XCircle className="h-4 w-4 text-red-600" />}
          <span className={toast.type === "success" ? "text-teal-900" : "text-red-700"}>{toast.message}</span>
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>결제정보 등록</CardTitle>
          <CardDescription>사업자등록 전이므로 실제 PG 승인 대신 mock 결제수단으로 저장합니다. 카드번호 원문은 저장하지 않습니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Field label="카드 명의">
              <Input value={paymentForm.billingName} onChange={(event) => setPaymentForm((current) => ({ ...current, billingName: event.target.value }))} />
            </Field>
            <Field label="카드번호">
              <Input value={paymentForm.cardNumber} onChange={(event) => setPaymentForm((current) => ({ ...current, cardNumber: event.target.value }))} placeholder="4242 4242 4242 4242" />
            </Field>
            <Field label="월">
              <Input value={paymentForm.expiryMonth} onChange={(event) => setPaymentForm((current) => ({ ...current, expiryMonth: event.target.value }))} placeholder="12" />
            </Field>
            <Field label="연도">
              <Input value={paymentForm.expiryYear} onChange={(event) => setPaymentForm((current) => ({ ...current, expiryYear: event.target.value }))} placeholder="2030" />
            </Field>
          </div>
          <Button onClick={savePaymentMethod} disabled={busy === "payment"} className="w-fit">
            <CreditCard className="h-4 w-4" />
            결제정보 저장
          </Button>
          {paymentMethods.length ? (
            <div className="grid gap-2">
              {paymentMethods.map((method) => (
                <div key={method.id} className="rounded-md bg-slate-50 p-3 text-sm text-slate-700">
                  {method.billingName} · {method.maskedNumber} · {method.expiryMonth}/{method.expiryYear}
                </div>
              ))}
            </div>
          ) : null}
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
              <Button onClick={() => checkout(plan.key)} disabled={Boolean(busy)}>
                {busy === plan.key ? "처리 중..." : "이 요금제 선택"}
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
                <div className="mt-1 text-slate-500">{subscription.amountKrw.toLocaleString("ko-KR")}원 / 월</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
