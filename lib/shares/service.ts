import { randomBytes } from "crypto";

import { prisma } from "@/lib/db";

function createShareToken() {
  return randomBytes(24).toString("base64url");
}

export async function createMentorShare(projectId: string) {
  const existing = await prisma.mentorShare.findFirst({
    where: { projectId, revokedAt: null },
    orderBy: { createdAt: "desc" }
  });

  if (existing) return existing;

  return prisma.mentorShare.create({
    data: {
      projectId,
      token: createShareToken()
    }
  });
}

export async function setMentorShareActive(shareId: string, projectId: string, active: boolean) {
  return prisma.mentorShare.update({
    where: { id: shareId },
    data: {
      revokedAt: active ? null : new Date()
    }
  });
}

export async function getShareByToken(token: string) {
  return prisma.mentorShare.findUnique({
    where: { token },
    include: {
      mentorComments: { orderBy: { createdAt: "desc" } },
      project: {
        include: {
          researchSources: { orderBy: { createdAt: "asc" } },
          marketInsights: { orderBy: { createdAt: "asc" } },
          competitors: { orderBy: { createdAt: "asc" } },
          personas: { orderBy: { createdAt: "asc" } },
          bmCanvas: true,
          mvpFeatures: { orderBy: { order: "asc" } },
          hypotheses: { orderBy: { createdAt: "asc" } },
          businessPlan: { orderBy: { order: "asc" } },
          irOnePager: true,
          marketingCopy: { orderBy: { createdAt: "asc" } },
          generatedDocuments: { orderBy: { updatedAt: "desc" } }
        }
      }
    }
  });
}

export async function createMentorComment({
  token,
  authorName,
  authorEmail,
  sectionKey,
  documentId,
  body
}: {
  token: string;
  authorName?: string;
  authorEmail?: string;
  sectionKey?: string;
  documentId?: string;
  body: string;
}) {
  const share = await prisma.mentorShare.findUnique({
    where: { token }
  });

  if (!share || share.revokedAt || (share.expiresAt && share.expiresAt < new Date())) {
    throw new Error("SHARE_INACTIVE");
  }

  return prisma.mentorComment.create({
    data: {
      mentorShareId: share.id,
      authorName,
      authorEmail,
      sectionKey,
      documentId,
      body
    }
  });
}
