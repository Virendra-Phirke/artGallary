import { Redis } from "@upstash/redis";

let redisInstance: Redis | null = null;
let isRedisConfigured: boolean | null = null;

/**
 * Check if Upstash Redis environment variables are provided.
 */
export function hasRedisConfig(): boolean {
  if (isRedisConfigured !== null) return isRedisConfigured;
  isRedisConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );
  return isRedisConfigured;
}

/**
 * Get the singleton Upstash Redis client.
 * Returns null if credentials are not configured.
 */
export function getRedis(): Redis | null {
  if (!hasRedisConfig()) {
    return null;
  }

  if (!redisInstance) {
    try {
      redisInstance = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!,
      });
    } catch (err) {
      console.error("[Redis] Failed to initialize Upstash Redis client:", err);
      return null;
    }
  }

  return redisInstance;
}

export const getRedisClient = getRedis;

/**
 * Standard Cache Key Prefixes
 */
export const CACHE_KEYS = {
  artworksAll: "cache:artworks:public:all",
  artworkSlug: (slug: string) => `cache:artwork:slug:${slug}`,
  artworkId: (id: string) => `cache:artwork:id:${id}`,
  collectionsAll: "cache:collections:public:all",
  collectionSlug: (slug: string) => `cache:collection:slug:${slug}`,
  exhibitionsAll: "cache:exhibitions:public:all",
  exhibitionSlug: (slug: string) => `cache:exhibition:slug:${slug}`,
  homepageSections: "cache:homepage:sections:all",
  siteSettings: "cache:settings:site",
  themeSettings: "cache:settings:theme",
} as const;

/**
 * Read-through caching utility with fail-open fallback.
 * If Redis is unavailable or fails, gracefully calls `fetcher()` directly.
 *
 * @param key Cache key string
 * @param fetcher Function to execute on cache miss
 * @param ttlSeconds Expiration time in seconds (default 3600 = 1 hour)
 */
export async function cachedGet<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  const redis = getRedis();
  if (!redis) {
    return fetcher();
  }

  try {
    const cached = await redis.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
  } catch (err) {
    console.warn(`[Redis Cache GET Miss/Error] Key: ${key} — Falling back to DB:`, err);
  }

  // Cache miss or Redis read error -> fetch fresh data from authoritative DB
  const freshData = await fetcher();

  // Populate cache asynchronously without blocking if write fails
  if (freshData !== null && freshData !== undefined) {
    try {
      await redis.set(key, freshData, { ex: ttlSeconds });
    } catch (setErr) {
      console.warn(`[Redis Cache SET Error] Key: ${key}:`, setErr);
    }
  }

  return freshData;
}

/**
 * Invalidate one or more specific cache keys.
 */
export async function invalidateCacheKeys(keys: string | string[]): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  const keysArray = Array.isArray(keys) ? keys.filter(Boolean) : [keys].filter(Boolean);
  if (keysArray.length === 0) return;

  try {
    await redis.del(...keysArray);
  } catch (err) {
    console.warn("[Redis Invalidation Error] Keys:", keysArray, err);
  }
}

/**
 * Invalidate all cache keys matching a given prefix.
 * e.g. "cache:artworks" will remove all artwork caches.
 */
export async function flushCachePrefix(prefix: string): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;

  try {
    const pattern = prefix.endsWith("*") ? prefix : `${prefix}*`;
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      return keys.length;
    }
    return 0;
  } catch (err) {
    console.warn(`[Redis Flush Prefix Error] Prefix: ${prefix}:`, err);
    return 0;
  }
}

/**
 * Flush all application caches (all keys matching "cache:*").
 */
export async function flushAllApplicationCache(): Promise<number> {
  return flushCachePrefix("cache:");
}

/**
 * Measure Redis connection health, roundtrip latency, and cached key metrics.
 */
export async function getRedisHealth(): Promise<{
  status: "connected" | "disconnected" | "not_configured";
  latencyMs?: number;
  keysCount?: number;
  error?: string;
}> {
  if (!hasRedisConfig()) {
    return { status: "not_configured" };
  }

  const redis = getRedis();
  if (!redis) {
    return { status: "disconnected", error: "Failed to initialize Redis client" };
  }

  try {
    const start = performance.now();
    const pingRes = await redis.ping();
    const latencyMs = Math.round(performance.now() - start);

    if (pingRes === "PONG") {
      let keysCount = 0;
      try {
        const keys = await redis.keys("cache:*");
        keysCount = keys.length;
      } catch {
        // Some restricted environments disallow KEYS command; ignore count
      }

      return {
        status: "connected",
        latencyMs,
        keysCount,
      };
    }

    return { status: "disconnected", error: `Unexpected ping response: ${pingRes}` };
  } catch (err: any) {
    return { status: "disconnected", error: err.message || "Failed to reach Redis" };
  }
}
