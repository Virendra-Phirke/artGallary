import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyQStashSignature } from "@/lib/qstash/verifier";
import {
  getEmailJobById,
  updateEmailJob,
  getArtworkById,
  getInquiryById,
  incrementCampaignCounts,
  recordSentEmail,
} from "@/db/repository";
import { sendEmail } from "@/lib/email/service";
import { getAppBaseUrl } from "@/lib/email/resend";
import {
  generateArtworkAnnouncementHtml,
  generateArtworkAnnouncementText,
} from "@/lib/email/templates/artworkAnnouncement";
import {
  generateInquiryUserConfirmationHtml,
  generateCuratorInquiryAlertHtml,
} from "@/lib/email/templates/inquiryReceipt";

const webhookPayloadSchema = z.object({
  jobId: z.string().uuid(),
  campaignId: z.string().uuid().optional().nullable(),
  jobType: z.enum([
    "artwork_announcement",
    "inquiry_confirmation",
    "curator_alert",
  ]),
  inquiryId: z.string().uuid().optional().nullable(),
  artworkId: z.string().uuid().optional().nullable(),
});

export async function POST(request: NextRequest) {
  // 1. Read raw body as text for cryptographic verification
  const rawBody = await request.text();
  const signature = request.headers.get("upstash-signature");

  // 2. Verify QStash signature if signing keys exist
  const currentSigningKey = process.env.QSTASH_CURRENT_SIGNING_KEY?.trim();
  if (currentSigningKey) {
    if (!signature) {
      return NextResponse.json(
        { error: "Unauthorized: Missing Upstash-Signature header" },
        { status: 401 }
      );
    }

    const isValid = await verifyQStashSignature(signature, rawBody);
    if (!isValid) {
      return NextResponse.json(
        { error: "Unauthorized: Invalid QStash cryptographic signature" },
        { status: 401 }
      );
    }
  }

  // 3. Parse and validate payload
  let payload: z.infer<typeof webhookPayloadSchema>;
  try {
    const json = JSON.parse(rawBody);
    const parsed = webhookPayloadSchema.safeParse(json);
    if (!parsed.success) {
      console.warn("[QStash Worker] Malformed payload received:", parsed.error.format());
      return NextResponse.json(
        { error: "Permanent error: Malformed payload", details: parsed.error.issues },
        { status: 200 } // Stop QStash retry loop on permanently malformed payload
      );
    }
    payload = parsed.data;
  } catch (parseErr) {
    console.warn("[QStash Worker] Non-JSON payload:", parseErr);
    return NextResponse.json(
      { error: "Permanent error: Non-JSON payload" },
      { status: 200 }
    );
  }

  // 4. Retrieve job from authoritative Neon database
  const job = await getEmailJobById(payload.jobId);
  if (!job) {
    console.warn(`[QStash Worker] Job ${payload.jobId} not found in database.`);
    return NextResponse.json(
      { error: "Permanent error: Job record not found in database" },
      { status: 200 }
    );
  }

  // 5. Strict Idempotency Check: Prevent duplicate sends on repeated delivery
  if (job.status === "sent" || job.resendMessageId) {
    console.log(
      `[QStash Worker Idempotency] Job ${job.id} already completed (Resend ID: ${job.resendMessageId}). Skipping execution.`
    );
    return NextResponse.json({
      success: true,
      status: "already_completed",
      resendId: job.resendMessageId,
    });
  }

  if (job.status === "cancelled") {
    console.log(`[QStash Worker] Job ${job.id} was cancelled by admin.`);
    return NextResponse.json({ success: true, status: "cancelled" });
  }

  // 6. Transition state to 'processing' and increment attempt counter
  await updateEmailJob(job.id, {
    status: "processing",
    attemptCount: job.attemptCount + 1,
  });

  const baseUrl = getAppBaseUrl();

  try {
    // 7. Render content & dispatch based on jobType
    if (payload.jobType === "artwork_announcement") {
      const targetArtworkId = payload.artworkId;
      if (!targetArtworkId) {
        throw new Error("Missing artworkId for artwork_announcement job");
      }

      const artwork = await getArtworkById(targetArtworkId);
      if (!artwork) {
        throw new Error(`Artwork ${targetArtworkId} not found in database`);
      }

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

      const sendResult = await sendEmail({
        to: job.recipientEmail,
        recipientName: job.recipientName ?? undefined,
        subject: `Masterwork Release: “${artwork.title}” by Elena Vance`,
        html,
        text,
        headers: {
          "List-Unsubscribe": `<${baseUrl}/api/newsletter/unsubscribe?token=sample-collector>, <mailto:curator@latelier-lumineux.art?subject=unsubscribe>`,
          "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
        },
      });

      if (!sendResult.success) {
        if (sendResult.isRetryable) {
          await updateEmailJob(job.id, {
            status: "retrying",
            lastError: sendResult.error,
          });
          // Return 500 so QStash automatically retries with exponential backoff!
          return NextResponse.json(
            { error: "Retryable delivery failure", detail: sendResult.error },
            { status: 500 }
          );
        } else {
          // Permanent failure (e.g. invalid recipient syntax)
          await updateEmailJob(job.id, {
            status: "failed",
            lastError: sendResult.error,
            failureReason: "provider_rejected",
          });
          if (payload.campaignId) {
            await incrementCampaignCounts(payload.campaignId, "failed");
          }
          await recordSentEmail({
            recipientEmail: job.recipientEmail,
            recipientName: job.recipientName || undefined,
            emailType: "artwork_announcement",
            subject: `Masterwork Release: “${artwork.title}” by Elena Vance`,
            artworkId: artwork.id,
            status: "failed",
            errorMessage: sendResult.error,
            htmlContent: html,
          });
          return NextResponse.json(
            { error: "Permanent delivery failure", detail: sendResult.error },
            { status: 200 }
          );
        }
      }

      // Successful delivery
      await updateEmailJob(job.id, {
        status: "sent",
        resendMessageId: sendResult.messageId,
        sentAt: new Date(),
        lastError: null,
      });

      if (payload.campaignId) {
        await incrementCampaignCounts(payload.campaignId, "sent");
      }

      await recordSentEmail({
        recipientEmail: job.recipientEmail,
        recipientName: job.recipientName || undefined,
        emailType: "artwork_announcement",
        subject: `Masterwork Release: “${artwork.title}” by Elena Vance`,
        artworkId: artwork.id,
        status: "delivered",
        resendId: sendResult.messageId,
        htmlContent: html,
      });

      return NextResponse.json({
        success: true,
        messageId: sendResult.messageId,
      });
    }

    if (payload.jobType === "inquiry_confirmation" || payload.jobType === "curator_alert") {
      const inquiry = payload.inquiryId ? await getInquiryById(payload.inquiryId) : null;
      if (!inquiry) {
        throw new Error(`Inquiry ${payload.inquiryId} not found in database`);
      }

      const isCurator = payload.jobType === "curator_alert";
      const subject = isCurator
        ? `[Inquiry Alert] New Acquisition Dossier: ${inquiry.artworkTitle || "General Gallery"}`
        : `Acquisition Dossier Received — Elena Vance Studio`;

      const html = isCurator
        ? generateCuratorInquiryAlertHtml({
            inquiry,
            artworkTitle: inquiry.artworkTitle,
            adminDashboardUrl: `${baseUrl}/admin/inquiries`,
          })
        : generateInquiryUserConfirmationHtml({
            inquiry,
            artworkTitle: inquiry.artworkTitle,
            artworkUrl: inquiry.artworkId ? `${baseUrl}/artwork/${inquiry.artworkId}` : undefined,
          });

      const sendResult = await sendEmail({
        to: job.recipientEmail,
        recipientName: job.recipientName ?? undefined,
        subject,
        html,
      });

      if (!sendResult.success) {
        if (sendResult.isRetryable) {
          await updateEmailJob(job.id, {
            status: "retrying",
            lastError: sendResult.error,
          });
          return NextResponse.json(
            { error: "Retryable inquiry delivery error", detail: sendResult.error },
            { status: 500 }
          );
        } else {
          await updateEmailJob(job.id, {
            status: "failed",
            lastError: sendResult.error,
            failureReason: "provider_rejected",
          });
          return NextResponse.json({ error: sendResult.error }, { status: 200 });
        }
      }

      await updateEmailJob(job.id, {
        status: "sent",
        resendMessageId: sendResult.messageId,
        sentAt: new Date(),
      });

      await recordSentEmail({
        recipientEmail: job.recipientEmail,
        recipientName: job.recipientName || undefined,
        emailType: payload.jobType,
        subject,
        inquiryId: inquiry.id,
        status: "delivered",
        resendId: sendResult.messageId,
        htmlContent: html,
      });

      return NextResponse.json({
        success: true,
        messageId: sendResult.messageId,
      });
    }

    return NextResponse.json({ error: "Unsupported jobType" }, { status: 200 });
  } catch (err: any) {
    console.error(`[QStash Worker] Execution exception for job ${job.id}:`, err);
    await updateEmailJob(job.id, {
      status: "retrying",
      lastError: err.message || "Execution exception",
    });
    return NextResponse.json(
      { error: "Internal worker exception", detail: err.message },
      { status: 500 }
    );
  }
}
