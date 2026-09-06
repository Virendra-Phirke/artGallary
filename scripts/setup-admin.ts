import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getDb, schema } from "../src/db/index";
import { hashPassword } from "../src/lib/auth/auth";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Connecting to database...");
  const db = getDb();
  if (!db) {
    console.error("Database connection not available.");
    process.exit(1);
  }

  const passwordHash = hashPassword("2004");
  console.log("Generated password hash for '2004':", passwordHash);

  // Check if user 'vishal' already exists
  const existingUsers = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, "vishal"));

  let userId: string;

  if (existingUsers.length > 0) {
    userId = existingUsers[0].id;
    console.log("User 'vishal' found with ID:", userId);
    await db
      .update(schema.users)
      .set({
        name: "Vishal (Admin)",
        role: "ADMIN",
        emailVerified: true,
        updatedAt: new Date(),
      })
      .where(eq(schema.users.id, userId));
    console.log("Updated user 'vishal' to ADMIN role.");
  } else {
    const inserted = await db
      .insert(schema.users)
      .values({
        name: "Vishal (Admin)",
        email: "vishal",
        emailVerified: true,
        role: "ADMIN",
      })
      .returning({ id: schema.users.id });
    userId = inserted[0].id;
    console.log("Inserted new admin user 'vishal' with ID:", userId);
  }

  // Update or insert into accounts table
  const existingAccounts = await db
    .select()
    .from(schema.accounts)
    .where(eq(schema.accounts.userId, userId));

  if (existingAccounts.length > 0) {
    await db
      .update(schema.accounts)
      .set({
        passwordHash,
        updatedAt: new Date(),
      })
      .where(eq(schema.accounts.userId, userId));
    console.log("Updated existing account password hash for 'vishal'.");
  } else {
    await db.insert(schema.accounts).values({
      id: `acc-vishal-${Date.now()}`,
      userId,
      accountId: "vishal",
      providerId: "credential",
      passwordHash,
    });
    console.log("Inserted new account credential for 'vishal'.");
  }

  console.log("Admin setup for 'vishal' with password '2004' completed successfully.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Error setting up admin:", err);
    process.exit(1);
  });
