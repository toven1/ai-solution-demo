"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    organizationName: "",
    email: "",
    password: ""
  });

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/auth/${mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.error ?? "요청에 실패했습니다.");
        return;
      }
      router.push("/billing");
      router.refresh();
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도하세요.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{mode === "signup" ? "회원가입" : "로그인"}</CardTitle>
        <CardDescription>
          {mode === "signup" ? "FounderOS AI 계정을 만들고 결제정보 등록으로 이동합니다." : "계정으로 로그인해 워크스페이스와 결제를 관리합니다."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={submit} className="grid gap-4">
          {mode === "signup" ? (
            <>
              <Field label="이름">
                <Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
              </Field>
              <Field label="회사/팀 이름">
                <Input value={form.organizationName} onChange={(event) => setForm((current) => ({ ...current, organizationName: event.target.value }))} />
              </Field>
            </>
          ) : null}
          <Field label="이메일">
            <Input type="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </Field>
          <Field label="비밀번호">
            <Input type="password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} />
          </Field>
          {error ? <div className="rounded-md bg-surface p-3 text-sm text-danger">{error}</div> : null}
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "처리 중..." : mode === "signup" ? "회원가입" : "로그인"}
          </Button>
          <div className="text-sm text-textSub">
            {mode === "signup" ? (
              <>
                이미 계정이 있나요? <Link href="/login" className="font-medium text-accent">로그인</Link>
              </>
            ) : (
              <>
                계정이 없나요? <Link href="/signup" className="font-medium text-accent">회원가입</Link>
              </>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
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
