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
    imageUrl?: string;
  }>(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const siteSettings = pgTable("site_settings", {
  id: uuid("id").defaultRandom().primaryKey(),
  artistName: varchar("artist_name", { length: 255 }).default("Vishal Patil").notNull(),
  siteTitle: varchar("site_title", { length: 255 }).default("Seclusion Art Gallary").notNull(),
  shortBrandName: varchar("short_brand_name", { length: 100 }).default("Seclusion Art Gallary"),
  tagline: varchar("tagline", { length: 255 }).default("Contemporary Oil & Mixed Media Gallery").notNull(),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  bioSummary: text("bio_summary"),
  statement: text("statement"),
  contactEmail: varchar("contact_email", { length: 255 }).default("curator@latelier-lumineux.art").notNull(),
  phone: varchar("phone", { length: 50 }),
  whatsapp: varchar("whatsapp", { length: 50 }),
  location: varchar("location", { length: 255 }).default("Paris & New York").notNull(),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  country: varchar("country", { length: 100 }),
  businessHours: text("business_hours"),
  contactInstructions: text("contact_instructions"),
  socialLinksJson: jsonb("social_links_json").$type<{
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    artsy?: string;
    facebook?: string;
    pinterest?: string;
    youtube?: string;
  }>(),
  announcementBarJson: jsonb("announcement_bar_json").$type<{
    isEnabled: boolean;
    message: string;
    link?: string;
    linkLabel?: string;
    bg?: string;
    textColor?: string;
    dismissible?: boolean;
  }>(),
  headerConfigJson: jsonb("header_config_json").$type<{
    logoType: "text" | "image";
    logoText?: string;
    logoUrl?: string;
    style: "transparent" | "solid" | "sticky";
    showCta: boolean;
    ctaLabel?: string;
    ctaUrl?: string;
  }>(),
  navigationItemsJson: jsonb("navigation_items_json").$type<
    Array<{
      id: string;
      label: string;
      href: string;
      isEnabled: boolean;
      order: number;
      openInNewTab?: boolean;
    }>
  >(),
  footerConfigJson: jsonb("footer_config_json").$type<{
    description?: string;
    columns: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    contactText?: string;
    copyrightText?: string;
    showNewsletterCta?: boolean;
  }>(),
  galleryPageConfigJson: jsonb("gallery_page_config_json").$type<{
    title?: string;
    subtitle?: string;
    description?: string;
    coverImageUrl?: string;
    defaultLayout?: "grid" | "masonry" | "editorial";
    enabledFilters?: {
      medium: boolean;
      price: boolean;
      year: boolean;
      availability: boolean;
      collection: boolean;
    };
    defaultSort?: string;
  }>(),
  collectionsPageConfigJson: jsonb("collections_page_config_json").$type<{
    title?: string;
    subtitle?: string;
    description?: string;
    coverImageUrl?: string;
    eyebrow?: string;
  }>(),
  exhibitionsPageConfigJson: jsonb("exhibitions_page_config_json").$type<{
    title?: string;
    subtitle?: string;
    description?: string;
    coverImageUrl?: string;
    eyebrow?: string;
  }>(),
  aboutPageConfigJson: jsonb("about_page_config_json").$type<{
    intro?: string;
    bio?: string;
    artistImageUrl?: string;
    story?: string;
    philosophy?: string;
    process?: string;
    quote?: string;
    exhibitions?: Array<{ year: string; title: string; location: string }>;
    achievements?: string[];
    ctaText?: string;
    ctaUrl?: string;
  }>(),
  contactPageConfigJson: jsonb("contact_page_config_json").$type<{
    title?: string;
    description?: string;
    recipientEmail?: string;
    officeAddress?: string;
    openingHours?: string;
    contactInstructions?: string;
    formFields?: {
      name: boolean;
      email: boolean;
      phone: boolean;
      message: boolean;
      artworkContext: boolean;
    };
    successMessage?: string;
  }>(),
  legalPagesJson: jsonb("legal_pages_json").$type<{
    privacyPolicy?: string;
    termsOfService?: string;
    cookiePolicy?: string;
    refundPolicy?: string;
    shippingPolicy?: string;
  }>(),
  maintenanceModeJson: jsonb("maintenance_mode_json").$type<{
    isEnabled: boolean;
    title?: string;
    message?: string;
    expectedReturn?: string;
  }>(),
  globalArDefaultsJson: jsonb("global_ar_defaults_json").$type<{
    defaultFrame: string;
    defaultScale: number;
    defaultPlacement: "wall" | "floor";
    defaultInstructions?: string;
    ctaLabel?: string;
    fallbackMessage?: string;
  }>(),
  copyrightText: varchar("copyright_text", { length: 255 }).default("© 2026 Vishal Patil • Seclusion Art Gallary. All rights reserved."),
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
