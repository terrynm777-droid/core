import { Redis } from "@upstash/redis";
const redis = Redis.fromEnv();

export async function enforceIdempotency(endpoint: string, userId: string, key: string) {
  if (!key || key.length < 8 || key.length > 128) {
    return { ok: false as const, status: 400, error: "Missing/invalid Idempotency-Key" };
  }
  const k = `idem:${endpoint}:${userId}:${key}`;
  const ok = await redis.set(k, "1", { nx: true, ex: 600 });
  if (ok !== "OK") return { ok: false as const, status: 409, error: "Duplicate request" };
  return { ok: true as const };
}