import { pgTable, text, timestamp, uuid, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export const homepageSections = pgTable("homepage_sections", {
  id: uuid("id").defaultRandom().primaryKey(),
  sectionKey: varchar("section_key", { length: 50 }).notNull().unique(), // 'hero' | 'featured_artworks' | 'latest_collection' | 'artist_story' | 'ar_experience' | 'featured_exhibition' | 'contact_cta'
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: text("subtitle"),
  contentJson: jsonb("content_json").$type<{
    heading?: string;
    subheading?: string;
    description?: string;
    ctaText?: string;
    ctaUrl?: string;
    secondaryCtaText?: string;
    secondaryCtaUrl?: string;
    featuredArtworkIds?: string[];
    featuredCollectionId?: string;
    featuredExhibitionId?: string;
    badge?: string;
    quote?: string;
    imagePosition?: "left" | "right";
  }>(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  artistName: varchar("artist_name", { length: 255 }).default("Elena Vance").notNull(),
  siteTitle: varchar("site_title", { length: 255 }).default("L'Atelier Lumineux").notNull(),
  tagline: varchar("tagline", { length: 255 }).default("Contemporary Oil & Mixed Media Gallery").notNull(),
  bioSummary: text("bio_summary"),
  statement: text("statement"),
  contactEmail: varchar("contact_email", { length: 255 }).default("curator@latelier-lumineux.art").notNull(),
  phone: varchar("phone", { length: 50 }),
  location: varchar("location", { length: 255 }).default("Paris & New York").notNull(),
  socialLinksJson: jsonb("social_links_json").$type<{
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    artsy?: string;
  }>(),
  copyrightText: varchar("copyright_text", { length: 255 }).default("© 2026 Elena Vance. All rights reserved."),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const themeSettings = pgTable("theme_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  primaryColor: varchar("primary_color", { length: 50 }).default("#d1a86e").notNull(),
  accentColor: varchar("accent_color", { length: 50 }).default("#e2c18d").notNull(),
  backgroundColor: varchar("background_color", { length: 50 }).default("#0d0e12").notNull(),
  foregroundColor: varchar("foreground_color", { length: 50 }).default("#f4f4f6").notNull(),
  headingFont: varchar("heading_font", { length: 100 }).default("Playfair Display").notNull(),
  bodyFont: varchar("body_font", { length: 100 }).default("Plus Jakarta Sans").notNull(),
  borderRadius: varchar("border_radius", { length: 20 }).default("0.375rem").notNull(),
  containerWidth: varchar("container_width", { length: 20 }).default("1440px").notNull(),
  animationLevel: varchar("animation_level", { length: 30 }).default("cinematic").notNull(), // 'minimal' | 'standard' | 'cinematic'
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});
