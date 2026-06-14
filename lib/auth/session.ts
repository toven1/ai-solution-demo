import { randomBytes } from "crypto";
import { cookies } from "next/headers";

import { prisma } from "@/lib/db";
import { hashToken } from "@/lib/auth/password";

export const SESSION_COOKIE = "founderos_session";

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14);
  await prisma.userSession.create({
    data: {
      userId,
      tokenHash: hashToken(token),
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await prisma.userSession.deleteMany({ where: { tokenHash: hashToken(token) } });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await prisma.userSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: { include: { organization: true } } }
  });

  if (!session || session.expiresAt < new Date()) {
    if (session) await prisma.userSession.delete({ where: { id: session.id } }).catch(() => null);
    return null;
  }

  return session.user;
}

export async function getDemoUser() {
  return prisma.user.findUnique({
    where: { email: "demo@founderos.ai" },
    include: { organization: true }
  });
}

export async function getCurrentOrDemoUser() {
  return (await getCurrentUser()) ?? (await getDemoUser());
}
