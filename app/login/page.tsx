import Link from "next/link";

import { AuthForm } from "@/components/auth/auth-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10">
      <div className="grid w-full justify-items-center gap-6">
        <Link href="/" className="text-lg font-semibold text-slate-950">FounderOS AI</Link>
        <AuthForm mode="login" />
      </div>
    </main>
  );
}
