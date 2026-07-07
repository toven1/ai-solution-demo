"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Sparkles, XCircle } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type ToastValue = { type: "success" | "error"; message: string } | null;

type IROnePagerValue = {
  problem: string;
  solution: string;
  customer: string;
  market: string;
  product: string;
  businessModel: string;
  competition: string;
  goToMarket: string;
  validationPlan: string;
  team: string;
  ask: string;
};

type FaqValue = {
  question: string;
  answer: string;
};

type MarketingCopyValue = {
  id: string;
  channel: string;
  headline: string;
  subheadline?: string | null;
  cta?: string | null;
  body: string;
  problemSection?: string | null;
  solutionSection?: string | null;
  featureSection?: string | null;
  socialProof?: string | null;
  pricingCopy?: string | null;
  faqs?: FaqValue[] | null;
  variants?: string[] | null;
};

const blankOnePager: IROnePagerValue = {
  problem: "",
  solution: "",
  customer: "",
  market: "",
  product: "",
  businessModel: "",
  competition: "",
  goToMarket: "",
  validationPlan: "",
  team: "",
  ask: ""
};

const irFields: Array<[keyof IROnePagerValue, string]> = [
  ["problem", "Problem"],
  ["solution", "Solution"],
  ["customer", "Customer"],
  ["market", "Market"],
  ["product", "Product"],
  ["businessModel", "Business Model"],
  ["competition", "Competition"],
  ["goToMarket", "Go-to-Market"],
  ["validationPlan", "Traction or Validation Plan"],
  ["team", "Team"],
  ["ask", "Ask"]
];

const channelLabels: Record<string, string> = {
  "landing-page": "랜딩페이지",
  meta: "Meta Ads",
  "google-search": "Google Search Ads",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  "email-outreach": "Email Outreach"
};

function useToast() {
  const [toast, setToast] = useState<ToastValue>(null);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 2800);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  return [toast, setToast] as const;
}

function Toast({ toast }: { toast: ToastValue }) {
  if (!toast) return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-md border border-cardBorder bg-card p-3 text-sm shadow-card">
      {toast.type === "success" ? (
        <CheckCircle2 className="h-4 w-4 text-success" />
      ) : (
        <XCircle className="h-4 w-4 text-danger" />
      )}
      <span className="text-text">{toast.message}</span>
    </div>
  );
}

function normalizeFaqs(value: unknown): FaqValue[] {
  if (!Array.isArray(value)) {
    return Array.from({ length: 5 }, () => ({ question: "", answer: "" }));
  }

  const faqs = value.map((faq) => ({
    question: typeof faq?.question === "string" ? faq.question : "",
    answer: typeof faq?.answer === "string" ? faq.answer : ""
  }));

  while (faqs.length < 5) {
    faqs.push({ question: "", answer: "" });
  }

  return faqs.slice(0, 5);
}

function normalizeVariants(copy: MarketingCopyValue): string[] {
  if (Array.isArray(copy.variants)) {
    return copy.variants.map(String).slice(0, 5);
  }

  const fromBody = copy.body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  while (fromBody.length < 5) {
    fromBody.push("");
  }

  return fromBody.slice(0, 5);
}

export function IROnePagerEditor({
  projectId,
  onePager
}: {
  projectId: string;
  onePager: (IROnePagerValue & { id: string }) | null;
}) {
  const router = useRouter();
  const [item, setItem] = useState<IROnePagerValue>(onePager ?? blankOnePager);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useToast();

  useEffect(() => {
    setItem(onePager ?? blankOnePager);
  }, [onePager]);

  async function generate() {
    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/one-pager/generate`, { method: "POST" });
    setBusy(false);
    const data = res.ok ? null : await res.json().catch(() => null);
    setToast(res.ok ? { type: "success", message: "IR One-Pager를 생성했습니다." } : { type: "error", message: data?.error ?? "생성에 실패했습니다." });
    router.refresh();
  }

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/one-pager`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    setBusy(false);
    setToast(res.ok ? { type: "success", message: "IR One-Pager가 저장되었습니다." } : { type: "error", message: "저장에 실패했습니다." });
    router.refresh();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between gap-4 space-y-0">
        <div>
          <CardTitle>IR One-Pager</CardTitle>
          <CardDescription>기존 산출물을 바탕으로 투자자와 멘토에게 공유할 1페이지 요약을 만듭니다.</CardDescription>
        </div>
        <Button onClick={generate} disabled={busy}>
          <Sparkles className="h-4 w-4" />
          {onePager ? "다시 생성" : "생성"}
        </Button>
      </CardHeader>
      <CardContent>
        <Toast toast={toast} />
        {!onePager ? (
          <EmptyState title="IR One-Pager가 없습니다" description="생성 버튼을 누르면 Problem부터 Ask까지 11개 항목이 생성됩니다." />
        ) : null}
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {irFields.map(([key, label]) => (
            <div key={key} className="grid gap-2">
              <div className="text-sm font-medium">{label}</div>
              <Textarea
                className="min-h-28"
                value={item[key] ?? ""}
                onChange={(event) => setItem((current) => ({ ...current, [key]: event.target.value }))}
              />
            </div>
          ))}
        </div>
        <Button className="mt-4" onClick={save} disabled={busy}>
          저장하기
        </Button>
      </CardContent>
    </Card>
  );
}

