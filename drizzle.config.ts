import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";
import dns from "node:dns";

dotenv.config({ path: ".env.local" });

// Ensure remote Neon hostname resolves on Windows environments
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


export default defineConfig({
  schema: "./src/db/schema/index.ts",
  out: "./src/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
