import { pgTable, text, timestamp, uuid, varchar, integer, boolean, primaryKey } from "drizzle-orm/pg-core";
import { media } from "./system";
import { artworks } from "./artworks";

export const exhibitions = pgTable("exhibitions", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  title: varchar("title", { length: 255 }).notNull(),
  subtitle: varchar("subtitle", { length: 255 }),
  description: text("description").notNull(),
  curatorNote: text("curator_note"),
  location: varchar("location", { length: 255 }).notNull(),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }).notNull(),
  status: varchar("status", { length: 20 }).default("upcoming").notNull(), // 'upcoming' | 'current' | 'past'
  coverImageId: uuid("cover_image_id").references(() => media.id, { onDelete: "set null" }),
  coverImageUrl: text("cover_image_url"),
  isPublished: boolean("is_published").default(true).notNull(),
  displayOrder: integer("display_order").default(0).notNull(),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export const exhibitionArtworks = pgTable(
  "exhibition_artworks",
  {
    exhibitionId: uuid("exhibition_id").notNull().references(() => exhibitions.id, { onDelete: "cascade" }),
    artworkId: uuid("artwork_id").notNull().references(() => artworks.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.exhibitionId, table.artworkId] })
  ]
);
