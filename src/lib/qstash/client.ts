import { Client } from "@upstash/qstash";

let qstashClient: Client | null = null;

/**
 * Validates whether QStash token is configured.
 */
export function hasQStashConfig(): boolean {
  return Boolean(process.env.QSTASH_TOKEN?.trim());
}

/**
 * Returns the singleton Upstash QStash client configured with official SDK defaults.
 * No region-specific URLs are hardcoded.
 */
export function getQStashClient(): Client | null {
  if (!hasQStashConfig()) {
    return null;
  }

  if (!qstashClient) {
    try {
      qstashClient = new Client({
        token: process.env.QSTASH_TOKEN!.trim(),
      });
    } catch (err) {
      console.error("[QStash Client] Initialization failed:", err);
      return null;
    }
  }

  return qstashClient;
}
