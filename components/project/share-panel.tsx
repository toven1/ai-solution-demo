"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Copy, Link2, ToggleLeft, ToggleRight, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type MentorShare = {
  id: string;
  token: string;
  revokedAt: Date | string | null;
  expiresAt: Date | string | null;
  createdAt: Date | string;
  mentorComments?: Array<{ id: string }>;
};

type ToastValue = { type: "success" | "error"; message: string } | null;

function Toast({ toast }: { toast: ToastValue }) {
  if (!toast) return null;
  return (
    <div className="flex items-center gap-2 rounded-md border bg-white p-3 text-sm shadow-sm">
      {toast.type === "success" ? <CheckCircle2 className="h-4 w-4 text-teal-700" /> : <XCircle className="h-4 w-4 text-red-600" />}
      <span className={toast.type === "success" ? "text-teal-900" : "text-red-700"}>{toast.message}</span>
    </div>
  );
}

export function SharePanel({ projectId, shares }: { projectId: string; shares: MentorShare[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<ToastValue>(null);
  const appUrl = useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);

  async function createShare() {
    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/shares`, { method: "POST" });
    setBusy(false);
    setToast(res.ok ? { type: "success", message: "공유 링크를 생성했습니다." } : { type: "error", message: "공유 링크 생성에 실패했습니다." });
    router.refresh();
  }

  async function setActive(share: MentorShare, active: boolean) {
    setBusy(true);
    const res = await fetch(`/api/projects/${projectId}/shares/${share.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active })
    });
    setBusy(false);
    setToast(res.ok ? { type: "success", message: active ? "공유 링크를 활성화했습니다." : "공유 링크를 비활성화했습니다." } : { type: "error", message: "상태 변경에 실패했습니다." });
    router.refresh();
  }

  async function copy(url: string) {
    await navigator.clipboard.writeText(url);
    setToast({ type: "success", message: "공유 링크를 복사했습니다." });
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div>
          <CardTitle>멘토 공유</CardTitle>
          <CardDescription>멘토에게 읽기 전용 워크스페이스를 공유하고 문서별 코멘트를 받을 수 있습니다.</CardDescription>
        </div>
        <Button onClick={createShare} disabled={busy}>
          <Link2 className="h-4 w-4" />
          공유 링크 생성
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        <Toast toast={toast} />
        {shares.length === 0 ? (
          <div className="rounded-md border bg-slate-50 p-4 text-sm text-slate-600">아직 생성된 공유 링크가 없습니다.</div>
        ) : (
          shares.map((share) => {
            const active = !share.revokedAt && (!share.expiresAt || new Date(share.expiresAt) > new Date());
            const url = `${appUrl}/share/${share.token}`;
            return (
              <div key={share.id} className="grid gap-3 rounded-md border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-slate-950">{active ? "활성 공유 링크" : "비활성 공유 링크"}</div>
                    <div className="mt-1 break-all text-sm text-slate-600">{url}</div>
                    <div className="mt-1 text-xs text-slate-500">생성: {new Date(share.createdAt).toLocaleString("ko-KR")} · 코멘트 {share.mentorComments?.length ?? 0}개</div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => copy(url)} disabled={busy}>
                      <Copy className="h-4 w-4" />
                      복사
                    </Button>
                    <Button variant="outline" onClick={() => setActive(share, !active)} disabled={busy}>
                      {active ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      {active ? "비활성화" : "활성화"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}
