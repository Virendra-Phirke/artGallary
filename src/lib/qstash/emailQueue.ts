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
  mode: "qstash" | "direct";
  message: string;
  error?: string;
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
  const baseUrl = getAppBaseUrl();
  const webhookUrl = `${baseUrl}/api/webhooks/qstash/email`;

  // 3A. Route via Upstash QStash Queue (Production Mode)
  if (deliveryMode === "qstash" && qstashConfigured) {
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

  // 3B. Direct Execution Mode (Local Development / Fallback)
  console.log(
    `[Email Queue] Running in direct delivery mode (deliveryMode=${deliveryMode}, qstashConfigured=${qstashConfigured})`
  );

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
    mode: "direct",
    message: `Direct release broadcast completed (${directSuccess} delivered).`,
  };
}
