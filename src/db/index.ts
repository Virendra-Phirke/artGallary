import { neon } from "@neondatabase/serverless";
import { drizzle, NeonHttpDatabase } from "drizzle-orm/neon-http";
import dns from "node:dns";
import * as schema from "./schema/index";

// Fallback DNS resolution for Neon hostnames
if (typeof window === "undefined") {
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
            return callback(
              null,
              addresses.map((a) => ({ address: a, family: 4 }))
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
