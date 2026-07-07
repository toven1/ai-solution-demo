"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, MessageSquare, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type ToastValue = { type: "success" | "error"; message: string } | null;

function Toast({ toast }: { toast: ToastValue }) {
  if (!toast) return null;
  return (
    <div className="flex items-center gap-2 rounded-md border border-cardBorder bg-card p-3 text-sm shadow-card">
      {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-danger" />}
      <span className="text-text">{toast.message}</span>
    </div>
  );
}

export function MentorCommentForm({ token }: { token: string }) {
  const router = useRouter();
  const [toast, setToast] = useState<ToastValue>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    authorName: "",
    authorEmail: "",
    sectionKey: "overall",
    body: ""
  });

  async function submit() {
    setBusy(true);
    const res = await fetch(`/api/shares/${token}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setBusy(false);
    if (res.ok) {
      setForm((current) => ({ ...current, body: "" }));
      setToast({ type: "success", message: "코멘트를 남겼습니다." });
      router.refresh();
    } else {
      setToast({ type: "error", message: "코멘트 작성에 실패했습니다." });
    }
  }

  return (
    <div className="grid gap-3 rounded-lg border border-cardBorder bg-card p-4 shadow-card">
      <div className="font-medium text-text">멘토 코멘트</div>
      <Toast toast={toast} />
      <div className="grid gap-3 md:grid-cols-3">
        <Input value={form.authorName} onChange={(event) => setForm((current) => ({ ...current, authorName: event.target.value }))} placeholder="이름" />
        <Input value={form.authorEmail} onChange={(event) => setForm((current) => ({ ...current, authorEmail: event.target.value }))} placeholder="이메일" />
        <Select value={form.sectionKey} onChange={(event) => setForm((current) => ({ ...current, sectionKey: event.target.value }))}>
          <option value="overall">전체</option>
          <option value="market">시장조사</option>
          <option value="business-plan">사업계획서</option>
          <option value="ir-one-pager">IR One-Pager</option>
          <option value="marketing-copy">마케팅 카피</option>
          <option value="export">Export 문서</option>
        </Select>
      </div>
      <Textarea value={form.body} onChange={(event) => setForm((current) => ({ ...current, body: event.target.value }))} placeholder="검토 의견을 남겨주세요." />
      <Button onClick={submit} disabled={busy || form.body.trim().length < 2} className="w-fit">
        <MessageSquare className="h-4 w-4" />
        코멘트 남기기
      </Button>
    </div>
  );
}
