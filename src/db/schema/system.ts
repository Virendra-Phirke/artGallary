import { pgTable, text, timestamp, uuid, varchar, integer, numeric, jsonb } from "drizzle-orm/pg-core";
import { users } from "./auth";

export const media = pgTable("media", {
  id: uuid("id").defaultRandom().primaryKey(),
  provider: varchar("provider", { length: 30 }).default("cloudflare").notNull(), // 'imagekit' | 'cloudflare'
  providerAssetId: varchar("provider_asset_id", { length: 255 }),
  fileName: text("file_name").notNull(),
  fileKey: varchar("file_key", { length: 255 }).notNull().unique(),
  fileUrl: text("file_url").notNull(),
  mimeType: varchar("mime_type", { length: 100 }).notNull(),
  byteSize: integer("byte_size").notNull(),
  width: integer("width").notNull(),
  height: integer("height").notNull(),
  aspectRatio: numeric("aspect_ratio", { precision: 8, scale: 4 }).notNull(),
  blurDataUrl: text("blur_data_url"),
  checksum: varchar("checksum", { length: 64 }),
  migrationStatus: varchar("migration_status", { length: 30 }).default("verified").notNull(), // 'pending' | 'migrating' | 'verified' | 'failed'
  variantsJson: jsonb("variants_json").$type<{
    original: string;
    optimized: string;
    thumbnail: string;
    arTexture?: string;
  }>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  eventName: varchar("event_name", { length: 50 }).notNull(), // 'page_view' | 'artwork_view' | 'ar_open' | 'ar_success' | 'ar_exit' | 'inquiry_started' | 'inquiry_sent'
  entityType: varchar("entity_type", { length: 50 }),
  entityId: varchar("entity_id", { length: 100 }),
  sessionId: varchar("session_id", { length: 100 }).notNull(),
  metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  adminId: uuid("admin_id").references(() => users.id, { onDelete: "set null" }),
  action: varchar("action", { length: 100 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }),
  description: text("description").notNull(),
  metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>(),
  ipAddress: varchar("ip_address", { length: 64 }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const contentVersions = pgTable("content_versions", {
  id: uuid("id").defaultRandom().primaryKey(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: varchar("entity_id", { length: 100 }).notNull(),
  versionNumber: integer("version_number").notNull(),
  snapshotJson: jsonb("snapshot_json").notNull(),
  createdBy: uuid("created_by").references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});
