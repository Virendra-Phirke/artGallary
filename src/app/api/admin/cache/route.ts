import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import {
  getRedisHealth,
  flushAllApplicationCache,
  flushCachePrefix,
} from "@/lib/redis/redis";
import { recordActivityLog } from "@/db/repository";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const health = await getRedisHealth();
    return NextResponse.json({ success: true, health });
  } catch (error: any) {
    console.error("[Admin Cache GET API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to inspect Redis cache health" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json().catch(() => ({}));
    const { action = "purge_all", namespace } = body;

    let purgedCount = 0;

    if (action === "purge_namespace" && namespace) {
      purgedCount = await flushCachePrefix(`cache:${namespace}`);
      recordActivityLog(
        "PURGE_CACHE",
        "settings",
        `Purged Redis cache namespace 'cache:${namespace}' (${purgedCount} keys)`
      );
    } else {
      purgedCount = await flushAllApplicationCache();
      recordActivityLog(
        "PURGE_CACHE",
        "settings",
        `Flushed all Upstash Redis application cache (${purgedCount} keys removed)`
      );
    }

    return NextResponse.json({
      success: true,
      purgedCount,
      message: `Successfully invalidated ${purgedCount} cache keys.`,
    });
  } catch (error: any) {
    console.error("[Admin Cache POST API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to purge cache" },
      { status: 500 }
    );
  }
}
