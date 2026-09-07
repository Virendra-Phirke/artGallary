import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import {
  getAllCampaigns,
  getRecentEmailJobs,
  getActiveSubscribers,
} from "@/db/repository";
import { dispatchArtworkCampaign } from "@/lib/qstash/emailQueue";
import { hasQStashConfig } from "@/lib/qstash/client";
import { getEmailDeliveryMode } from "@/lib/email/service";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  const [campaigns, recentJobs] = await Promise.all([
    getAllCampaigns(30),
    getRecentEmailJobs(50),
  ]);

  const qstashConfigured = hasQStashConfig();
  const deliveryMode = getEmailDeliveryMode();

  return NextResponse.json({
    success: true,
    campaigns,
    recentJobs,
    queueTelemetry: {
      mode: deliveryMode,
      qstashConfigured,
      status: qstashConfigured ? "operational" : "direct_fallback",
    },
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const {
      title,
      subject,
      artworkId,
      selectedSubscriberEmails,
      scheduledAt,
      timezone,
    } = body;

    if (!title || !subject || !artworkId) {
      return NextResponse.json(
        { error: "title, subject, and artworkId are required fields" },
        { status: 400 }
      );
    }

    const allSubscribers = await getActiveSubscribers();
    let targetSubscribers = allSubscribers;

    if (Array.isArray(selectedSubscriberEmails) && selectedSubscriberEmails.length > 0) {
      const selectedSet = new Set(
        selectedSubscriberEmails.map((e: string) => e.toLowerCase().trim())
      );
      targetSubscribers = allSubscribers.filter((s) =>
        selectedSet.has(s.email.toLowerCase().trim())
      );
    }

    if (targetSubscribers.length === 0) {
      return NextResponse.json(
        { error: "No active subscribers selected for campaign dispatch" },
        { status: 400 }
      );
    }

    const scheduledDate = scheduledAt ? new Date(scheduledAt) : null;

    const dispatchResult = await dispatchArtworkCampaign({
      title,
      subject,
      artworkId,
      subscribers: targetSubscribers,
      scheduledAt: scheduledDate,
      timezone: timezone || "UTC",
      userId: session.user.id,
    });

    if (!dispatchResult.success) {
      return NextResponse.json(
        { error: dispatchResult.error || "Campaign dispatch failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: dispatchResult.message,
      result: dispatchResult,
    });
  } catch (error: any) {
    console.error("[Campaigns API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process campaign" },
      { status: 500 }
    );
  }
}
