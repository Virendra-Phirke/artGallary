import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import {
  getArtworkById,
  getActiveSubscribers,
  getSubscriberStats,
  getAllArtworksAdmin,
  markArtworkSubscribersNotified,
  recordActivityLog,
} from "@/db/repository";
import {
  broadcastArtworkAnnouncement,
  sendBatchEmailChunks,
  resend,
  SENDER_EMAIL,
  getAppBaseUrl,
} from "@/lib/email/resend";
import {
  generateArtworkAnnouncementHtml,
  generateArtworkAnnouncementText,
} from "@/lib/email/templates/artworkAnnouncement";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  const [stats, subscribers, allArtworks] = await Promise.all([
    getSubscriberStats(),
    getActiveSubscribers(),
    getAllArtworksAdmin(),
  ]);

  const publishedArtworks = allArtworks.filter((a) => a.status === "published");

  return NextResponse.json({
    success: true,
    stats,
    subscribers,
    artworks: publishedArtworks,
  });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { artworkId, mode, testEmail, selectedSubscriberEmails } = body;

    if (!artworkId) {
      return NextResponse.json({ error: "artworkId is required" }, { status: 400 });
    }

    const artwork = await getArtworkById(artworkId);
    if (!artwork) {
      return NextResponse.json({ error: "Artwork not found" }, { status: 404 });
    }

    const baseUrl = getAppBaseUrl();
    const artworkUrl = `${baseUrl}/artwork/${artwork.slug}`;

    // Mode 1: Send single test email to the curator / test recipient
    if (mode === "test") {
      const recipient = testEmail || session.user.email;
      const unsubscribeUrl = `${baseUrl}/unsubscribe?token=sample-test-token`;

      const html = generateArtworkAnnouncementHtml({
        artwork,
        recipientName: "Curator Preview",
        artworkUrl,
        unsubscribeUrl,
      });

      const text = generateArtworkAnnouncementText({
        artwork,
        recipientName: "Curator Preview",
        artworkUrl,
        unsubscribeUrl,
      });

      const sendResult = await sendBatchEmailChunks([
        {
          to: recipient,
          recipientName: "Curator Preview",
          subject: `[PREVIEW] Masterwork Release: “${artwork.title}” by Vishal Patil`,
          html,
          text,
          artworkId: artwork.id,
          emailType: "artwork_announcement_preview",
        },
      ]);

      const isSuccess = sendResult.successCount > 0;
      return NextResponse.json({
        success: isSuccess,
        message: isSuccess
          ? `Preview email dispatched to ${recipient}`
          : `Preview held in Sandbox Mode: ${sendResult.errors[0] || "Restricted"}`,
        result: sendResult,
      });
    }

    // Mode 2: Broadcast to all or manually selected active collectors
    const allSubscribers = await getActiveSubscribers();

    if (allSubscribers.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No active subscribers found in the registry.",
      });
    }

    let subscribers = allSubscribers;
    if (Array.isArray(selectedSubscriberEmails) && selectedSubscriberEmails.length > 0) {
      const selectedSet = new Set(
        selectedSubscriberEmails.map((e: string) => e.toLowerCase().trim())
      );
      subscribers = allSubscribers.filter((s) =>
        selectedSet.has(s.email.toLowerCase().trim())
      );
      if (subscribers.length === 0) {
        return NextResponse.json(
          {
            success: false,
            error: "None of the selected recipients were found in the active subscribers registry.",
          },
          { status: 400 }
        );
      }
    }

    const result = await broadcastArtworkAnnouncement({ artwork, subscribers });
    await markArtworkSubscribersNotified(artwork.id);

    recordActivityLog(
      "BROADCAST_ARTWORK_MANUAL",
      "marketing",
      `Admin dispatched release announcement for '${artwork.title}' to ${subscribers.length} collector(s)`,
      artwork.id
    );

    return NextResponse.json({
      success: true,
      message: `Announcement successfully dispatched to ${result.successCount} collector(s).`,
      result,
    });
  } catch (error: any) {
    console.error("Marketing broadcast failed:", error);
    return NextResponse.json({ error: error.message || "Broadcast failed" }, { status: 500 });
  }
}
