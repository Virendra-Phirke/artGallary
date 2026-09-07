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

  console.log("Applying database migration for email and subscriber system...");
  const sql = neon(connectionString);

  await sql`
    CREATE TABLE IF NOT EXISTS "newsletter_subscribers" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "email" varchar(255) NOT NULL UNIQUE,
      "name" varchar(255),
      "is_subscribed" boolean DEFAULT true NOT NULL,
      "unsubscribe_token" text NOT NULL UNIQUE,
      "source" varchar(50) DEFAULT 'footer' NOT NULL,
      "created_at" timestamp DEFAULT now() NOT NULL,
      "updated_at" timestamp DEFAULT now() NOT NULL
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "subscribers_email_idx" ON "newsletter_subscribers" ("email");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "subscribers_token_idx" ON "newsletter_subscribers" ("unsubscribe_token");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "subscribers_status_idx" ON "newsletter_subscribers" ("is_subscribed");
  `;

  await sql`
    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "marketing_subscribed" boolean DEFAULT true NOT NULL;
  `;
  await sql`
    ALTER TABLE "user" ADD COLUMN IF NOT EXISTS "unsubscribe_token" text;
  `;

  await sql`
    UPDATE "user" SET "unsubscribe_token" = gen_random_uuid()::text WHERE "unsubscribe_token" IS NULL;
  `;

  await sql`
    ALTER TABLE "artworks" ADD COLUMN IF NOT EXISTS "notified_subscribers_at" timestamp;
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "sent_emails" (
      "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
      "recipient_email" varchar(255) NOT NULL,
      "recipient_name" varchar(255),
      "email_type" varchar(50) NOT NULL,
      "subject" varchar(255) NOT NULL,
      "artwork_id" uuid,
      "inquiry_id" uuid,
      "status" varchar(50) DEFAULT 'sent' NOT NULL,
      "error_message" text,
      "resend_id" varchar(255),
      "html_content" text,
      "created_at" timestamp DEFAULT now() NOT NULL
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS "sent_emails_recipient_idx" ON "sent_emails" ("recipient_email");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "sent_emails_type_idx" ON "sent_emails" ("email_type");
  `;
  await sql`
    CREATE INDEX IF NOT EXISTS "sent_emails_created_idx" ON "sent_emails" ("created_at");
  `;

  console.log("✓ Email & subscriber migration successfully applied to Neon PostgreSQL!");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
