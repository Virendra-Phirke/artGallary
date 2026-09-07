import { pgTable, text, timestamp, uuid, varchar, integer, boolean, primaryKey, index } from "drizzle-orm/pg-core";
import { media } from "./system";
import { artworks } from "./artworks";

export const collections = pgTable(
  "collections",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description").notNull(),
    curatorialStatement: text("curatorial_statement"),
    coverImageId: uuid("cover_image_id").references(() => media.id, { onDelete: "set null" }),
    coverImageUrl: text("cover_image_url"),
    isPublished: boolean("is_published").default(true).notNull(),
    displayOrder: integer("display_order").default(0).notNull(),
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => [
    index("collections_is_published_order_idx").on(table.isPublished, table.displayOrder),
    index("collections_slug_idx").on(table.slug),
  ]
);

export const collectionArtworks = pgTable(
  "collection_artworks",
  {
    collectionId: uuid("collection_id").notNull().references(() => collections.id, { onDelete: "cascade" }),
    artworkId: uuid("artwork_id").notNull().references(() => artworks.id, { onDelete: "cascade" }),
    displayOrder: integer("display_order").default(0).notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.collectionId, table.artworkId] })
  ]
);
