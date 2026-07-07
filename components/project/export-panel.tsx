"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Download, FileText, FileType, RefreshCw, XCircle } from "lucide-react";

import { EmptyState } from "@/components/common/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Version = {
  id: string;
  version: number;
  createdAt: Date | string;
};

type GeneratedDocument = {
  id: string;
  type: string;
  title: string;
  format: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  versions: Version[];
};

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

function filenameFromDisposition(header: string | null, fallback: string) {
  if (!header) return fallback;
  const encoded = header.match(/filename\*=UTF-8''([^;]+)/)?.[1];
  if (encoded) return decodeURIComponent(encoded);
  const plain = header.match(/filename="?([^";]+)"?/)?.[1];
  return plain || fallback;
}

function labelForType(type: string) {
  if (type === "full-package-markdown") return "전체 패키지 Markdown";
  if (type === "full-package-docx") return "전체 패키지 DOCX";
  return type;
}

export function ExportPanel({ projectId, documents }: { projectId: string; documents: GeneratedDocument[] }) {
  const router = useRouter();
  const [busy, setBusy] = useState<"markdown" | "docx" | "pdf" | null>(null);
  const [toast, setToast] = useState<ToastValue>(null);
  const exportDocuments = useMemo(
    () => documents.filter((document) => document.type === "full-package-markdown" || document.type === "full-package-docx"),
    [documents]
  );

  async function download(format: "markdown" | "docx" | "pdf") {
    setBusy(format);
    setToast(null);
    const res = await fetch(`/api/projects/${projectId}/export`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ format })
    });
    setBusy(null);

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setToast({ type: "error", message: data?.error ?? "다운로드 생성에 실패했습니다." });
      return;
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filenameFromDisposition(res.headers.get("Content-Disposition"), `founderos-ai.${format === "markdown" ? "md" : format}`);
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);

    setToast({ type: "success", message: `${format.toUpperCase()} 파일을 생성했습니다.` });
    router.refresh();
  }

  return (
    <div className="grid gap-5">
      <Card>
        <CardHeader>
          <CardTitle>Export</CardTitle>
          <CardDescription>프로젝트의 전체 산출물을 하나의 패키지 문서로 생성하고 버전을 남깁니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Toast toast={toast} />
          <div className="grid gap-3 md:grid-cols-3">
            <Button onClick={() => download("markdown")} disabled={Boolean(busy)} className="justify-start">
              {busy === "markdown" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
              Markdown 다운로드
            </Button>
            <Button onClick={() => download("docx")} disabled={Boolean(busy)} className="justify-start">
              {busy === "docx" ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              DOCX 다운로드
            </Button>
            <Button onClick={() => download("pdf")} disabled={Boolean(busy)} variant="secondary" className="justify-start">
              <FileType className="h-4 w-4" />
              PDF TODO
            </Button>
          </div>
          <div className="rounded-md bg-surface p-4 text-sm leading-6 text-textSub">
            포함 항목: 프로젝트 개요, 아이디어 요약, 문제 정의, 시장조사 리포트, 근거 출처, 경쟁사 분석, 페르소나, BM Canvas, MVP 계획, 검증 실험, 사업계획서 초안, IR One-Pager, 랜딩페이지 카피, 광고 문구, 면책 문구
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>문서 버전</CardTitle>
          <CardDescription>같은 형식으로 다시 export하면 버전이 증가합니다.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3">
          {exportDocuments.length === 0 ? (
            <EmptyState title="생성된 문서가 없습니다" description="Markdown 또는 DOCX 다운로드를 실행하면 문서와 버전이 저장됩니다." />
          ) : (
            exportDocuments.map((document) => (
              <div key={document.id} className="rounded-md border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-medium text-text">{labelForType(document.type)}</div>
                    <div className="mt-1 text-xs text-textFaint">마지막 생성: {new Date(document.updatedAt).toLocaleString("ko-KR")}</div>
                  </div>
                  <span className="rounded-md bg-accentSoft px-2 py-1 text-xs font-medium text-accentStrong">{document.versions.length} versions</span>
                </div>
                <div className="mt-3 grid gap-2">
                  {document.versions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between rounded-md bg-surface px-3 py-2 text-sm text-textSub">
                      <span>v{version.version}</span>
                      <span className="text-xs text-textFaint">{new Date(version.createdAt).toLocaleString("ko-KR")}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
