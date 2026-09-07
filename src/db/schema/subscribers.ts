import { pgTable, text, timestamp, boolean, uuid, varchar, index } from "drizzle-orm/pg-core";

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }),
    isSubscribed: boolean("is_subscribed").default(true).notNull(),
    unsubscribeToken: text("unsubscribe_token").notNull().unique(),
    source: varchar("source", { length: 50 }).default("footer").notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("subscribers_email_idx").on(table.email),
    index("subscribers_token_idx").on(table.unsubscribeToken),
    index("subscribers_status_idx").on(table.isSubscribed),
  ]
);

export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
export type NewNewsletterSubscriber = typeof newsletterSubscribers.$inferInsert;
