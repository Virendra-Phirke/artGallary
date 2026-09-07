export interface SendEmailInput {
  from?: string;
  to: string;
  recipientName?: string | null;
  subject: string;
  html: string;
  text?: string;
  headers?: Record<string, string>;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
  isRetryable?: boolean;
}

export interface EmailProvider {
  send(input: SendEmailInput): Promise<SendEmailResult>;
}
