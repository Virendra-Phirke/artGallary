import {
  createCampaign,
  updateCampaign,
  createEmailJobs,
  updateEmailJob,
  getArtworkById,
  ActiveSubscriber,
} from "@/db/repository";
import { publishEmailJob } from "./publisher";
import { getAppBaseUrl } from "@/lib/email/resend";
import { getEmailDeliveryMode } from "@/lib/email/service";
import { hasQStashConfig } from "./client";
import { sendEmail } from "@/lib/email/service";
import {
  generateArtworkAnnouncementHtml,
  generateArtworkAnnouncementText,
} from "@/lib/email/templates/artworkAnnouncement";

export interface CreateArtworkCampaignInput {
  title: string;
  subject: string;
  artworkId: string;
  subscribers: ActiveSubscriber[];
  scheduledAt?: Date | null;
  timezone?: string;
  userId?: string;
}

export interface CampaignDispatchResult {
  success: boolean;
  campaignId?: string;
  enqueuedCount: number;
  mode: "qstash" | "direct" | "direct_local_hybrid";
  message: string;
  error?: string;
}

export function isLoopbackUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    return (
      host === "localhost" ||
      host === "127.0.0.1" ||
      host === "::1" ||
      host === "0.0.0.0" ||
      host.endsWith(".local")
    );
  } catch {
    return url.includes("localhost") || url.includes("127.0.0.1") || url.includes("::1");
  }
}

export function getQStashWebhookUrl(): string {
  // 1. Explicit webhook override (e.g. ngrok tunnel)
  if (process.env.QSTASH_WEBHOOK_URL?.trim()) {
    return process.env.QSTASH_WEBHOOK_URL.trim();
  }
  // 2. Production public URLs if configured
  const publicAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() || "";
  if (publicAppUrl && !isLoopbackUrl(publicAppUrl)) {
    return `${publicAppUrl.replace(/\/$/, "")}/api/webhooks/qstash/email`;
  }
  const authUrl = process.env.BETTER_AUTH_URL?.trim() || "";
  if (authUrl && !isLoopbackUrl(authUrl)) {
    return `${authUrl.replace(/\/$/, "")}/api/webhooks/qstash/email`;
  }
  // 3. Fallback to base app url
  const baseUrl = getAppBaseUrl();
  return `${baseUrl}/api/webhooks/qstash/email`;
}

/**
 * Creates an authoritative campaign and individual recipient jobs in Neon DB,
 * then enqueues each job into Upstash QStash (or executes directly in local mode).
 */
