import { EmptyState } from "@/components/common/empty-state";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BusinessPlanEditor } from "@/components/project/business-plan-editor";
import { CompetitorMatrix } from "@/components/project/competitor-matrix";
import { ExportPanel } from "@/components/project/export-panel";
import { FollowupQuestionsPanel } from "@/components/project/followup-questions-panel";
import { ProjectDetailForm } from "@/components/project/project-detail-form";
import { ResearchReport } from "@/components/project/research-report";
import { SharePanel } from "@/components/project/share-panel";
import { BMCanvasEditor, MVPFeatureEditor, PersonaEditor, ValidationExperimentEditor } from "@/components/project/artifact-editors";
import { IROnePagerEditor, MarketingCopyEditor } from "@/components/project/phase6-editors";
import type { WorkspaceStep } from "@/lib/workspace-steps";

type WorkspaceProject = {
  id: string;
  title: string;
  ideaSummary: string;
  ideaDescription: string;
  industry: string;
  targetCustomer: string;
  goal: string;
  teamSize: number;
  availableResources: string;
  mainConcern: string;
  businessPlan: Array<{
    id: string;
    sectionKey: string;
    title: string;
    guide: string;
    aiDraft: string | null;
    userContent: string | null;
    completenessScore: number;
    order: number;
  }>;
  questions: Array<{
    id: string;
    question: string;
    answer: string | null;
    order: number;
  }>;
  researchSources: Array<{
    id: string;
    title: string;
    url: string;
    publisher: string | null;
    notes: string | null;
  }>;
  marketInsights: Array<{
    id: string;
    category: string;
    title: string;
    content: string;
    confidenceLevel: string;
    evidenceSourceIds: string[];
    isAssumption: boolean;
    isAiAssumed: boolean;
  }>;
  competitors: Array<{
    id: string;
    name: string;
    url: string | null;
    targetCustomer: string | null;
    coreFeatures: string[];
    pricing: string | null;
    strengths: string[];
    weaknesses: string[];
    differentiation: string | null;
    sourceUrl: string | null;
    sourceTitle: string | null;
    sourceIds: string[];
  }>;
  personas: Array<any>;
  bmCanvas: any | null;
  mvpFeatures: Array<any>;
  hypotheses: Array<any>;
  irOnePager: any | null;
  marketingCopy: Array<any>;
  generatedDocuments: Array<any>;
  mentorShares: Array<any>;
};

export function WorkspaceStepContent({
  step,
  project,
  industries
}: {
  step: WorkspaceStep;
  project: WorkspaceProject;
  industries: string[];
}) {
  if (step === "overview") {
    return (
      <div className="grid gap-4">
        <ProjectDetailForm project={project} industries={industries} />
        <Card>
          <CardHeader>
            <CardTitle>사업계획서 섹션</CardTitle>
            <CardDescription>사업계획서 메뉴에서 문항별 초안과 사용자 수정본을 관리할 수 있습니다.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-2">
            {project.businessPlan.map((section) => (
              <div key={section.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
                <div>
                  <div className="font-medium">{section.order}. {section.title}</div>
                  <div className="mt-1 text-slate-500">{section.guide}</div>
                </div>
                <span className="text-xs text-slate-500">{section.completenessScore}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "questions") {
    return <FollowupQuestionsPanel projectId={project.id} questions={project.questions} />;
  }

  if (step === "research") {
    return <ResearchReport projectId={project.id} insights={project.marketInsights} sources={project.researchSources} />;
  }

  if (step === "competitors") {
    return <CompetitorMatrix projectId={project.id} competitors={project.competitors} />;
  }

  if (step === "personas") {
    return <PersonaEditor projectId={project.id} personas={project.personas} />;
  }

  if (step === "canvas") {
    return <BMCanvasEditor projectId={project.id} canvas={project.bmCanvas} />;
  }

  if (step === "mvp") {
    return <MVPFeatureEditor projectId={project.id} features={project.mvpFeatures} />;
  }

  if (step === "experiments") {
    return <ValidationExperimentEditor projectId={project.id} experiments={project.hypotheses} />;
  }

  if (step === "plan") {
    return <BusinessPlanEditor projectId={project.id} sections={project.businessPlan} />;
  }

  if (step === "one-pager") {
    return <IROnePagerEditor projectId={project.id} onePager={project.irOnePager} />;
  }

  if (step === "copy") {
    return <MarketingCopyEditor projectId={project.id} copies={project.marketingCopy} />;
  }

  if (step === "export") {
    return <ExportPanel projectId={project.id} documents={project.generatedDocuments} />;
  }

  if (step === "share") {
    return <SharePanel projectId={project.id} shares={project.mentorShares} />;
  }

  return <EmptyState title="준비 중" description="해당 단계가 아직 준비되지 않았습니다." />;
}
