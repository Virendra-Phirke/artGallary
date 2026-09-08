import { Resend } from "resend";
import { EmailProvider, SendEmailInput, SendEmailResult } from "./provider";

export class ResendEmailProvider implements EmailProvider {
  private resend: Resend;
  private defaultSender: string;

  constructor(apiKey?: string, defaultSender?: string) {
    const key = apiKey || process.env.RESEND_API_KEY?.trim() || "";
    this.resend = new Resend(key);
    this.defaultSender =
      defaultSender ||
      process.env.EMAIL_FROM ||
      (process.env.ADMIN_EMAIL
        ? `Vishal Patil • Seclusion Art Gallary <${process.env.ADMIN_EMAIL.trim()}>`
        : "Vishal Patil • Seclusion Art Gallary <curator@latelier-lumineux.art>");
  }

  async send(input: SendEmailInput): Promise<SendEmailResult> {
    try {
      const response = await this.resend.emails.send({
        from: input.from || this.defaultSender,
        to: input.to,
        subject: input.subject,
        html: input.html,
        text: input.text,
        headers: input.headers,
      });

      if (response.error) {
        const statusCode = (response.error as any).statusCode || 400;
        const msg = response.error.message || "Resend API error";

        // Classify retryable: rate limits (429) or upstream 5xx errors
        const isRetryable = statusCode === 429 || statusCode >= 500;

        return {
          success: false,
          error: msg,
          isRetryable,
        };
      }

      return {
        success: true,
        messageId: response.data?.id,
      };
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      const isRetryable = statusCode === 429 || statusCode >= 500 || err.code === "ETIMEDOUT";

      return {
        success: false,
        error: err.message || "Unknown delivery error",
        isRetryable,
      };
    }
  }
}