export async function dispatchArtworkCampaign(
  input: CreateArtworkCampaignInput
): Promise<CampaignDispatchResult> {
  const {
    title,
    subject,
    artworkId,
    subscribers,
    scheduledAt,
    timezone = "UTC",
    userId,
  } = input;

  if (subscribers.length === 0) {
    return {
      success: false,
      enqueuedCount: 0,
      mode: "direct",
      message: "No recipients provided.",
      error: "Subscriber list is empty",
    };
  }

  const artwork = await getArtworkById(artworkId);
  if (!artwork) {
    return {
      success: false,
      enqueuedCount: 0,
      mode: "direct",
      message: "Artwork not found.",
      error: `Artwork ${artworkId} not found`,
    };
  }

  const isScheduled = Boolean(scheduledAt && scheduledAt.getTime() > Date.now());
  const initialStatus = isScheduled ? "scheduled" : "queued";

  // 1. Create authoritative campaign in Neon PostgreSQL
  const campaign = await createCampaign({
    title,
    type: "artwork_release",
    subject,
    artworkId,
    status: initialStatus,
    recipientFilter: { count: subscribers.length },
    totalRecipients: subscribers.length,
    scheduledAt: scheduledAt || null,
    timezone,
    createdBy: userId || null,
  });

  if (!campaign) {
    return {
      success: false,
      enqueuedCount: 0,
      mode: "direct",
      message: "Failed to persist campaign state in Neon database.",
      error: "Database insertion failure",
    };
  }

  // 2. Persist individual recipient jobs in Neon DB with idempotency keys
  const jobInserts = subscribers.map((sub) => ({
    campaignId: campaign.id,
    recipientEmail: sub.email,
    recipientName: sub.name || null,
    jobType: "artwork_announcement" as const,
    status: initialStatus,
    scheduledAt: scheduledAt || null,
  }));

  const createdJobs = await createEmailJobs(jobInserts);

  const deliveryMode = getEmailDeliveryMode();
  const qstashConfigured = hasQStashConfig();
  const webhookUrl = getQStashWebhookUrl();
  const isLoopback = isLoopbackUrl(webhookUrl);

  // 3A. Route via Upstash QStash Queue (Requires a publicly reachable HTTPS webhook URL)
  if (deliveryMode === "qstash" && qstashConfigured && !isLoopback) {
    let enqueuedSuccess = 0;

    // Dispatch each job to QStash asynchronously
    for (const job of createdJobs) {
      const qstashRes = await publishEmailJob({
        webhookUrl,
        payload: {
          jobId: job.id,
          campaignId: campaign.id,
          jobType: "artwork_announcement",
          artworkId: artwork.id,
        },
        scheduledAt,
        retries: 3,
      });

      if (qstashRes.success && qstashRes.messageId) {
        await updateEmailJob(job.id, {
          qstashMessageId: qstashRes.messageId,
          status: isScheduled ? "scheduled" : "queued",
        });
        enqueuedSuccess++;
      } else {
        await updateEmailJob(job.id, {
          status: "failed",
          lastError: qstashRes.error || "Failed to publish to QStash",
        });
      }
    }

    return {
      success: true,
      campaignId: campaign.id,
      enqueuedCount: enqueuedSuccess,
      mode: "qstash",
      message: isScheduled
        ? `Campaign successfully scheduled in QStash for ${scheduledAt?.toISOString()} (${enqueuedSuccess} jobs created).`
        : `Campaign durably enqueued in QStash (${enqueuedSuccess} jobs processing).`,
    };
  }

  // 3B. Direct / Localhost Hybrid Delivery Mode
  // When running on localhost (where QStash cannot reach loopback ::1/127.0.0.1) or when deliveryMode="direct",
  // execute deliveries directly through Resend while maintaining authoritative Neon campaign states.
  if (deliveryMode === "qstash" && isLoopback) {
    console.log(
      `[Email Queue] Webhook URL (${webhookUrl}) is a local loopback address. Cloud QStash cannot reach localhost without a public HTTPS tunnel. Executing via local hybrid direct delivery with full Neon state tracking.`
    );
  } else {
    console.log(
      `[Email Queue] Running in direct delivery mode (deliveryMode=${deliveryMode}, qstashConfigured=${qstashConfigured})`
    );
  }

  const baseUrl = getAppBaseUrl();
  let directSuccess = 0;
  for (const job of createdJobs) {
    try {
      const artworkUrl = `${baseUrl}/artwork/${artwork.slug}`;
      const unsubscribeUrl = `${baseUrl}/unsubscribe?token=sample-collector`;

      const html = generateArtworkAnnouncementHtml({
        artwork,
        recipientName: job.recipientName ?? undefined,
        artworkUrl,
        unsubscribeUrl,
      });
      const text = generateArtworkAnnouncementText({
        artwork,
        recipientName: job.recipientName ?? undefined,
        artworkUrl,
        unsubscribeUrl,
      });

      const res = await sendEmail({
        to: job.recipientEmail,
        recipientName: job.recipientName ?? undefined,
        subject,
        html,
        text,
      });

      if (res.success) {
        await updateEmailJob(job.id, {
          status: "sent",
          resendMessageId: res.messageId,
          sentAt: new Date(),
        });
        directSuccess++;
      } else {
        await updateEmailJob(job.id, {
          status: "failed",
          lastError: res.error,
        });
      }
    } catch (e: any) {
      await updateEmailJob(job.id, {
        status: "failed",
        lastError: e.message,
      });
    }
  }

  await updateCampaign(campaign.id, {
    status: "sent",
    sentCount: directSuccess,
    failedCount: createdJobs.length - directSuccess,
    completedAt: new Date(),
  });

  return {
    success: true,
    campaignId: campaign.id,
    enqueuedCount: directSuccess,
    mode: isLoopback ? "direct_local_hybrid" : "direct",
    message: isLoopback
      ? `Successfully delivered ${directSuccess} email(s) via local hybrid mode (QStash cloud queue is active for production domains; local direct delivery used because localhost is a loopback address).`
      : `Direct release broadcast completed (${directSuccess} delivered).`,
  };
}
