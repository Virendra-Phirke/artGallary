import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "./schema/index";

// Fallback DNS resolution and in-memory cache for Neon hostnames (server-only)
if (typeof window === "undefined" && typeof process !== "undefined" && process.versions?.node) {
  try {
    const dnsMod = "node:dns";
    const dns = require(dnsMod);
    const { Resolver } = dns;
    const resolver = new Resolver();
    resolver.setServers(["8.8.8.8", "1.1.1.1"]);
    const originalLookup = dns.lookup.bind(dns);

  const NEON_DNS_CACHE = new Map<string, string[]>([
    ["ep-round-breeze-az292mxb-pooler.c-3.ap-southeast-1.aws.neon.tech", ["52.76.108.241", "13.251.213.89", "52.76.128.157"]],
    ["api.c-3.ap-southeast-1.aws.neon.tech", ["52.76.128.157", "13.251.213.89", "52.76.108.241"]],
  ]);

  // @ts-ignore
  dns.lookup = function (hostname: string, options: any, callback: any) {
    if (typeof options === "function") {
      callback = options;
      options = {};
    }

    if (hostname && hostname.includes("neon.tech")) {
      const cached = NEON_DNS_CACHE.get(hostname);
      if (cached && cached.length > 0) {
        process.nextTick(() => {
          if (options && options.all) {
            callback(null, cached.map((a) => ({ address: a, family: 4 })));
          } else {
            callback(null, cached[0], 4);
          }
        });
        return;
      }

      resolver.resolve4(hostname, (err: any, addresses: any) => {
        if (!err && addresses && addresses.length > 0) {
          NEON_DNS_CACHE.set(hostname, addresses);
          if (options && options.all) {
            return callback(
              null,
              addresses.map((a: any) => ({ address: a, family: 4 }))
            );
          }
          return callback(null, addresses[0], 4);
        }
        originalLookup(hostname, options, callback);
      });
    } else {
      originalLookup(hostname, options, callback);
    }
  };
  } catch {}
}

import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

let _db: NeonHttpDatabase<typeof schema> | null = null;

export function getDb() {
  const connectionString = process.env.DATABASE_URL || "";
  if (!_db && connectionString && !connectionString.includes("localhost:5432")) {
    try {
      const sql = neon(connectionString);
      _db = drizzle(sql, { schema });
    } catch (e) {
      console.warn("Failed to initialize Neon PostgreSQL client:", e);
    }
  }
  return _db;
}

export const db = getDb();
export { schema };
