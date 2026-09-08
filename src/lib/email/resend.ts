import { Resend } from "resend";
import { recordSentEmail, updateInquiryStatus, saveInquiryReply } from "@/db/repository";
import {
  generateArtworkAnnouncementHtml,
  generateArtworkAnnouncementText,
} from "./templates/artworkAnnouncement";
import {
  generateInquiryUserConfirmationHtml,
  generateCuratorInquiryAlertHtml,
} from "./templates/inquiryReceipt";

// Resend client initialization with fail-safe fallback
const apiKey = process.env.RESEND_API_KEY?.trim();
const isApiKeyValid = Boolean(apiKey && apiKey.length > 5 && !apiKey.includes("your-resend-key"));

export const resend = isApiKeyValid ? new Resend(apiKey) : null;

export const SENDER_EMAIL =
  process.env.EMAIL_FROM ||
  (process.env.ADMIN_EMAIL
    ? `Vishal Patil <${process.env.ADMIN_EMAIL.trim()}>`
    : "Vishal Patil <onboarding@resend.dev>");

export function getAppBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
    process.env.BETTER_AUTH_URL?.replace(/\/$/, "") ||
    "http://localhost:3000"
  );
}

export interface EmailBatchItem {
  from?: string;
  to: string | string[];
  recipientName?: string | null;
  subject: string;
  html: string;
  text?: string;
  artworkId?: string | null;
  inquiryId?: string | null;
  emailType?: string;
  headers?: Record<string, string>;
}

export interface BatchSendResult {
  totalAttempted: number;
  successCount: number;
  failureCount: number;
  errors: string[];
}

/**
 * Sends emails individually with rate-limiting throttling (200ms spacing)
 * and records full audit logs in the sent_emails table.
 * If Resend is in free sandbox mode and blocks external addresses, it records
 * the sandbox restriction and safely dispatches a copy to the verified testing inbox.
 */
