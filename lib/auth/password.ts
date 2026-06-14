import { createHash, pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("hex");
  return `pbkdf2_sha256$${salt}$${hash}`;
}

export function verifyPassword(password: string, storedHash: string) {
  const [algorithm, salt, hash] = storedHash.split("$");
  if (algorithm !== "pbkdf2_sha256" || !salt || !hash) return false;
  const candidate = pbkdf2Sync(password, salt, 120000, 32, "sha256");
  const expected = Buffer.from(hash, "hex");
  return expected.length === candidate.length && timingSafeEqual(expected, candidate);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
