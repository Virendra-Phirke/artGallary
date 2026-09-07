import { Ratelimit } from "@upstash/ratelimit";
import { getRedisClient } from "./redis";

// Lazy-initialized rate limiters
let inquiryLimiterInstance: Ratelimit | null = null;
let adminLimiterInstance: Ratelimit | null = null;
let publicApiLimiterInstance: Ratelimit | null = null;

function getLimiter(
  requests: number,
  window: `${number} s` | `${number} m` | `${number} h` | `${number} d`,
  prefix: string
): Ratelimit | null {
  const redis = getRedisClient();
  if (!redis) return null;

  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: false,
    prefix: `@gallery/ratelimit:${prefix}`,
  });
}

/**
 * 5 inquiries per hour per IP (protects contact form and artist inbox from spam)
 */
export function getInquiryLimiter(): Ratelimit | null {
  if (!inquiryLimiterInstance) {
    inquiryLimiterInstance = getLimiter(5, "1 h", "inquiry");
  }
  return inquiryLimiterInstance;
}

/**
 * 60 mutations per minute per admin (protects admin CMS routes)
 */
export function getAdminLimiter(): Ratelimit | null {
  if (!adminLimiterInstance) {
    adminLimiterInstance = getLimiter(60, "1 m", "admin");
  }
  return adminLimiterInstance;
}

/**
 * 120 requests per minute per IP (protects public API from bot scrapers)
 */
export function getPublicApiLimiter(): Ratelimit | null {
  if (!publicApiLimiterInstance) {
    publicApiLimiterInstance = getLimiter(120, "1 m", "public_api");
  }
  return publicApiLimiterInstance;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

/**
 * Evaluates a rate limit with fail-open safety.
 * If Redis is down or unconfigured, it permits the request so users are never blocked.
 */
export async function checkRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<RateLimitResult> {
  if (!limiter) {
    return { success: true, limit: 100, remaining: 100, reset: 0 };
  }

  try {
    const res = await limiter.limit(identifier);
    return {
      success: res.success,
      limit: res.limit,
      remaining: res.remaining,
      reset: res.reset,
    };
  } catch (error) {
    console.warn("Rate limit check failed (failing open):", error);
    return { success: true, limit: 100, remaining: 100, reset: 0 };
  }
}
