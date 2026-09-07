import { pgTable, text, timestamp, uuid, varchar, index } from "drizzle-orm/pg-core";
import { artworks } from "./artworks";
import { inquiries } from "./inquiries";

export const sentEmails = pgTable(
  "sent_emails",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
    recipientName: varchar("recipient_name", { length: 255 }),
    emailType: varchar("email_type", { length: 50 }).notNull(), // 'artwork_announcement' | 'inquiry_confirmation' | 'curator_alert' | 'preview'
    subject: varchar("subject", { length: 255 }).notNull(),
    artworkId: uuid("artwork_id").references(() => artworks.id, { onDelete: "set null" }),
    inquiryId: uuid("inquiry_id").references(() => inquiries.id, { onDelete: "set null" }),
    status: varchar("status", { length: 50 }).default("sent").notNull(), // 'sent' | 'delivered' | 'failed' | 'sandbox_restricted'
    errorMessage: text("error_message"),
    resendId: varchar("resend_id", { length: 255 }),
    htmlContent: text("html_content"),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("sent_emails_recipient_idx").on(table.recipientEmail),
    index("sent_emails_type_idx").on(table.emailType),
    index("sent_emails_created_idx").on(table.createdAt),
  ]
);

export type SentEmail = typeof sentEmails.$inferSelect;
export type NewSentEmail = typeof sentEmails.$inferInsert;
