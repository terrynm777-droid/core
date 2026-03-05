import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import type { NextRequest } from "next/server";

const redis = Redis.fromEnv();

const limiters = {
  postsCreateIP: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") }),
  postsCreateUser: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") }),

  commentsCreateIP: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }),
  commentsCreateUser: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }),

  searchIP: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(60, "1 m") }),
  authIPStrict: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(5, "1 m") }),

  likesIP: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "1 m") }),
  likesUser: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(30, "1 m") }),

  followIP: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }),
  followUser: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }),

  uploadsIP: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }),
  uploadsUser: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }),

  portfolioWriteIP: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 m") }),
  portfolioWriteUser: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(20, "1 m") }),

  profileUpdateIP: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }),
  profileUpdateUser: new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, "1 m") }),
} as const;

export type LimiterName = keyof typeof limiters;

export function getClientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function checkRateLimit(limiter: keyof typeof limiters, key: string) {
  const res = await limiters[limiter].limit(`${limiter}:${key}`);
  return {
    ok: res.success,
    remaining: res.remaining,
    reset: res.reset, // unix seconds
  };
}
