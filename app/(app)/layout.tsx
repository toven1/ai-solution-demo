import Link from "next/link";

import { LogoutButton } from "@/components/auth/logout-button";
import { getCurrentUser } from "@/lib/auth/session";

export default async function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-5">
          <Link href="/dashboard" className="text-base font-semibold">
            FounderOS AI
          </Link>
          <nav className="flex items-center gap-4 text-sm text-slate-600">
            <Link href="/dashboard" className="hover:text-slate-950">
              Dashboard
            </Link>
            <Link href="/projects/new" className="hover:text-slate-950">
              New Project
            </Link>
            <Link href="/billing" className="hover:text-slate-950">
              Billing
            </Link>
            {user?.isSuperAdmin || user?.role === "ADMIN" || user?.role === "SUPER_ADMIN" ? (
              <Link href="/admin" className="hover:text-slate-950">
                Admin
              </Link>
            ) : null}
            {user ? (
              <>
                <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-800">{user.email}</span>
                <LogoutButton />
              </>
            ) : (
              <>
                <Link href="/login" className="hover:text-slate-950">
                  Login
                </Link>
                <Link href="/signup" className="hover:text-slate-950">
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
