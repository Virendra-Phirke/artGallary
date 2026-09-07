CREATE TABLE "newsletter_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255),
	"is_subscribed" boolean DEFAULT true NOT NULL,
	"unsubscribe_token" text NOT NULL,
	"source" varchar(50) DEFAULT 'footer' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "newsletter_subscribers_email_unique" UNIQUE("email"),
	CONSTRAINT "newsletter_subscribers_unsubscribe_token_unique" UNIQUE("unsubscribe_token")
);
--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "marketing_subscribed" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "unsubscribe_token" text;--> statement-breakpoint
ALTER TABLE "artwork_ar" ADD COLUMN "min_scale" numeric(5, 2) DEFAULT '0.50' NOT NULL;--> statement-breakpoint
ALTER TABLE "artwork_ar" ADD COLUMN "max_scale" numeric(5, 2) DEFAULT '2.00' NOT NULL;--> statement-breakpoint
ALTER TABLE "artwork_ar" ADD COLUMN "placement_mode" varchar(20) DEFAULT 'wall' NOT NULL;--> statement-breakpoint
ALTER TABLE "artworks" ADD COLUMN "notified_subscribers_at" timestamp;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "short_brand_name" varchar(100) DEFAULT 'L''Atelier';--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "logo_url" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "favicon_url" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "whatsapp" varchar(50);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "address" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "city" varchar(100);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "country" varchar(100);--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "business_hours" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "contact_instructions" text;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "announcement_bar_json" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "header_config_json" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "navigation_items_json" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "footer_config_json" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "gallery_page_config_json" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "collections_page_config_json" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "exhibitions_page_config_json" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "about_page_config_json" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "contact_page_config_json" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "legal_pages_json" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "maintenance_mode_json" jsonb;--> statement-breakpoint
ALTER TABLE "site_settings" ADD COLUMN "global_ar_defaults_json" jsonb;--> statement-breakpoint
CREATE INDEX "subscribers_email_idx" ON "newsletter_subscribers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "subscribers_token_idx" ON "newsletter_subscribers" USING btree ("unsubscribe_token");--> statement-breakpoint
CREATE INDEX "subscribers_status_idx" ON "newsletter_subscribers" USING btree ("is_subscribed");--> statement-breakpoint
CREATE INDEX "artwork_images_artwork_id_idx" ON "artwork_images" USING btree ("artwork_id");--> statement-breakpoint
CREATE INDEX "artworks_status_order_idx" ON "artworks" USING btree ("status","display_order");--> statement-breakpoint
CREATE INDEX "artworks_status_featured_idx" ON "artworks" USING btree ("status","is_featured");--> statement-breakpoint
CREATE INDEX "artworks_slug_idx" ON "artworks" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "collections_is_published_order_idx" ON "collections" USING btree ("is_published","display_order");--> statement-breakpoint
CREATE INDEX "collections_slug_idx" ON "collections" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "exhibitions_is_published_order_idx" ON "exhibitions" USING btree ("is_published","display_order");--> statement-breakpoint
CREATE INDEX "exhibitions_slug_idx" ON "exhibitions" USING btree ("slug");--> statement-breakpoint
ALTER TABLE "user" ADD CONSTRAINT "user_unsubscribe_token_unique" UNIQUE("unsubscribe_token");