export interface EmailJobPayload {
  jobId: string;
  campaignId?: string | null;
  jobType: "artwork_announcement" | "inquiry_confirmation" | "curator_alert";
  inquiryId?: string | null;
  artworkId?: string | null;
}

export interface QStashPublishResult {
  success: boolean;
  messageId?: string;
  error?: string;
}
