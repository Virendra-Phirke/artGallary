ALTER TABLE "media" ADD COLUMN "provider" varchar(30) DEFAULT 'cloudflare' NOT NULL;--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "provider_asset_id" varchar(255);--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "checksum" varchar(64);--> statement-breakpoint
ALTER TABLE "media" ADD COLUMN "migration_status" varchar(30) DEFAULT 'verified' NOT NULL;