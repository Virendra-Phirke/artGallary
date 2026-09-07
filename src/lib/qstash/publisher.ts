import { getQStashClient } from "./client";
import { EmailJobPayload, QStashPublishResult } from "./types";

export interface PublishEmailJobOptions {
  webhookUrl: string;
  payload: EmailJobPayload;
  scheduledAt?: Date | null;
  retries?: number;
}

/**
 * Publishes an email job to Upstash QStash.
 * QStash durably queues the job and delivers it via HTTPS to the webhookUrl.
 */
export async function publishEmailJob(
  options: PublishEmailJobOptions
): Promise<QStashPublishResult> {
  const client = getQStashClient();
  if (!client) {
    return {
      success: false,
      error: "QStash client not configured (missing QSTASH_TOKEN).",
    };
  }

  const { webhookUrl, payload, scheduledAt, retries = 3 } = options;

  try {
    const publishConfig: any = {
      url: webhookUrl,
      body: payload,
      retries,
      deduplicationId: `job-${payload.jobId}`,
    };

    // If scheduled for a future time, calculate notBefore in epoch seconds
    if (scheduledAt && scheduledAt.getTime() > Date.now()) {
      publishConfig.notBefore = Math.floor(scheduledAt.getTime() / 1000);
    }

    const res = await client.publishJSON(publishConfig);
    const messageId = res && "messageId" in res ? (res as { messageId: string }).messageId : undefined;

    return {
      success: true,
      messageId,
    };
  } catch (err: any) {
    console.error(`[QStash Publisher] Failed to publish job ${payload.jobId}:`, err);
    return {
      success: false,
      error: err.message || "Unknown QStash publish error",
    };
  }
}
