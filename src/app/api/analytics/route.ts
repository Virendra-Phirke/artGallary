import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { eventName, entityType, entityId, sessionId, metadata } = body;

    if (!eventName) {
      return NextResponse.json({ error: "eventName is required" }, { status: 400 });
    }

    // In production, persist into Neon analytics_events table and forward to Vercel Analytics / PostHog
    // Privacy guarantee: No IP addresses, no video frames, no camera metadata
    return NextResponse.json({ success: true, recorded: eventName });
  } catch (error) {
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
