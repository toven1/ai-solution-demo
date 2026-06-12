import { prisma } from "@/lib/db";
import { createPackageDocx } from "@/lib/export/docx";
import { createPackageMarkdown } from "@/lib/export/markdown";

export type ExportFormat = "markdown" | "docx";

export type ExportProjectPackage = Awaited<ReturnType<typeof loadExportPackage>>;

export async function loadExportPackage(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      industryTemplate: true,
      researchSources: { orderBy: { createdAt: "asc" } },
      marketInsights: { orderBy: { createdAt: "asc" } },
      competitors: { orderBy: { createdAt: "asc" } },
      personas: { orderBy: { createdAt: "asc" } },
      bmCanvas: true,
      mvpFeatures: { orderBy: { order: "asc" } },
      hypotheses: { orderBy: { createdAt: "asc" } },
      businessPlan: { orderBy: { order: "asc" } },
      irOnePager: true,
      marketingCopy: { orderBy: { createdAt: "asc" } }
    }
  });

  if (!project) throw new Error("PROJECT_NOT_FOUND");
  return project;
}

export function getExportDocumentType(format: ExportFormat) {
  return format === "markdown" ? "full-package-markdown" : "full-package-docx";
}

export function getExportFilename(title: string, format: ExportFormat) {
  const safeTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  return `${safeTitle || "founderos-ai"}-package.${format === "markdown" ? "md" : "docx"}`;
}

export async function saveGeneratedDocument({
  projectId,
  format,
  title,
  content
}: {
  projectId: string;
  format: ExportFormat;
  title: string;
  content: string;
}) {
  const type = getExportDocumentType(format);
  const previous = await prisma.generatedDocument.findFirst({
    where: { projectId, type },
    include: { versions: { orderBy: { version: "desc" }, take: 1 } },
    orderBy: { updatedAt: "desc" }
  });

  if (!previous) {
    const document = await prisma.generatedDocument.create({
      data: {
        projectId,
        type,
        title,
        format,
        content,
        versions: {
          create: {
            version: 1,
            content
          }
        }
      },
      include: { versions: { orderBy: { version: "desc" } } }
    });
    return document;
  }

  const nextVersion = (previous.versions[0]?.version ?? 0) + 1;
  const document = await prisma.generatedDocument.update({
    where: { id: previous.id },
    data: {
      title,
      format,
      content,
      versions: {
        create: {
          version: nextVersion,
          content
        }
      }
    },
    include: { versions: { orderBy: { version: "desc" } } }
  });

  return document;
}

export async function createExportPackage(projectId: string, format: ExportFormat) {
  const projectPackage = await loadExportPackage(projectId);
  const markdown = createPackageMarkdown(projectPackage);
  const document = await saveGeneratedDocument({
    projectId,
    format,
    title: `${projectPackage.title} 전체 패키지`,
    content: markdown
  });

  await prisma.usageLog.create({
    data: {
      userId: projectPackage.userId,
      organizationId: projectPackage.organizationId,
      projectId,
      eventType: "EXPORT",
      provider: "export",
      operation: `export-${format}`,
      status: "success",
      estimatedTokens: 0,
      estimatedCostCents: 0,
      creditsUsed: 0,
      metadata: { format, documentId: document.id }
    }
  });

  if (format === "markdown") {
    return {
      document,
      filename: getExportFilename(projectPackage.title, format),
      contentType: "text/markdown; charset=utf-8",
      body: Buffer.from(markdown, "utf-8")
    };
  }

  return {
    document,
    filename: getExportFilename(projectPackage.title, format),
    contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    body: await createPackageDocx(projectPackage)
  };
}

export async function createPdfExportPackage() {
  throw new Error("PDF_EXPORT_TODO");
}
