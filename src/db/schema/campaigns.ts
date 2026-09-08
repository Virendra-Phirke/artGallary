import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  jsonb,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { artworks } from "./artworks";
import { users } from "./auth";

export const emailCampaigns = pgTable(
  "email_campaigns",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    title: varchar("title", { length: 255 }).notNull(),
    type: varchar("type", { length: 64 }).notNull(), // 'artwork_release' | 'newsletter' | 'inquiry_followup'
    subject: varchar("subject", { length: 255 }).notNull(),
    artworkId: uuid("artwork_id").references(() => artworks.id, { onDelete: "set null" }),
    status: varchar("status", { length: 32 }).default("draft").notNull(), // 'draft' | 'scheduled' | 'queued' | 'processing' | 'sent' | 'cancelled' | 'failed'
    recipientFilter: jsonb("recipient_filter").default({}).notNull(),
    totalRecipients: integer("total_recipients").default(0).notNull(),
    sentCount: integer("sent_count").default(0).notNull(),
    failedCount: integer("failed_count").default(0).notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true, mode: "date" }),
    timezone: varchar("timezone", { length: 64 }).default("UTC").notNull(),
    createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    completedAt: timestamp("completed_at", { withTimezone: true, mode: "date" }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true, mode: "date" }),
  },
  (table) => [
    index("campaigns_status_idx").on(table.status),
    index("campaigns_artwork_idx").on(table.artworkId),
    index("campaigns_scheduled_idx").on(table.scheduledAt),
    index("campaigns_created_idx").on(table.createdAt),
  ]
);

export const emailJobs = pgTable(
  "email_jobs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    campaignId: uuid("campaign_id").references(() => emailCampaigns.id, { onDelete: "cascade" }),
    recipientEmail: varchar("recipient_email", { length: 255 }).notNull(),
    recipientName: varchar("recipient_name", { length: 255 }),
    jobType: varchar("job_type", { length: 64 }).notNull(), // 'artwork_announcement' | 'inquiry_confirmation' | 'curator_alert'
    status: varchar("status", { length: 32 }).default("pending").notNull(), // 'pending' | 'queued' | 'processing' | 'sent' | 'retrying' | 'failed' | 'cancelled'
    qstashMessageId: varchar("qstash_message_id", { length: 255 }),
    resendMessageId: varchar("resend_message_id", { length: 255 }),
    attemptCount: integer("attempt_count").default(0).notNull(),
    lastError: text("last_error"),
    failureReason: varchar("failure_reason", { length: 64 }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true, mode: "date" }),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "date" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("unique_campaign_recipient_job").on(
      table.campaignId,
      table.recipientEmail,
      table.jobType
    ),
    index("jobs_campaign_idx").on(table.campaignId),
    index("jobs_recipient_idx").on(table.recipientEmail),
    index("jobs_status_idx").on(table.status),
    index("jobs_qstash_idx").on(table.qstashMessageId),
    index("jobs_created_idx").on(table.createdAt),
  ]
);

export type EmailCampaign = typeof emailCampaigns.$inferSelect;
export type NewEmailCampaign = typeof emailCampaigns.$inferInsert;

export type EmailJob = typeof emailJobs.$inferSelect;
export type NewEmailJob = typeof emailJobs.$inferInsert;
