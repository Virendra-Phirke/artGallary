import { getDb } from "../src/db/index";
import { sql } from "drizzle-orm";

async function run() {
  const db = getDb();
  if (!db) {
    console.error("No database connection available");
    process.exit(1);
  }

  console.log("Migrating site_settings columns if not exists...");

  const alterStatements = [
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "short_brand_name" varchar(100) DEFAULT 'L''Atelier';`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "logo_url" text;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "favicon_url" text;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "whatsapp" varchar(50);`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "address" text;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "city" varchar(100);`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "country" varchar(100);`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "business_hours" text;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "contact_instructions" text;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "announcement_bar_json" jsonb;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "header_config_json" jsonb;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "navigation_items_json" jsonb;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "footer_config_json" jsonb;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "gallery_page_config_json" jsonb;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "about_page_config_json" jsonb;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "contact_page_config_json" jsonb;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "legal_pages_json" jsonb;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "maintenance_mode_json" jsonb;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "global_ar_defaults_json" jsonb;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "collections_page_config_json" jsonb;`,
    `ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "exhibitions_page_config_json" jsonb;`,
  ];

  for (const statement of alterStatements) {
    await db.execute(sql.raw(statement));
  }

  console.log("✓ All site_settings CMS columns successfully ensured in Neon DB!");
}

run().catch(console.error);
