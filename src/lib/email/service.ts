import { EmailProvider, SendEmailInput, SendEmailResult } from "./provider";
import { ResendEmailProvider } from "./resendProvider";
import { MockEmailProvider } from "./mockProvider";

let activeProvider: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (!activeProvider) {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    const isApiKeyValid = Boolean(apiKey && apiKey.length > 5 && !apiKey.includes("your-resend-key"));

    if (isApiKeyValid) {
      activeProvider = new ResendEmailProvider();
    } else {
      console.log("[EmailService] RESEND_API_KEY missing/mock, using MockEmailProvider");
      activeProvider = new MockEmailProvider();
    }
  }

  return activeProvider;
}

/**
 * Returns whether email delivery is routed via Upstash QStash queue or executed directly.
 */
export function getEmailDeliveryMode(): "qstash" | "direct" {
  if (process.env.EMAIL_DELIVERY_MODE?.toLowerCase() === "direct") {
    return "direct";
  }
  return "qstash";
}

/**
 * Core send helper used across the application.
 */
export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const provider = getEmailProvider();
  return provider.send(input);
}