export async function sendBatchEmailChunks(
  items: EmailBatchItem[],
  delayBetweenItemsMs = 250
): Promise<BatchSendResult> {
  const result: BatchSendResult = {
    totalAttempted: items.length,
    successCount: 0,
    failureCount: 0,
    errors: [],
  };

  if (items.length === 0) return result;

  let sandboxOwnerEmail: string | null = null;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const targetEmail = Array.isArray(item.to) ? item.to[0] : item.to;

    if (!targetEmail || !targetEmail.includes("@")) {
      result.failureCount++;
      result.errors.push(`Skipped invalid recipient: ${targetEmail}`);
      continue;
    }

    if (resend) {
      try {
        const sendResponse = await resend.emails.send({
          from: item.from || SENDER_EMAIL,
          to: targetEmail,
          subject: item.subject,
          html: item.html,
          text: item.text,
          headers: item.headers,
        });

        if (sendResponse.error) {
          const errMsg = sendResponse.error.message || "";
          const isSandboxBlocked =
            errMsg.includes("testing emails to your own email address") ||
            sendResponse.error.name === "validation_error";

          // Extract the sandbox owner email if mentioned in error
          const sandboxMatch = errMsg.match(/\(([^)]+@resend\.dev|[^)]+@gmail\.com|[^)]+@[^)]+)\)/);
          if (sandboxMatch && sandboxMatch[1]) {
            sandboxOwnerEmail = sandboxMatch[1];
          }

          await recordSentEmail({
            recipientEmail: targetEmail,
            recipientName: item.recipientName || undefined,
            emailType: item.emailType || "artwork_announcement",
            subject: item.subject,
            artworkId: item.artworkId || undefined,
            inquiryId: item.inquiryId || undefined,
            status: isSandboxBlocked ? "sandbox_restricted" : "failed",
            errorMessage: isSandboxBlocked
              ? `Resend Sandbox Mode: Can only deliver to your verified Resend account email (${sandboxOwnerEmail || "account owner"}). Verify your custom domain at resend.com/domains to send to all external customers.`
              : errMsg,
            htmlContent: item.html,
          });

          result.failureCount++;
          result.errors.push(`${targetEmail}: ${errMsg}`);
        } else {
          await recordSentEmail({
            recipientEmail: targetEmail,
            recipientName: item.recipientName || undefined,
            emailType: item.emailType || "artwork_announcement",
            subject: item.subject,
            artworkId: item.artworkId || undefined,
            inquiryId: item.inquiryId || undefined,
            status: "delivered",
            resendId: sendResponse.data?.id,
            htmlContent: item.html,
          });

          result.successCount++;
        }
      } catch (err: any) {
        result.failureCount++;
        const msg = err.message || "Unknown send error";
        result.errors.push(`${targetEmail}: ${msg}`);

        const isSandbox =
          msg.includes("testing emails to your own email address") ||
          err.name === "validation_error" ||
          err.statusCode === 403;

        const sandboxMatch = msg.match(/\(([^)]+@resend\.dev|[^)]+@gmail\.com|[^)]+@[^)]+)\)/);
        if (sandboxMatch && sandboxMatch[1]) {
          sandboxOwnerEmail = sandboxMatch[1];
        }

        await recordSentEmail({
          recipientEmail: targetEmail,
          recipientName: item.recipientName || undefined,
          emailType: item.emailType || "artwork_announcement",
          subject: item.subject,
          artworkId: item.artworkId || undefined,
          inquiryId: item.inquiryId || undefined,
          status: isSandbox ? "sandbox_restricted" : "failed",
          errorMessage: isSandbox
            ? `Resend Sandbox Mode: Can only deliver to your verified Resend account email (${sandboxOwnerEmail || "account owner"}). Verify your custom domain at resend.com/domains to send to all external customers.`
            : msg,
          htmlContent: item.html,
        });
      }
    } else {
      // Mock / Dev mode when RESEND_API_KEY is omitted or placeholder
      console.log(`[Resend DEV MOCK] Dispatched email to ${targetEmail}: ${item.subject}`);
      await recordSentEmail({
        recipientEmail: targetEmail,
        recipientName: item.recipientName || undefined,
        emailType: item.emailType || "artwork_announcement",
        subject: item.subject,
        artworkId: item.artworkId || undefined,
        inquiryId: item.inquiryId || undefined,
        status: "simulated",
        errorMessage: "Simulated in local dev (RESEND_API_KEY omitted)",
        htmlContent: item.html,
      });
      result.successCount++;
    }

    // Rate-limit throttle delay between consecutive sends (4 per sec max)
    if (i < items.length - 1 && delayBetweenItemsMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, delayBetweenItemsMs));
    }
  }

  // If in sandbox mode and external recipients were blocked, also deliver a sample to the verified owner
  if (sandboxOwnerEmail && result.failureCount > 0 && resend) {
    try {
      const sampleItem = items[0];
      if (sampleItem) {
        const ownerRes = await resend.emails.send({
          from: sampleItem.from || SENDER_EMAIL,
          to: sandboxOwnerEmail,
          subject: `[STUDIO BROADCAST COPY] ${sampleItem.subject}`,
          html: sampleItem.html,
          text: sampleItem.text,
          headers: sampleItem.headers,
        });

        if (ownerRes.data?.id) {
          await recordSentEmail({
            recipientEmail: sandboxOwnerEmail,
            recipientName: "Studio Admin (Sandbox Copy)",
            emailType: sampleItem.emailType || "artwork_announcement",
            subject: `[STUDIO BROADCAST COPY] ${sampleItem.subject}`,
            artworkId: sampleItem.artworkId || undefined,
            status: "delivered",
            resendId: ownerRes.data.id,
            htmlContent: sampleItem.html,
          });
          result.successCount++;
        }
      }
    } catch (e) {
      console.warn("Failed to dispatch sandbox owner copy:", e);
    }
  }

  return result;
}

export interface SubscriberRecipient {
  email: string;
  name?: string | null;
  unsubscribeToken: string;
}

