import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { checkRateLimit, getClientIp, type LimiterName } from "@/lib/security/ratelimit";
import { enforceIdempotency } from "@/lib/security/idempotency";

export type EndpointKey =
  | "posts:create"
  | "comments:create"
  | "posts:like"
  | "follow"
  | "uploads"
  | "portfolio:write"
  | "profile:update";

const limiterMap: Record<
  EndpointKey,
  { ip: LimiterName; user?: LimiterName; idempotent?: boolean }
> = {
  "posts:create": { ip: "postsCreateIP", user: "postsCreateUser", idempotent: true },
  "comments:create": { ip: "commentsCreateIP", user: "commentsCreateUser", idempotent: true },

  "posts:like": { ip: "likesIP", user: "likesUser", idempotent: true },

  follow: { ip: "followIP", user: "followUser", idempotent: true },

  uploads: { ip: "uploadsIP", user: "uploadsUser", idempotent: true },

  "portfolio:write": { ip: "portfolioWriteIP", user: "portfolioWriteUser", idempotent: true },

  "profile:update": { ip: "profileUpdateIP", user: "profileUpdateUser", idempotent: true },
};

export async function guardWriteEndpoint(req: NextRequest, userId: string, endpoint: EndpointKey) {
  const ip = getClientIp(req);

  const ipLimit = await checkRateLimit(limiterMap[endpoint].ip, ip);
  if (!ipLimit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const userLimiter = limiterMap[endpoint].user;
  if (userLimiter) {
    const userLimit = await checkRateLimit(userLimiter, userId);
    if (!userLimit.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  if (limiterMap[endpoint].idempotent) {
    const idemKey = req.headers.get("idempotency-key") ?? "";
    const idem = await enforceIdempotency(endpoint, userId, idemKey);
    if (!idem.ok) return NextResponse.json({ error: idem.error }, { status: idem.status });
  }

  return null;
}