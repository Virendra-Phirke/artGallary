import { EmailProvider, SendEmailInput, SendEmailResult } from "./provider";

export class MockEmailProvider implements EmailProvider {
  async send(input: SendEmailInput): Promise<SendEmailResult> {
    const mockId = `mock-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    console.log(
      `[MockEmailProvider] Dispatched mock email to ${input.to} | Subject: "${input.subject}" | ID: ${mockId}`
    );

    return {
      success: true,
      messageId: mockId,
    };
  }
}