export interface ArtworkBroadcastPayload {
  artwork: {
    id: string;
    title: string;
    slug: string;
    description: string;
    medium: string;
    year: number;
    widthCm: string | number;
    heightCm: string | number;
    depthCm?: string | number | null;
    price?: string | number | null;
    currency?: string;
    coverImageUrl?: string | null;
  };
  subscribers: SubscriberRecipient[];
  artistName?: string;
  galleryTitle?: string;
}

/**
 * Broadcasts new artwork announcement with RFC 8058 One-Click Unsubscribe headers
 * and individual personalized unsubscribe tokens.
 */
export async function broadcastArtworkAnnouncement(
  payload: ArtworkBroadcastPayload
): Promise<BatchSendResult> {
  const baseUrl = getAppBaseUrl();
  const {
    artwork,
    subscribers,
    artistName = "Elena Vance",
    galleryTitle = "L'Atelier Lumineux",
  } = payload;

  const artworkUrl = `${baseUrl}/artwork/${artwork.slug}`;

  // Filter only valid email addresses
  const validSubscribers = subscribers.filter((s) => s.email && s.email.includes("@"));

  const emailItems: EmailBatchItem[] = validSubscribers.map((sub) => {
    const unsubscribeWebUrl = `${baseUrl}/unsubscribe?token=${encodeURIComponent(
      sub.unsubscribeToken
    )}`;
    const unsubscribePostUrl = `${baseUrl}/api/newsletter/unsubscribe?token=${encodeURIComponent(
      sub.unsubscribeToken
    )}`;

    const html = generateArtworkAnnouncementHtml({
      artwork,
      recipientName: sub.name || "Esteemed Collector",
      artworkUrl,
      unsubscribeUrl: unsubscribeWebUrl,
      artistName,
      galleryTitle,
    });

    const text = generateArtworkAnnouncementText({
      artwork,
      recipientName: sub.name || "Esteemed Collector",
      artworkUrl,
      unsubscribeUrl: unsubscribeWebUrl,
      artistName,
      galleryTitle,
    });

    return {
      from: SENDER_EMAIL,
      to: sub.email,
      recipientName: sub.name,
      artworkId: artwork.id,
      emailType: "artwork_announcement",
      subject: `Masterwork Release: “${artwork.title}” by ${artistName}`,
      html,
      text,
      headers: {
        // RFC 8058 & RFC 2369: Enables Gmail / Yahoo native "Unsubscribe" button
        "List-Unsubscribe": `<${unsubscribePostUrl}>, <mailto:curator@latelier-lumineux.art?subject=unsubscribe>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      },
    };
  });

  return sendBatchEmailChunks(emailItems);
}

/**
 * Sends transactional receipt to the user who submitted an inquiry.
 */
export async function sendInquiryConfirmation(params: {
  inquiry: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
  };
  artworkTitle?: string | null;
  artworkSlug?: string | null;
  artistName?: string;
  galleryTitle?: string;
}) {
  const baseUrl = getAppBaseUrl();
  const artworkUrl = params.artworkSlug ? `${baseUrl}/artwork/${params.artworkSlug}` : undefined;
  const subject = `Inquiry Confirmation • ${params.artworkTitle || "Elena Vance Studio"}`;

  const html = generateInquiryUserConfirmationHtml({
    inquiry: params.inquiry,
    artworkTitle: params.artworkTitle,
    artworkUrl,
    artistName: params.artistName,
    galleryTitle: params.galleryTitle,
  });

  if (resend) {
    try {
      const res = await resend.emails.send({
        from: SENDER_EMAIL,
        to: params.inquiry.email,
        subject,
        html,
      });

      if (res.error) {
        const isSandbox = res.error.message?.includes("testing emails to your own email address");
        await recordSentEmail({
          recipientEmail: params.inquiry.email,
          recipientName: params.inquiry.name,
          emailType: "inquiry_confirmation",
          subject,
          inquiryId: params.inquiry.id,
          status: isSandbox ? "sandbox_restricted" : "failed",
          errorMessage: res.error.message,
          htmlContent: html,
        });
      } else {
        await recordSentEmail({
          recipientEmail: params.inquiry.email,
          recipientName: params.inquiry.name,
          emailType: "inquiry_confirmation",
          subject,
          inquiryId: params.inquiry.id,
          status: "delivered",
          resendId: res.data?.id,
          htmlContent: html,
        });
      }
    } catch (e: any) {
      console.error("Failed to send inquiry confirmation email:", e);
      await recordSentEmail({
        recipientEmail: params.inquiry.email,
        recipientName: params.inquiry.name,
        emailType: "inquiry_confirmation",
        subject,
        inquiryId: params.inquiry.id,
        status: "failed",
        errorMessage: e.message,
        htmlContent: html,
      });
    }
  } else {
    console.log(`[Resend DEV MOCK] Sent inquiry confirmation to ${params.inquiry.email}`);
    await recordSentEmail({
      recipientEmail: params.inquiry.email,
      recipientName: params.inquiry.name,
      emailType: "inquiry_confirmation",
      subject,
      inquiryId: params.inquiry.id,
      status: "simulated",
      htmlContent: html,
    });
  }
}

/**
 * Sends transactional notification to the gallery curator/admin when a new inquiry arrives.
 */
export async function sendCuratorInquiryAlert(params: {
  inquiry: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
    subject?: string | null;
    message: string;
  };
  curatorEmail?: string;
  artworkTitle?: string | null;
  artworkSlug?: string | null;
  galleryTitle?: string;
}) {
  const baseUrl = getAppBaseUrl();
  const artworkUrl = params.artworkSlug ? `${baseUrl}/artwork/${params.artworkSlug}` : undefined;
  const adminDashboardUrl = `${baseUrl}/admin/inquiries`;
  const recipient = params.curatorEmail || "curator@latelier-lumineux.art";
  const subject = `[New Inquiry] ${params.inquiry.name} • ${params.artworkTitle || "Studio Message"}`;

  const html = generateCuratorInquiryAlertHtml({
    inquiry: params.inquiry,
    artworkTitle: params.artworkTitle,
    artworkUrl,
    galleryTitle: params.galleryTitle,
    adminDashboardUrl,
  });

  if (resend) {
    try {
      const res = await resend.emails.send({
        from: SENDER_EMAIL,
        to: recipient,
        subject,
        html,
      });

      if (res.error) {
        await recordSentEmail({
          recipientEmail: recipient,
          recipientName: "Studio Curator",
          emailType: "curator_alert",
          subject,
          inquiryId: params.inquiry.id,
          status: "sandbox_restricted",
          errorMessage: res.error.message,
          htmlContent: html,
        });
      } else {
        await recordSentEmail({
          recipientEmail: recipient,
          recipientName: "Studio Curator",
          emailType: "curator_alert",
          subject,
          inquiryId: params.inquiry.id,
          status: "delivered",
          resendId: res.data?.id,
          htmlContent: html,
        });
      }
    } catch (e: any) {
      console.error("Failed to send curator alert email:", e);
      await recordSentEmail({
        recipientEmail: recipient,
        recipientName: "Studio Curator",
        emailType: "curator_alert",
        subject,
        inquiryId: params.inquiry.id,
        status: "failed",
        errorMessage: e.message,
        htmlContent: html,
      });
    }
  } else {
    console.log(`[Resend DEV MOCK] Sent curator alert to ${recipient}`);
    await recordSentEmail({
      recipientEmail: recipient,
      recipientName: "Studio Curator",
      emailType: "curator_alert",
      subject,
      inquiryId: params.inquiry.id,
      status: "simulated",
      htmlContent: html,
    });
  }
}

/**
 * Sends a formal curatorial email reply from the admin to a customer inquiry,
 * logs the dispatch in sent_emails, and sets inquiry status to 'replied'.
 */
function formatEmailParagraphs(text: string): string {
  const normalized = text.replace(/\r\n/g, "\n").trim();
  const paragraphs = normalized.split(/\n\s*\n/);

  return paragraphs
    .map((para) => {
      const trimmed = para.trim();
      if (!trimmed) return "";
      const escaped = trimmed
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
      const withBreaks = escaped.replace(/\n/g, "<br />");
      return `<p style="margin: 0 0 16px 0; font-size: 14px; line-height: 1.75; color: #e2e8f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">${withBreaks}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

export async function sendAdminInquiryReply(params: {
  inquiryId: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  messageText: string;
}) {
  const formattedHtmlContent = formatEmailParagraphs(params.messageText);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; background-color: #0b0c10; color: #d1d5db; margin: 0; padding: 24px; }
          .card { max-width: 600px; margin: 0 auto; background-color: #12131a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 36px 32px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
          .header { text-align: center; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 20px; margin-bottom: 28px; }
          .atelier-tag { font-size: 10px; letter-spacing: 3px; color: #d1a86e; text-transform: uppercase; font-family: monospace; }
          .title { font-size: 20px; color: #ffffff; margin: 8px 0 0 0; font-family: Georgia, serif; font-weight: normal; }
          .content { font-size: 14px; line-height: 1.75; color: #e2e8f0; }
          .footer { margin-top: 36px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.08); text-align: center; font-size: 11px; color: #71717a; }
          .ref { font-family: monospace; color: #a1a1aa; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="header">
            <span class="atelier-tag">Contemporary Art Atelier</span>
            <h1 class="title">Curatorial Correspondence</h1>
          </div>
          <div class="content">
            ${formattedHtmlContent}
          </div>
          <div class="footer">
            <div>Helena Vance Fine Art Studio • Curatorial Liaison Office</div>
            <div class="ref">Inquiry Reference: ${params.inquiryId}</div>
          </div>
        </div>
      </body>
    </html>
  `;

  if (resend) {
    try {
      const res = await resend.emails.send({
        from: SENDER_EMAIL,
        to: params.recipientEmail,
        replyTo: process.env.ADMIN_EMAIL || "quizmas@quizmastor.tech",
        subject: params.subject,
        html,
        text: params.messageText,
        headers: {
          "X-Entity-Ref-ID": params.inquiryId,
        },
      });

      if (res.error) {
        console.error("Resend returned delivery error:", res.error);
        await recordSentEmail({
          recipientEmail: params.recipientEmail,
          recipientName: params.recipientName,
          emailType: "inquiry_reply",
          subject: params.subject,
          inquiryId: params.inquiryId,
          status: "failed",
          errorMessage: res.error.message,
          htmlContent: html,
        });

        // Still persist reply in database ledger so collector can read it online
        await saveInquiryReply(params.inquiryId, params.messageText, params.subject);

        return { success: false, error: res.error.message };
      }

      await recordSentEmail({
        recipientEmail: params.recipientEmail,
        recipientName: params.recipientName,
        emailType: "inquiry_reply",
        subject: params.subject,
        inquiryId: params.inquiryId,
        status: "delivered",
        resendId: res.data?.id,
        htmlContent: html,
      });

      // Save inquiry reply to database
      await saveInquiryReply(params.inquiryId, params.messageText, params.subject);

      return { success: true, resendId: res.data?.id };
    } catch (e: any) {
      console.error("Failed to send admin reply email:", e);
      await recordSentEmail({
        recipientEmail: params.recipientEmail,
        recipientName: params.recipientName,
        emailType: "inquiry_reply",
        subject: params.subject,
        inquiryId: params.inquiryId,
        status: "failed",
        errorMessage: e.message,
        htmlContent: html,
      });

      await saveInquiryReply(params.inquiryId, params.messageText, params.subject);

      return { success: false, error: e.message || "Failed to dispatch email reply" };
    }
  } else {
    console.log(`[Resend DEV MOCK] Sent admin reply to ${params.recipientEmail}`);
    await recordSentEmail({
      recipientEmail: params.recipientEmail,
      recipientName: params.recipientName,
      emailType: "inquiry_reply",
      subject: params.subject,
      inquiryId: params.inquiryId,
      status: "simulated",
      htmlContent: html,
    });

    await saveInquiryReply(params.inquiryId, params.messageText, params.subject);

    return { success: true, simulated: true };
  }
}

