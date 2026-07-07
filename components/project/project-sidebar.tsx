"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { workspaceSteps } from "@/lib/workspace-steps";

export function ProjectSidebar({ projectId }: { projectId: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-full border-b bg-card lg:min-h-[calc(100vh-56px)] lg:w-64 lg:border-b-0 lg:border-r">
      <div className="sticky top-14 p-4">
        <div className="mb-3 px-2 text-xs font-medium uppercase tracking-wide text-textFaint">Workspace</div>
        <nav className="grid gap-1">
          {workspaceSteps.map(([label, step, Icon]) => {
            const href = step === "overview" ? `/projects/${projectId}` : `/projects/${projectId}/${step}`;
            const isActive = pathname === href || (step === "overview" && pathname === `/projects/${projectId}`);

            return (
              <Link
                key={step}
                href={href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-2 py-2 text-sm text-textSub hover:bg-surface hover:text-text",
                  isActive && "bg-accentSoft font-medium text-accentStrong hover:bg-accentSoft hover:text-accentStrong"
                )}
              >
                <Icon className={cn("h-4 w-4 text-textFaint", isActive && "text-accentStrong")} />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
