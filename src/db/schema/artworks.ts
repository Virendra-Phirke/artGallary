import { pgTable, text, timestamp, uuid, varchar, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { media } from "./system";

export const artworks = pgTable("artworks", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  longDescription: text("long_description"),
  year: integer("year").notNull(),
  medium: varchar("medium", { length: 255 }).notNull(),
  widthCm: numeric("width_cm", { precision: 8, scale: 2 }).notNull(),
  heightCm: numeric("height_cm", { precision: 8, scale: 2 }).notNull(),
  depthCm: numeric("depth_cm", { precision: 8, scale: 2 }),
  price: numeric("price", { precision: 12, scale: 2 }),
  currency: varchar("currency", { length: 10 }).default("USD").notNull(),
  status: varchar("status", { length: 20 }).default("draft").notNull(), // 'draft' | 'published' | 'reserved' | 'sold' | 'archived'
  coverImageId: uuid("cover_image_id").references(() => media.id, { onDelete: "set null" }),
  coverImageUrl: text("cover_image_url"), // Direct URL convenience for seed and caching
  altText: text("alt_text").notNull(),
  seoTitle: varchar("seo_title", { length: 255 }),
  seoDescription: text("seo_description"),
  isFeatured: boolean("is_featured").default(false).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  publishedAt: timestamp("published_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  deletedAt: timestamp("deleted_at", { mode: "date" }),
});

export const artworkImages = pgTable("artwork_images", {
  id: uuid("id").defaultRandom().primaryKey(),
  artworkId: uuid("artwork_id").notNull().references(() => artworks.id, { onDelete: "cascade" }),
  mediaId: uuid("media_id").references(() => media.id, { onDelete: "cascade" }),
  imageUrl: text("image_url").notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  caption: text("caption"),
  isPrimary: boolean("is_primary").default(false).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
});

export const artworkAr = pgTable("artwork_ar", {
  id: uuid("id").defaultRandom().primaryKey(),
  artworkId: uuid("artwork_id").notNull().unique().references(() => artworks.id, { onDelete: "cascade" }),
  isArEnabled: boolean("is_ar_enabled").default(true).notNull(),
  defaultWidthCm: numeric("default_width_cm", { precision: 8, scale: 2 }).notNull(),
  defaultHeightCm: numeric("default_height_cm", { precision: 8, scale: 2 }).notNull(),
  defaultScale: numeric("default_scale", { precision: 5, scale: 2 }).default("1.00").notNull(),
  defaultRotation: numeric("default_rotation", { precision: 5, scale: 2 }).default("0.00").notNull(),
  minScale: numeric("min_scale", { precision: 5, scale: 2 }).default("0.50").notNull(),
  maxScale: numeric("max_scale", { precision: 5, scale: 2 }).default("2.00").notNull(),
  placementMode: varchar("placement_mode", { length: 20 }).default("wall").notNull(), // 'wall' | 'floor'
  frameEnabled: boolean("frame_enabled").default(false).notNull(),
  frameType: varchar("frame_type", { length: 50 }).default("minimal_black").notNull(), // 'none' | 'minimal_black' | 'classic_gold' | 'natural_wood' | 'white_gallery'
  frameDepthCm: numeric("frame_depth_cm", { precision: 5, scale: 2 }).default("3.00").notNull(),
  frameWidthCm: numeric("frame_width_cm", { precision: 5, scale: 2 }).default("4.00").notNull(),
  matColor: varchar("mat_color", { length: 20 }).default("#FFFFFF").notNull(),
  arReadinessStatus: varchar("ar_readiness_status", { length: 30 }).default("ready").notNull(), // 'ready' | 'needs_attention'
  arInstructions: text("ar_instructions"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
