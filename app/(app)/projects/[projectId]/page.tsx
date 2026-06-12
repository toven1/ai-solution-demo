import { ProjectWorkspaceView } from "@/components/project/project-workspace-view";

export const dynamic = "force-dynamic";

export default async function ProjectWorkspacePage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return <ProjectWorkspaceView projectId={projectId} step="overview" />;
}
