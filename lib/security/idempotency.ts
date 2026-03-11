import { Redis } from "@upstash/redis";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  return new Redis({ url, token });
}

export async function enforceIdempotency(
  endpoint: string,
  userId: string,
  key: string | null | undefined
) {
  const redis = getRedis();

  // If Redis is not configured, do not block the request.
  if (!redis) {
    return { ok: true as const };
  }

  if (!key || key.length < 8 || key.length > 128) {
    return {
      ok: false as const,
      status: 400,
      error: "Missing/invalid Idempotency-Key",
    };
  }

  const k = `idem:${endpoint}:${userId}:${key}`;
  const ok = await redis.set(k, "1", { nx: true, ex: 600 });

  if (ok !== "OK") {
    return {
      ok: false as const,
      status: 409,
      error: "Duplicate request",
    };
  }

  return { ok: true as const };
}