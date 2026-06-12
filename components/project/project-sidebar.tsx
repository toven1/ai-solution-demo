"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { workspaceSteps } from "@/lib/workspace-steps";

export function ProjectSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b bg-white lg:min-h-[calc(100vh-56px)] lg:w-64 lg:border-b-0 lg:border-r">
      <div className="sticky top-0 p-4">
        <div className="mb-3 px-2 text-xs font-medium uppercase tracking-wide text-slate-500">Workspace</div>
        <nav className="grid gap-1">
          {workspaceSteps.map(([label, step, Icon]) => {
            const href = step === "overview" ? `/projects/${projectId}` : `/projects/${projectId}/${step}`;
            const isActive = pathname === href || (step === "overview" && pathname === `/projects/${projectId}`);

            return (
              <Link
                key={step}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-slate-700 hover:bg-slate-100 hover:text-slate-950",
                  isActive && "bg-teal-50 font-medium text-teal-900 hover:bg-teal-50"
                )}
              >
                <Icon className={cn("h-4 w-4 text-slate-500", isActive && "text-teal-700")} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
