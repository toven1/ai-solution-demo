import Link from "next/link";

export default function AppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
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
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