export function MarketingCopyEditor({ projectId, copies }: { projectId: string; copies: MarketingCopyValue[] }) {
  const router = useRouter();
  const [items, setItems] = useState<MarketingCopyValue[]>(copies);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useToast();

  useEffect(() => {
    setItems(copies);
  }, [copies]);

  const landingCopy = items.find((copy) => copy.channel === "landing-page");
  const adCopies = items.filter((copy) => copy.channel !== "landing-page");

  async function generate() {
    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/marketing-copy/generate`, { method: "POST" });
    setBusy(false);
    const data = res.ok ? null : await res.json().catch(() => null);
    setToast(res.ok ? { type: "success", message: "마케팅 카피를 생성했습니다." } : { type: "error", message: data?.error ?? "생성에 실패했습니다." });
    router.refresh();
  }

  async function save() {
    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/marketing-copy`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ copies: items })
    });
    setBusy(false);
    setToast(res.ok ? { type: "success", message: "마케팅 카피가 저장되었습니다." } : { type: "error", message: "저장에 실패했습니다." });
    router.refresh();
  }

  function updateCopy(id: string, key: keyof MarketingCopyValue, value: MarketingCopyValue[keyof MarketingCopyValue]) {
    setItems((current) => current.map((copy) => (copy.id === id ? { ...copy, [key]: value } : copy)));
  }

  function updateFaq(copy: MarketingCopyValue, index: number, key: keyof FaqValue, value: string) {
    const faqs = normalizeFaqs(copy.faqs);
    faqs[index] = { ...faqs[index], [key]: value };
    updateCopy(copy.id, "faqs", faqs);
  }

  function updateVariant(copy: MarketingCopyValue, index: number, value: string) {
    const variants = normalizeVariants(copy);
    variants[index] = value;
    setItems((current) =>
      current.map((item) =>
        item.id === copy.id
          ? {
              ...item,
              variants,
              body: variants.filter(Boolean).join("\n")
            }
          : item
      )
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between gap-4 space-y-0">
        <div>
          <CardTitle>마케팅 카피</CardTitle>
          <CardDescription>업종별 톤 가이드를 반영한 랜딩페이지 카피와 채널별 광고 문구를 수정·저장합니다.</CardDescription>
        </div>
        <Button onClick={generate} disabled={busy}>
          <Sparkles className="h-4 w-4" />
          {items.length > 0 ? "다시 생성" : "생성"}
        </Button>
      </CardHeader>
      <CardContent>
        <Toast toast={toast} />
        {items.length === 0 ? (
          <EmptyState title="마케팅 카피가 없습니다" description="생성 버튼을 누르면 랜딩페이지 카피와 채널별 광고 문구가 생성됩니다." />
        ) : null}

        {landingCopy ? (
          <div className="mt-4 grid gap-4 rounded-md border p-4">
            <div className="text-sm font-semibold">{channelLabels[landingCopy.channel]}</div>
            <Input value={landingCopy.headline} onChange={(event) => updateCopy(landingCopy.id, "headline", event.target.value)} placeholder="Hero headline" />
            <Input value={landingCopy.subheadline ?? ""} onChange={(event) => updateCopy(landingCopy.id, "subheadline", event.target.value)} placeholder="Hero subheadline" />
            <Input value={landingCopy.cta ?? ""} onChange={(event) => updateCopy(landingCopy.id, "cta", event.target.value)} placeholder="CTA" />
            <Textarea value={landingCopy.problemSection ?? ""} onChange={(event) => updateCopy(landingCopy.id, "problemSection", event.target.value)} placeholder="Problem section" />
            <Textarea value={landingCopy.solutionSection ?? ""} onChange={(event) => updateCopy(landingCopy.id, "solutionSection", event.target.value)} placeholder="Solution section" />
            <Textarea value={landingCopy.featureSection ?? ""} onChange={(event) => updateCopy(landingCopy.id, "featureSection", event.target.value)} placeholder="Feature section" />
            <Textarea value={landingCopy.socialProof ?? ""} onChange={(event) => updateCopy(landingCopy.id, "socialProof", event.target.value)} placeholder="Social proof placeholder" />
            <Textarea value={landingCopy.pricingCopy ?? ""} onChange={(event) => updateCopy(landingCopy.id, "pricingCopy", event.target.value)} placeholder="Pricing section copy" />
            <div className="grid gap-3">
              <div className="text-sm font-medium">FAQ 5개</div>
              {normalizeFaqs(landingCopy.faqs).map((faq, index) => (
                <div key={index} className="grid gap-2 rounded-md bg-surface p-3">
                  <Input value={faq.question} onChange={(event) => updateFaq(landingCopy, index, "question", event.target.value)} placeholder={`FAQ ${index + 1} 질문`} />
                  <Textarea value={faq.answer} onChange={(event) => updateFaq(landingCopy, index, "answer", event.target.value)} placeholder={`FAQ ${index + 1} 답변`} />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4">
          {adCopies.map((copy) => (
            <div key={copy.id} className="grid gap-3 rounded-md border p-4">
              <div className="text-sm font-semibold">{channelLabels[copy.channel] ?? copy.channel}</div>
              {normalizeVariants(copy).map((variant, index) => (
                <Textarea
                  key={index}
                  value={variant}
                  onChange={(event) => updateVariant(copy, index, event.target.value)}
                  placeholder={`${channelLabels[copy.channel] ?? copy.channel} ${index + 1}`}
                />
              ))}
            </div>
          ))}
        </div>

        {items.length > 0 ? (
          <Button className="mt-4" onClick={save} disabled={busy}>
            저장하기
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
