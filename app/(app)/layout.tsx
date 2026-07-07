import Link from "next/link";
import { Coins, Sparkles } from "lucide-react";

import { LogoutButton } from "@/components/auth/logout-button";
import { isAdminUser } from "@/lib/auth/admin";
import { getCurrentUser } from "@/lib/auth/session";
import { getCreditBalance } from "@/lib/credits/service";

async function loadCreditBalance(user: { id: string; hasUnlimitedCredits: boolean; isSuperAdmin: boolean } | null) {
  if (!user) return null;
  if (user.hasUnlimitedCredits || user.isSuperAdmin) return "unlimited" as const;
  try {
    return await getCreditBalance(user.id);
  } catch {
    return null;
  }
}

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();
  const creditBalance = await loadCreditBalance(user);

  return (
    <div className="min-h-screen bg-bgSoft">
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accentSoft">
              <Sparkles className="h-4 w-4 text-accentStrong" />
            </span>
            <span className="text-base font-semibold text-text">FounderOS AI</span>
          </Link>
          <nav className="flex items-center gap-4 text-sm text-textSub">
            <Link href="/dashboard" className="hover:text-text">
              Dashboard
            </Link>
            <Link href="/projects/new" className="hover:text-text">
              New Project
            </Link>
            <Link href="/billing" className="hover:text-text">
              Billing
            </Link>
            {isAdminUser(user) ? (
              <Link href="/admin" className="hover:text-text">
                Admin
              </Link>
            ) : null}
            {user ? (
              <>
                {creditBalance !== null ? (
                  <Link
                    href="/billing"
                    className="flex items-center gap-1.5 rounded-md bg-surface px-2 py-1 text-xs font-medium text-textSub hover:bg-surfaceStrong"
                  >
                    <Coins className="h-3.5 w-3.5 text-accentStrong" />
                    {creditBalance === "unlimited" ? "크레딧 무제한" : `크레딧 ${creditBalance.toLocaleString("ko-KR")}`}
                  </Link>
                ) : null}
                <span className="rounded-md bg-accentSoft px-2 py-1 text-xs font-medium text-accentStrong">{user.email}</span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-text">
                  Login
                </Link>
                <Link href="/signup" className="hover:text-text">
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
