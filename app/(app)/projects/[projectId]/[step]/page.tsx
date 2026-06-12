import { notFound } from "next/navigation";

import { normalizeWorkspaceStep, ProjectWorkspaceView } from "@/components/project/project-workspace-view";

export const dynamic = "force-dynamic";

export default async function ProjectWorkspaceStepPage({
  params
}: {
  params: Promise<{ projectId: string; step: string }>;
}) {
  const { projectId, step } = await params;
  const normalizedStep = normalizeWorkspaceStep(step);

  if (!normalizedStep) {
    notFound();
  }

  return <ProjectWorkspaceView projectId={projectId} step={normalizedStep} />;
}
