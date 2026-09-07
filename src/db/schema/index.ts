import { relations } from "drizzle-orm";
import { users, sessions, accounts, verifications } from "./auth";
import { media, analyticsEvents, activityLogs, contentVersions } from "./system";
import { artworks, artworkImages, artworkAr } from "./artworks";
import { collections, collectionArtworks } from "./collections";
import { exhibitions, exhibitionArtworks } from "./exhibitions";
import { homepageSections, siteSettings, themeSettings } from "./content";
import { inquiries } from "./inquiries";
import { newsletterSubscribers } from "./subscribers";
import { sentEmails } from "./emails";

// Re-export all tables
export * from "./auth";
export * from "./system";
export * from "./artworks";
export * from "./collections";
export * from "./exhibitions";
export * from "./content";
export * from "./inquiries";
export * from "./subscribers";
export * from "./emails";
export * from "./campaigns";

// Relations
export const artworksRelations = relations(artworks, ({ one, many }) => ({
  coverMedia: one(media, {
    fields: [artworks.coverImageId],
    references: [media.id],
  }),
  images: many(artworkImages),
  arConfig: one(artworkAr, {
    fields: [artworks.id],
    references: [artworkAr.artworkId],
  }),
  collectionAssignments: many(collectionArtworks),
  exhibitionAssignments: many(exhibitionArtworks),
  inquiries: many(inquiries),
}));

export const artworkImagesRelations = relations(artworkImages, ({ one }) => ({
  artwork: one(artworks, {
    fields: [artworkImages.artworkId],
    references: [artworks.id],
  }),
  media: one(media, {
    fields: [artworkImages.mediaId],
    references: [media.id],
  }),
}));

export const artworkArRelations = relations(artworkAr, ({ one }) => ({
  artwork: one(artworks, {
    fields: [artworkAr.artworkId],
    references: [artworks.id],
  }),
}));

export const collectionsRelations = relations(collections, ({ one, many }) => ({
  coverMedia: one(media, {
    fields: [collections.coverImageId],
    references: [media.id],
  }),
  artworks: many(collectionArtworks),
}));

export const collectionArtworksRelations = relations(collectionArtworks, ({ one }) => ({
  collection: one(collections, {
    fields: [collectionArtworks.collectionId],
    references: [collections.id],
  }),
  artwork: one(artworks, {
    fields: [collectionArtworks.artworkId],
    references: [artworks.id],
  }),
}));

export const exhibitionsRelations = relations(exhibitions, ({ one, many }) => ({
  coverMedia: one(media, {
    fields: [exhibitions.coverImageId],
    references: [media.id],
  }),
  artworks: many(exhibitionArtworks),
}));

export const exhibitionArtworksRelations = relations(exhibitionArtworks, ({ one }) => ({
  exhibition: one(exhibitions, {
    fields: [exhibitionArtworks.exhibitionId],
    references: [exhibitions.id],
  }),
  artwork: one(artworks, {
    fields: [exhibitionArtworks.artworkId],
    references: [artworks.id],
  }),
}));

export const inquiriesRelations = relations(inquiries, ({ one }) => ({
  user: one(users, {
    fields: [inquiries.userId],
    references: [users.id],
  }),
  artwork: one(artworks, {
    fields: [inquiries.artworkId],
    references: [artworks.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  inquiries: many(inquiries),
  activityLogs: many(activityLogs),
}));
