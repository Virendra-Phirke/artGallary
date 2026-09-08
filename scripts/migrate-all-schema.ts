import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import dns from "node:dns";

dotenv.config({ path: ".env.local" });

const { Resolver } = dns;
const resolver = new Resolver();
resolver.setServers(["8.8.8.8", "1.1.1.1"]);
const originalLookup = dns.lookup.bind(dns);

// @ts-ignore
dns.lookup = function (hostname: string, options: any, callback: any) {
  if (typeof options === "function") {
    callback = options;
    options = {};
  }
  if (hostname && hostname.includes("neon.tech")) {
    resolver.resolve4(hostname, (err, addresses) => {
      if (!err && addresses && addresses.length > 0) {
        if (options && options.all) {
          return callback(null, addresses.map((a) => ({ address: a, family: 4 })));
        }
        return callback(null, addresses[0], 4);
      }
      originalLookup(hostname, options, callback);
    });
  } else {
    originalLookup(hostname, options, callback);
  }
};

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL not found in environment.");
    process.exit(1);
  }

  console.log("Connecting to Neon PostgreSQL database...");
  const sql = neon(connectionString);

  console.log("Ensuring inquiries schema columns...");
  await sql`
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "preferred_contact_method" varchar(20) DEFAULT 'email';
  `;
  await sql`
    ALTER TABLE "inquiries" ADD COLUMN IF NOT EXISTS "admin_notes" text;
  `;
  console.log("✓ Inquiries table updated with preferred_contact_method and admin_notes.");

  console.log("Ensuring site_settings columns...");
  await sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "whatsapp" varchar(50);
  `;
  await sql`
    ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "short_brand_name" varchar(100) DEFAULT 'Helena Vance';
  `;

  console.log("Ensuring email_campaigns table exists...");
  await sql`
    CREATE TABLE IF NOT EXISTS "email_campaigns" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "title" varchar(255) NOT NULL,
      "type" varchar(64) NOT NULL,
      "subject" varchar(255) NOT NULL,
      "artwork_id" uuid REFERENCES "artworks"("id") ON DELETE SET NULL,
      "status" varchar(32) DEFAULT 'draft' NOT NULL,
      "recipient_filter" jsonb DEFAULT '{}'::jsonb NOT NULL,
      "total_recipients" integer DEFAULT 0 NOT NULL,
      "sent_count" integer DEFAULT 0 NOT NULL,
      "failed_count" integer DEFAULT 0 NOT NULL,
      "scheduled_at" timestamp with time zone,
      "timezone" varchar(64) DEFAULT 'UTC' NOT NULL,
      "created_by" uuid REFERENCES "user"("id") ON DELETE SET NULL,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
      "completed_at" timestamp with time zone,
      "cancelled_at" timestamp with time zone
    );
  `;

  console.log("Ensuring email_jobs table exists...");
  await sql`
    CREATE TABLE IF NOT EXISTS "email_jobs" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "campaign_id" uuid REFERENCES "email_campaigns"("id") ON DELETE CASCADE,
      "recipient_email" varchar(255) NOT NULL,
      "recipient_name" varchar(255),
      "job_type" varchar(64) NOT NULL,
      "status" varchar(32) DEFAULT 'pending' NOT NULL,
      "qstash_message_id" varchar(255),
      "resend_message_id" varchar(255),
      "attempt_count" integer DEFAULT 0 NOT NULL,
      "last_error" text,
      "failure_reason" varchar(64),
      "scheduled_at" timestamp with time zone,
      "sent_at" timestamp with time zone,
      "created_at" timestamp with time zone DEFAULT now() NOT NULL,
      "updated_at" timestamp with time zone DEFAULT now() NOT NULL
    );
  `;

  console.log("Ensuring email_jobs unique index safely...");
  try {
    await sql`
      CREATE UNIQUE INDEX IF NOT EXISTS "unique_campaign_recipient_job" 
      ON "email_jobs" ("campaign_id", "recipient_email", "job_type");
    `;
    console.log("✓ Unique constraint index ensured on email_jobs.");
  } catch (e: any) {
    console.warn("Unique index notice (existing duplicate jobs preserved):", e?.message);
  }

  console.log("✓ Database schema migration successfully synchronized with Neon PostgreSQL!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
