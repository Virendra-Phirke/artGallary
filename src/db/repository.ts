import { getDb, schema } from "./index";
import { eq, desc, asc, and, or, sql } from "drizzle-orm";
import {
  MockArtwork,
  MockCollection,
  MockExhibition,
  MockHomepageSection,
  MockInquiry,
  SiteSettingsData,
  ThemeSettingsData,
  DEFAULT_NAVIGATION_ITEMS,
  DEFAULT_SITE_SETTINGS,
  DEFAULT_THEME_SETTINGS,
  INITIAL_ARTWORKS,
  INITIAL_COLLECTIONS,
  INITIAL_EXHIBITIONS,
  INITIAL_HOMEPAGE_SECTIONS,
} from "./mockData";

export type { MockArtwork, MockCollection, MockExhibition, MockHomepageSection, MockInquiry, SiteSettingsData, ThemeSettingsData };
export { DEFAULT_NAVIGATION_ITEMS, DEFAULT_SITE_SETTINGS, DEFAULT_THEME_SETTINGS };

export interface MediaRecord {
  id: string;
  fileName: string;
  fileUrl: string;
  fileKey?: string;
  mimeType: string;
  dimensions: string;
  byteSize: string;
  uploadedAt: string;
  provider: "imagekit" | "cloudflare";
  migrationStatus: string;
}

const DEFAULT_VERIFIED_COVER =
  "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function isUuid(value?: string | null): boolean {
  if (!value) return false;
  return UUID_REGEX.test(value);
}

function mapDbArtwork(
  row: any,
  arRow?: any,
  extra?: {
    collectionSlug?: string;
    collectionName?: string;
    additionalImages?: string[];
  }
): MockArtwork {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    longDescription: row.longDescription || "",
    year: row.year,
    medium: row.medium,
    widthCm: Number(row.widthCm),
    heightCm: Number(row.heightCm),
    depthCm: row.depthCm ? Number(row.depthCm) : undefined,
    price: row.price ? Number(row.price) : undefined,
    currency: row.currency || "USD",
    status: row.status as any,
    coverImageUrl: row.coverImageUrl || DEFAULT_VERIFIED_COVER,
    additionalImages: extra?.additionalImages || [],
    altText: row.altText || row.title,
    seoTitle: row.seoTitle || undefined,
    seoDescription: row.seoDescription || undefined,
    isFeatured: row.isFeatured,
    displayOrder: row.displayOrder,
    collectionSlug: extra?.collectionSlug,
    collectionName: extra?.collectionName,
    arConfig: {
      isArEnabled: arRow?.isArEnabled ?? true,
      defaultWidthCm: arRow?.defaultWidthCm
        ? Number(arRow.defaultWidthCm)
        : Number(row.widthCm),
      defaultHeightCm: arRow?.defaultHeightCm
        ? Number(arRow.defaultHeightCm)
        : Number(row.heightCm),
      defaultScale: arRow?.defaultScale ? Number(arRow.defaultScale) : 1.0,
      defaultRotation: arRow?.defaultRotation ? Number(arRow.defaultRotation) : 0.0,
      minScale: arRow?.minScale ? Number(arRow.minScale) : 0.5,
      maxScale: arRow?.maxScale ? Number(arRow.maxScale) : 2.0,
      placementMode: (arRow?.placementMode as any) || "wall",
      frameEnabled: arRow?.frameEnabled ?? false,
      frameType: (arRow?.frameType as any) || "minimal_black",
      frameDepthCm: arRow?.frameDepthCm ? Number(arRow.frameDepthCm) : 3.5,
      frameWidthCm: arRow?.frameWidthCm ? Number(arRow.frameWidthCm) : 3.0,
      matColor: arRow?.matColor || "#FFFFFF",
      arReadinessStatus: (arRow?.arReadinessStatus as any) || "ready",
      arInstructions: arRow?.arInstructions || "Point camera at flat wall surface.",
    },
  };
}

export async function getArtworks(filters?: {
  status?: string;
  collectionSlug?: string;
  medium?: string;
  featuredOnly?: boolean;
  searchQuery?: string;
}): Promise<MockArtwork[]> {
  const db = getDb();
  let list: MockArtwork[] = [];

  if (db) {
    try {
      const results = await db
        .select({
          artwork: schema.artworks,
          ar: schema.artworkAr,
          collectionSlug: schema.collections.slug,
          collectionName: schema.collections.title,
        })
        .from(schema.artworks)
        .leftJoin(schema.artworkAr, eq(schema.artworkAr.artworkId, schema.artworks.id))
        .leftJoin(
          schema.collectionArtworks,
          eq(schema.collectionArtworks.artworkId, schema.artworks.id)
        )
        .leftJoin(
          schema.collections,
          eq(schema.collections.id, schema.collectionArtworks.collectionId)
        )
        .orderBy(asc(schema.artworks.displayOrder));

      list = results.map((r) =>
        mapDbArtwork(r.artwork, r.ar, {
          collectionSlug: r.collectionSlug || undefined,
          collectionName: r.collectionName || undefined,
        })
      );
    } catch (e) {
      console.warn("Database getArtworks failed, using fallback:", e);
    }
  }

  if (list.length === 0) {
    list = [...INITIAL_ARTWORKS];
  }

  list = list.filter((a) => a.status !== "archived");

  if (filters?.featuredOnly) {
    list = list.filter((a) => a.isFeatured && a.status === "published");
  }

  if (filters?.status && filters.status !== "all") {
    list = list.filter((a) => a.status === filters.status);
  }

  if (filters?.collectionSlug && filters.collectionSlug !== "all") {
    list = list.filter((a) => a.collectionSlug === filters.collectionSlug);
  }

  if (filters?.medium && filters.medium !== "all") {
    list = list.filter((a) =>
      a.medium.toLowerCase().includes(filters.medium!.toLowerCase())
    );
  }

  if (filters?.searchQuery) {
    const q = filters.searchQuery.toLowerCase();
    list = list.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.description.toLowerCase().includes(q) ||
        a.medium.toLowerCase().includes(q)
    );
  }

  return list;
}

export async function getAllArtworksAdmin(): Promise<MockArtwork[]> {
  const db = getDb();
  if (db) {
    try {
      const results = await db
        .select({
          artwork: schema.artworks,
          ar: schema.artworkAr,
          collectionSlug: schema.collections.slug,
          collectionName: schema.collections.title,
        })
        .from(schema.artworks)
        .leftJoin(schema.artworkAr, eq(schema.artworkAr.artworkId, schema.artworks.id))
        .leftJoin(
          schema.collectionArtworks,
          eq(schema.collectionArtworks.artworkId, schema.artworks.id)
        )
        .leftJoin(
          schema.collections,
          eq(schema.collections.id, schema.collectionArtworks.collectionId)
        )
        .orderBy(asc(schema.artworks.displayOrder));

      if (results.length > 0) {
        return results.map((r) =>
          mapDbArtwork(r.artwork, r.ar, {
            collectionSlug: r.collectionSlug || undefined,
            collectionName: r.collectionName || undefined,
          })
        );
      }
    } catch (e) {
      console.warn("Database getAllArtworksAdmin failed, using fallback:", e);
    }
  }

  return INITIAL_ARTWORKS;
}

export async function getArtworkBySlug(slug: string): Promise<MockArtwork | null> {
  const db = getDb();
  if (!db) {
    return INITIAL_ARTWORKS.find((a) => a.slug === slug || a.id === slug) || null;
  }

  try {
    const results = await db
      .select({
        artwork: schema.artworks,
        ar: schema.artworkAr,
        collectionSlug: schema.collections.slug,
        collectionName: schema.collections.title,
      })
      .from(schema.artworks)
      .leftJoin(schema.artworkAr, eq(schema.artworkAr.artworkId, schema.artworks.id))
      .leftJoin(
        schema.collectionArtworks,
        eq(schema.collectionArtworks.artworkId, schema.artworks.id)
      )
      .leftJoin(
        schema.collections,
        eq(schema.collections.id, schema.collectionArtworks.collectionId)
      )
      .where(eq(schema.artworks.slug, slug))
      .limit(1);

    if (results.length === 0) {
      return INITIAL_ARTWORKS.find((a) => a.slug === slug || a.id === slug) || null;
    }

    const item = results[0];
    const additional = await db
      .select()
      .from(schema.artworkImages)
      .where(
        and(
          eq(schema.artworkImages.artworkId, item.artwork.id),
          eq(schema.artworkImages.isPrimary, false)
        )
      )
      .orderBy(asc(schema.artworkImages.displayOrder));

    return mapDbArtwork(item.artwork, item.ar, {
      collectionSlug: item.collectionSlug || undefined,
      collectionName: item.collectionName || undefined,
      additionalImages: additional.map((i) => i.imageUrl),
    });
  } catch (e) {
    console.warn("Database getArtworkBySlug failed, using fallback:", e);
    return INITIAL_ARTWORKS.find((a) => a.slug === slug || a.id === slug) || null;
  }
}

export async function getArtworkById(id: string): Promise<MockArtwork | null> {
  const db = getDb();
  if (!db) {
    return INITIAL_ARTWORKS.find((a) => a.id === id || a.slug === id) || null;
  }

  try {
    const isIdUuid = isUuid(id);
    const results = await db
      .select({
        artwork: schema.artworks,
        ar: schema.artworkAr,
        collectionSlug: schema.collections.slug,
        collectionName: schema.collections.title,
      })
      .from(schema.artworks)
      .leftJoin(schema.artworkAr, eq(schema.artworkAr.artworkId, schema.artworks.id))
      .leftJoin(
        schema.collectionArtworks,
        eq(schema.collectionArtworks.artworkId, schema.artworks.id)
      )
      .leftJoin(
        schema.collections,
        eq(schema.collections.id, schema.collectionArtworks.collectionId)
      )
      .where(
        isIdUuid
          ? or(eq(schema.artworks.slug, id), eq(schema.artworks.id, id))
          : eq(schema.artworks.slug, id)
      )
      .limit(1);

    if (results.length === 0) {
      return INITIAL_ARTWORKS.find((a) => a.id === id || a.slug === id) || null;
    }

    const item = results[0];
    const additional = await db
      .select()
      .from(schema.artworkImages)
      .where(
        and(
          eq(schema.artworkImages.artworkId, item.artwork.id),
          eq(schema.artworkImages.isPrimary, false)
        )
      )
      .orderBy(asc(schema.artworkImages.displayOrder));

    return mapDbArtwork(item.artwork, item.ar, {
      collectionSlug: item.collectionSlug || undefined,
      collectionName: item.collectionName || undefined,
      additionalImages: additional.map((i) => i.imageUrl),
    });
  } catch (e) {
    console.warn("Database getArtworkById failed, using fallback:", e);
    return INITIAL_ARTWORKS.find((a) => a.id === id || a.slug === id) || null;
  }
}

export async function saveArtwork(data: Partial<MockArtwork> & { collectionId?: string }): Promise<MockArtwork> {
  const db = getDb();
  if (!db) throw new Error("Database connection unavailable");

  try {
    const existing = await getArtworkById(data.id || data.slug || "");
    if (existing) {
      const updateFields: Record<string, any> = { updatedAt: new Date() };
      if (data.title !== undefined) updateFields.title = data.title;
      if (data.slug !== undefined) updateFields.slug = data.slug;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.longDescription !== undefined) updateFields.longDescription = data.longDescription;
      if (data.year !== undefined) updateFields.year = data.year;
      if (data.medium !== undefined) updateFields.medium = data.medium;
      if (data.widthCm !== undefined) updateFields.widthCm = String(data.widthCm);
      if (data.heightCm !== undefined) updateFields.heightCm = String(data.heightCm);
      if (data.depthCm !== undefined) updateFields.depthCm = data.depthCm ? String(data.depthCm) : null;
      if (data.price !== undefined) updateFields.price = data.price ? String(data.price) : null;
      if (data.currency !== undefined) updateFields.currency = data.currency;
      if (data.status !== undefined) updateFields.status = data.status;
      if (data.coverImageUrl !== undefined) updateFields.coverImageUrl = data.coverImageUrl;
      if (data.altText !== undefined) updateFields.altText = data.altText;
      if (data.isFeatured !== undefined) updateFields.isFeatured = data.isFeatured;
      if (data.seoTitle !== undefined) updateFields.seoTitle = data.seoTitle;
      if (data.seoDescription !== undefined) updateFields.seoDescription = data.seoDescription;

      await db
        .update(schema.artworks)
        .set(updateFields)
        .where(eq(schema.artworks.id, existing.id));

      // Handle Collection Association
      if (data.collectionSlug !== undefined || data.collectionId !== undefined) {
        let targetColId = data.collectionId;
        if (!targetColId && data.collectionSlug) {
          if (data.collectionSlug === "none" || data.collectionSlug === "") {
            await db
              .delete(schema.collectionArtworks)
              .where(eq(schema.collectionArtworks.artworkId, existing.id));
          } else {
            const col = await db
              .select({ id: schema.collections.id })
              .from(schema.collections)
              .where(eq(schema.collections.slug, data.collectionSlug))
              .limit(1);
            if (col.length > 0) targetColId = col[0].id;
          }
        }

        if (targetColId) {
          await db
            .delete(schema.collectionArtworks)
            .where(eq(schema.collectionArtworks.artworkId, existing.id));
          await db.insert(schema.collectionArtworks).values({
            collectionId: targetColId,
            artworkId: existing.id,
            displayOrder: 99,
          });
        }
      }

      if (data.arConfig) {
        const arFields: Record<string, any> = { updatedAt: new Date() };
        if (data.arConfig.isArEnabled !== undefined) arFields.isArEnabled = data.arConfig.isArEnabled;
        if (data.arConfig.defaultWidthCm !== undefined) arFields.defaultWidthCm = String(data.arConfig.defaultWidthCm);
        if (data.arConfig.defaultHeightCm !== undefined) arFields.defaultHeightCm = String(data.arConfig.defaultHeightCm);
        if (data.arConfig.defaultScale !== undefined) arFields.defaultScale = String(data.arConfig.defaultScale);
        if (data.arConfig.defaultRotation !== undefined) arFields.defaultRotation = String(data.arConfig.defaultRotation);
        if (data.arConfig.minScale !== undefined) arFields.minScale = String(data.arConfig.minScale);
        if (data.arConfig.maxScale !== undefined) arFields.maxScale = String(data.arConfig.maxScale);
        if (data.arConfig.placementMode !== undefined) arFields.placementMode = data.arConfig.placementMode;
        if (data.arConfig.frameEnabled !== undefined) arFields.frameEnabled = data.arConfig.frameEnabled;
        if (data.arConfig.frameType !== undefined) arFields.frameType = data.arConfig.frameType;
        if (data.arConfig.frameDepthCm !== undefined) arFields.frameDepthCm = String(data.arConfig.frameDepthCm);
        if (data.arConfig.frameWidthCm !== undefined) arFields.frameWidthCm = String(data.arConfig.frameWidthCm);
        if (data.arConfig.matColor !== undefined) arFields.matColor = data.arConfig.matColor;
        if (data.arConfig.arReadinessStatus !== undefined) arFields.arReadinessStatus = data.arConfig.arReadinessStatus;
        if (data.arConfig.arInstructions !== undefined) arFields.arInstructions = data.arConfig.arInstructions;

        await db
          .insert(schema.artworkAr)
          .values({
            artworkId: existing.id,
            isArEnabled: data.arConfig.isArEnabled ?? true,
            defaultWidthCm: String(data.arConfig.defaultWidthCm ?? existing.widthCm),
            defaultHeightCm: String(data.arConfig.defaultHeightCm ?? existing.heightCm),
            defaultScale: String(data.arConfig.defaultScale ?? 1.0),
            defaultRotation: String(data.arConfig.defaultRotation ?? 0.0),
            minScale: String(data.arConfig.minScale ?? 0.5),
            maxScale: String(data.arConfig.maxScale ?? 2.0),
            placementMode: data.arConfig.placementMode || "wall",
            frameEnabled: data.arConfig.frameEnabled ?? false,
            frameType: data.arConfig.frameType || "minimal_black",
            frameDepthCm: String(data.arConfig.frameDepthCm ?? 3.5),
            frameWidthCm: String(data.arConfig.frameWidthCm ?? 3.0),
            matColor: data.arConfig.matColor || "#FFFFFF",
            arReadinessStatus: data.arConfig.arReadinessStatus || "ready",
            arInstructions: data.arConfig.arInstructions || "Point camera at eye level on a flat wall.",
          })
          .onConflictDoUpdate({
            target: schema.artworkAr.artworkId,
            set: arFields,
          });
      }

      recordActivityLog("UPDATE_ARTWORK", "artwork", `Updated artwork '${data.title || existing.title}'`, existing.id);
      const updated = await getArtworkById(existing.id);
      if (updated) return updated;
      return existing;
    } else {
      const inserted = await db
        .insert(schema.artworks)
        .values({
          slug: data.slug || `artwork-${Date.now()}`,
          title: data.title || "Untitled",
          description: data.description || "",
          longDescription: data.longDescription || "",
          year: data.year || new Date().getFullYear(),
          medium: data.medium || "Oil on Canvas",
          widthCm: String(data.widthCm || 100),
          heightCm: String(data.heightCm || 80),
          depthCm: data.depthCm ? String(data.depthCm) : undefined,
          price: data.price ? String(data.price) : undefined,
          currency: data.currency || "USD",
          status: data.status || "draft",
          coverImageUrl: data.coverImageUrl || DEFAULT_VERIFIED_COVER,
          altText: data.altText || data.title || "Artwork",
          isFeatured: data.isFeatured || false,
          displayOrder: 99,
        })
        .returning({ id: schema.artworks.id });

      const newId = inserted[0]?.id;

      // Handle Collection Association on Create
      if (newId && (data.collectionSlug || data.collectionId)) {
        let targetColId = data.collectionId;
        if (!targetColId && data.collectionSlug && data.collectionSlug !== "none") {
          const col = await db
            .select({ id: schema.collections.id })
            .from(schema.collections)
            .where(eq(schema.collections.slug, data.collectionSlug))
            .limit(1);
          if (col.length > 0) targetColId = col[0].id;
        }
        if (targetColId) {
          await db.insert(schema.collectionArtworks).values({
            collectionId: targetColId,
            artworkId: newId,
            displayOrder: 99,
          });
        }
      }

      if (newId && data.arConfig) {
        await db.insert(schema.artworkAr).values({
          artworkId: newId,
          isArEnabled: data.arConfig.isArEnabled ?? true,
          defaultWidthCm: String(data.arConfig.defaultWidthCm ?? data.widthCm ?? 100),
          defaultHeightCm: String(data.arConfig.defaultHeightCm ?? data.heightCm ?? 80),
          defaultScale: String(data.arConfig.defaultScale ?? 1.0),
          defaultRotation: String(data.arConfig.defaultRotation ?? 0.0),
          minScale: String(data.arConfig.minScale ?? 0.5),
          maxScale: String(data.arConfig.maxScale ?? 2.0),
          placementMode: data.arConfig.placementMode || "wall",
          frameEnabled: data.arConfig.frameEnabled ?? false,
          frameType: data.arConfig.frameType || "minimal_black",
          frameDepthCm: String(data.arConfig.frameDepthCm ?? 3.5),
          frameWidthCm: String(data.arConfig.frameWidthCm ?? 3.0),
          matColor: data.arConfig.matColor || "#FFFFFF",
          arReadinessStatus: data.arConfig.arReadinessStatus || "ready",
          arInstructions: data.arConfig.arInstructions || "Point camera at eye level on a flat wall.",
        });
      }

      recordActivityLog("CREATE_ARTWORK", "artwork", `Created artwork '${data.title || "Untitled"}'`, newId);
      const created = await getArtworkById(newId);
      if (created) return created;
      throw new Error("Failed to retrieve created artwork");
    }
  } catch (e) {
    console.error("Database saveArtwork failed:", e);
    throw e;
  }
}

export async function archiveArtwork(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    const isIdUuid = isUuid(id);
    await db
      .update(schema.artworks)
      .set({ status: "archived", updatedAt: new Date() })
      .where(
        isIdUuid
          ? or(eq(schema.artworks.id, id), eq(schema.artworks.slug, id))
          : eq(schema.artworks.slug, id)
      );
    recordActivityLog("ARCHIVE_ARTWORK", "artwork", `Archived artwork ${id}`, id);
    return true;
  } catch (e) {
    console.error("Database archiveArtwork failed:", e);
    return false;
  }
}

export async function deleteArtwork(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    const isIdUuid = isUuid(id);
    const existing = await db
      .select({ id: schema.artworks.id, title: schema.artworks.title })
      .from(schema.artworks)
      .where(
        isIdUuid
          ? or(eq(schema.artworks.id, id), eq(schema.artworks.slug, id))
          : eq(schema.artworks.slug, id)
      )
      .limit(1);

    if (existing.length === 0) return false;
    const targetId = existing[0].id;
    const title = existing[0].title;

    await db.delete(schema.collectionArtworks).where(eq(schema.collectionArtworks.artworkId, targetId));
    await db.delete(schema.exhibitionArtworks).where(eq(schema.exhibitionArtworks.artworkId, targetId));
    await db.delete(schema.artworkImages).where(eq(schema.artworkImages.artworkId, targetId));
    await db.delete(schema.artworkAr).where(eq(schema.artworkAr.artworkId, targetId));
    await db
      .update(schema.inquiries)
      .set({ artworkId: null })
      .where(eq(schema.inquiries.artworkId, targetId));

    await db.delete(schema.artworks).where(eq(schema.artworks.id, targetId));

    recordActivityLog("DELETE_ARTWORK", "artwork", `Permanently deleted artwork "${title}" (${targetId})`, targetId);
    return true;
  } catch (e) {
    console.error("Database deleteArtwork failed:", e);
    return false;
  }
}

export async function getCollections(): Promise<MockCollection[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select()
      .from(schema.collections)
      .where(eq(schema.collections.isPublished, true))
      .orderBy(asc(schema.collections.displayOrder));

    const relations = await db
      .select({
        collectionId: schema.collectionArtworks.collectionId,
        artworkSlug: schema.artworks.slug,
      })
      .from(schema.collectionArtworks)
      .innerJoin(
        schema.artworks,
        eq(schema.artworks.id, schema.collectionArtworks.artworkId)
      )
      .orderBy(asc(schema.collectionArtworks.displayOrder));

    const slugsByCol = new Map<string, string[]>();
    for (const r of relations) {
      const arr = slugsByCol.get(r.collectionId) || [];
      arr.push(r.artworkSlug);
      slugsByCol.set(r.collectionId, arr);
    }

    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      curatorialStatement: r.curatorialStatement || "",
      coverImageUrl: r.coverImageUrl || DEFAULT_VERIFIED_COVER,
      isPublished: r.isPublished,
      displayOrder: r.displayOrder,
      artworkSlugs: slugsByCol.get(r.id) || [],
    }));
  } catch (e) {
    console.error("Database getCollections failed:", e);
    return [];
  }
}

export async function getAllCollectionsAdmin(): Promise<MockCollection[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select()
      .from(schema.collections)
      .orderBy(asc(schema.collections.displayOrder));

    const relations = await db
      .select({
        collectionId: schema.collectionArtworks.collectionId,
        artworkSlug: schema.artworks.slug,
      })
      .from(schema.collectionArtworks)
      .innerJoin(
        schema.artworks,
        eq(schema.artworks.id, schema.collectionArtworks.artworkId)
      )
      .orderBy(asc(schema.collectionArtworks.displayOrder));

    const slugsByCol = new Map<string, string[]>();
    for (const r of relations) {
      const arr = slugsByCol.get(r.collectionId) || [];
      arr.push(r.artworkSlug);
      slugsByCol.set(r.collectionId, arr);
    }

    return rows.map((r) => ({
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      curatorialStatement: r.curatorialStatement || "",
      coverImageUrl: r.coverImageUrl || DEFAULT_VERIFIED_COVER,
      isPublished: r.isPublished,
      displayOrder: r.displayOrder,
      artworkSlugs: slugsByCol.get(r.id) || [],
    }));
  } catch (e) {
    console.error("Database getAllCollectionsAdmin failed:", e);
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<MockCollection | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const rows = await db
      .select()
      .from(schema.collections)
      .where(eq(schema.collections.slug, slug))
      .limit(1);

    if (rows.length === 0) return null;

    const r = rows[0];
    const relations = await db
      .select({
        artworkSlug: schema.artworks.slug,
      })
      .from(schema.collectionArtworks)
      .innerJoin(
        schema.artworks,
        eq(schema.artworks.id, schema.collectionArtworks.artworkId)
      )
      .where(eq(schema.collectionArtworks.collectionId, r.id))
      .orderBy(asc(schema.collectionArtworks.displayOrder));

    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      curatorialStatement: r.curatorialStatement || "",
      coverImageUrl: r.coverImageUrl || DEFAULT_VERIFIED_COVER,
      isPublished: r.isPublished,
      displayOrder: r.displayOrder,
      artworkSlugs: relations.map((rel) => rel.artworkSlug),
    };
  } catch (e) {
    console.error("Database getCollectionBySlug failed:", e);
    return null;
  }
}

export async function getExhibitions(): Promise<MockExhibition[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select()
      .from(schema.exhibitions)
      .where(eq(schema.exhibitions.isPublished, true))
      .orderBy(asc(schema.exhibitions.displayOrder));

    const relations = await db
      .select({
        exhibitionId: schema.exhibitionArtworks.exhibitionId,
        artworkSlug: schema.artworks.slug,
      })
      .from(schema.exhibitionArtworks)
      .innerJoin(
        schema.artworks,
        eq(schema.artworks.id, schema.exhibitionArtworks.artworkId)
      )
      .orderBy(asc(schema.exhibitionArtworks.displayOrder));

    const slugsByExh = new Map<string, string[]>();
    for (const r of relations) {
      const arr = slugsByExh.get(r.exhibitionId) || [];
      arr.push(r.artworkSlug);
      slugsByExh.set(r.exhibitionId, arr);
    }

    return rows.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      subtitle: e.subtitle || "",
      description: e.description,
      curatorNote: e.curatorNote || "",
      location: e.location,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      status: e.status as any,
      coverImageUrl: e.coverImageUrl || DEFAULT_VERIFIED_COVER,
      isPublished: e.isPublished,
      displayOrder: e.displayOrder,
      artworkSlugs: slugsByExh.get(e.id) || [],
    }));
  } catch (e) {
    console.error("Database getExhibitions failed:", e);
    return [];
  }
}

export async function getAllExhibitionsAdmin(): Promise<MockExhibition[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select()
      .from(schema.exhibitions)
      .orderBy(asc(schema.exhibitions.displayOrder));

    const relations = await db
      .select({
        exhibitionId: schema.exhibitionArtworks.exhibitionId,
        artworkSlug: schema.artworks.slug,
      })
      .from(schema.exhibitionArtworks)
      .innerJoin(
        schema.artworks,
        eq(schema.artworks.id, schema.exhibitionArtworks.artworkId)
      )
      .orderBy(asc(schema.exhibitionArtworks.displayOrder));

    const slugsByExh = new Map<string, string[]>();
    for (const r of relations) {
      const arr = slugsByExh.get(r.exhibitionId) || [];
      arr.push(r.artworkSlug);
      slugsByExh.set(r.exhibitionId, arr);
    }

    return rows.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      subtitle: e.subtitle || "",
      description: e.description,
      curatorNote: e.curatorNote || "",
      location: e.location,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      status: e.status as any,
      coverImageUrl: e.coverImageUrl || DEFAULT_VERIFIED_COVER,
      isPublished: e.isPublished,
      displayOrder: e.displayOrder,
      artworkSlugs: slugsByExh.get(e.id) || [],
    }));
  } catch (e) {
    console.error("Database getAllExhibitionsAdmin failed:", e);
    return [];
  }
}

export async function getExhibitionBySlug(slug: string): Promise<MockExhibition | null> {
  const db = getDb();
  if (!db) return null;

  try {
    const rows = await db
      .select()
      .from(schema.exhibitions)
      .where(eq(schema.exhibitions.slug, slug))
      .limit(1);

    if (rows.length === 0) return null;

    const e = rows[0];
    const relations = await db
      .select({
        artworkSlug: schema.artworks.slug,
      })
      .from(schema.exhibitionArtworks)
      .innerJoin(
        schema.artworks,
        eq(schema.artworks.id, schema.exhibitionArtworks.artworkId)
      )
      .where(eq(schema.exhibitionArtworks.exhibitionId, e.id))
      .orderBy(asc(schema.exhibitionArtworks.displayOrder));

    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      subtitle: e.subtitle || "",
      description: e.description,
      curatorNote: e.curatorNote || "",
      location: e.location,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      status: e.status as any,
      coverImageUrl: e.coverImageUrl || DEFAULT_VERIFIED_COVER,
      isPublished: e.isPublished,
      displayOrder: e.displayOrder,
      artworkSlugs: relations.map((rel) => rel.artworkSlug),
    };
  } catch (e) {
    console.error("Database getExhibitionBySlug failed:", e);
    return null;
  }
}

export async function saveCollection(
  data: Partial<MockCollection> & { title?: string; artworkIds?: string[] }
): Promise<MockCollection> {
  const db = getDb();
  if (!db) throw new Error("Database connection unavailable");

  try {
    if (data.id) {
      // Update existing
      const updateFields: Record<string, any> = { updatedAt: new Date() };
      if (data.title !== undefined) updateFields.title = data.title;
      if (data.slug !== undefined) updateFields.slug = data.slug;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.curatorialStatement !== undefined) updateFields.curatorialStatement = data.curatorialStatement;
      if (data.coverImageUrl !== undefined) updateFields.coverImageUrl = data.coverImageUrl;
      if (data.isPublished !== undefined) updateFields.isPublished = data.isPublished;
      if (data.displayOrder !== undefined) updateFields.displayOrder = data.displayOrder;

      await db
        .update(schema.collections)
        .set(updateFields)
        .where(eq(schema.collections.id, data.id));

      if (data.artworkIds && Array.isArray(data.artworkIds)) {
        await updateCollectionArtworks(data.id, data.artworkIds);
      }

      recordActivityLog("UPDATE_COLLECTION", "collection", `Updated collection '${data.title || data.id}'`, data.id);
    } else {
      // Create new
      const slug =
        data.slug ||
        (data.title
          ? data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
          : `collection-${Date.now()}`);
      const inserted = await db
        .insert(schema.collections)
        .values({
          slug,
          title: data.title || "Untitled Collection",
          description: data.description || "",
          curatorialStatement: data.curatorialStatement || "",
          coverImageUrl: data.coverImageUrl || DEFAULT_VERIFIED_COVER,
          isPublished: data.isPublished ?? false,
          displayOrder: data.displayOrder ?? 99,
        })
        .returning({ id: schema.collections.id });

      data.id = inserted[0]?.id;

      if (data.id && data.artworkIds && Array.isArray(data.artworkIds)) {
        await updateCollectionArtworks(data.id, data.artworkIds);
      }

      recordActivityLog("CREATE_COLLECTION", "collection", `Created collection '${data.title || "Untitled"}'`, data.id);
    }

    // Refresh
    const rows = await db
      .select()
      .from(schema.collections)
      .where(eq(schema.collections.id, data.id!))
      .limit(1);

    if (rows.length === 0) throw new Error("Collection not found after save");

    const r = rows[0];
    const rels = await db
      .select({ artworkSlug: schema.artworks.slug })
      .from(schema.collectionArtworks)
      .innerJoin(schema.artworks, eq(schema.artworks.id, schema.collectionArtworks.artworkId))
      .where(eq(schema.collectionArtworks.collectionId, r.id))
      .orderBy(asc(schema.collectionArtworks.displayOrder));

    return {
      id: r.id,
      slug: r.slug,
      title: r.title,
      description: r.description,
      curatorialStatement: r.curatorialStatement || "",
      coverImageUrl: r.coverImageUrl || DEFAULT_VERIFIED_COVER,
      isPublished: r.isPublished,
      displayOrder: r.displayOrder,
      artworkSlugs: rels.map((rel) => rel.artworkSlug),
    };
  } catch (e) {
    console.error("Database saveCollection failed:", e);
    throw e;
  }
}

export async function deleteCollection(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    // Junction table rows cascade automatically due to FK onDelete: cascade
    await db.delete(schema.collections).where(eq(schema.collections.id, id));
    recordActivityLog("DELETE_COLLECTION", "collection", `Deleted collection ${id}`, id);
    return true;
  } catch (e) {
    console.error("Database deleteCollection failed:", e);
    return false;
  }
}

export async function updateCollectionArtworks(
  collectionId: string,
  artworkIds: string[]
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    // Remove existing assignments
    await db
      .delete(schema.collectionArtworks)
      .where(eq(schema.collectionArtworks.collectionId, collectionId));

    // Insert new assignments
    if (artworkIds.length > 0) {
      await db.insert(schema.collectionArtworks).values(
        artworkIds.map((artworkId, index) => ({
          collectionId,
          artworkId,
          displayOrder: index,
        }))
      );
    }

    recordActivityLog("UPDATE_COLLECTION_ARTWORKS", "collection", `Updated artwork assignments for collection ${collectionId}`, collectionId);
    return true;
  } catch (e) {
    console.error("Database updateCollectionArtworks failed:", e);
    return false;
  }
}

export async function saveExhibition(data: Partial<MockExhibition> & { title: string }): Promise<MockExhibition> {
  const db = getDb();
  if (!db) throw new Error("Database connection unavailable");

  try {
    if (data.id) {
      // Update existing
      const updateFields: Record<string, any> = { updatedAt: new Date() };
      if (data.title !== undefined) updateFields.title = data.title;
      if (data.slug !== undefined) updateFields.slug = data.slug;
      if (data.subtitle !== undefined) updateFields.subtitle = data.subtitle;
      if (data.description !== undefined) updateFields.description = data.description;
      if (data.curatorNote !== undefined) updateFields.curatorNote = data.curatorNote;
      if (data.location !== undefined) updateFields.location = data.location;
      if (data.startDate !== undefined) updateFields.startDate = new Date(data.startDate);
      if (data.endDate !== undefined) updateFields.endDate = new Date(data.endDate);
      if (data.status !== undefined) updateFields.status = data.status;
      if (data.coverImageUrl !== undefined) updateFields.coverImageUrl = data.coverImageUrl;
      if (data.isPublished !== undefined) updateFields.isPublished = data.isPublished;
      if (data.displayOrder !== undefined) updateFields.displayOrder = data.displayOrder;

      await db
        .update(schema.exhibitions)
        .set(updateFields)
        .where(eq(schema.exhibitions.id, data.id));

      recordActivityLog("UPDATE_EXHIBITION", "exhibition", `Updated exhibition '${data.title || data.id}'`, data.id);
    } else {
      // Create new
      const slug =
        data.slug ||
        (data.title
          ? data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "")
          : `exhibition-${Date.now()}`);
      const inserted = await db
        .insert(schema.exhibitions)
        .values({
          slug,
          title: data.title || "Untitled Exhibition",
          subtitle: data.subtitle || "",
          description: data.description || "",
          curatorNote: data.curatorNote || "",
          location: data.location || "Paris Contemporary Pavilion",
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 30 * 86400000),
          status: data.status || "upcoming",
          coverImageUrl: data.coverImageUrl || DEFAULT_VERIFIED_COVER,
          isPublished: data.isPublished ?? false,
          displayOrder: data.displayOrder ?? 99,
        })
        .returning({ id: schema.exhibitions.id });

      data.id = inserted[0]?.id;
      recordActivityLog("CREATE_EXHIBITION", "exhibition", `Created exhibition '${data.title || "Untitled"}'`, data.id);
    }

    // Refresh
    const rows = await db
      .select()
      .from(schema.exhibitions)
      .where(eq(schema.exhibitions.id, data.id!))
      .limit(1);

    if (rows.length === 0) throw new Error("Exhibition not found after save");

    const e = rows[0];
    const rels = await db
      .select({ artworkSlug: schema.artworks.slug })
      .from(schema.exhibitionArtworks)
      .innerJoin(schema.artworks, eq(schema.artworks.id, schema.exhibitionArtworks.artworkId))
      .where(eq(schema.exhibitionArtworks.exhibitionId, e.id))
      .orderBy(asc(schema.exhibitionArtworks.displayOrder));

    return {
      id: e.id,
      slug: e.slug,
      title: e.title,
      subtitle: e.subtitle || "",
      description: e.description,
      curatorNote: e.curatorNote || "",
      location: e.location,
      startDate: e.startDate.toISOString(),
      endDate: e.endDate.toISOString(),
      status: e.status as any,
      coverImageUrl: e.coverImageUrl || DEFAULT_VERIFIED_COVER,
      isPublished: e.isPublished,
      displayOrder: e.displayOrder,
      artworkSlugs: rels.map((rel) => rel.artworkSlug),
    };
  } catch (e) {
    console.error("Database saveExhibition failed:", e);
    throw e;
  }
}

export async function deleteExhibition(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    await db.delete(schema.exhibitions).where(eq(schema.exhibitions.id, id));
    recordActivityLog("DELETE_EXHIBITION", "exhibition", `Deleted exhibition ${id}`, id);
    return true;
  } catch (e) {
    console.error("Database deleteExhibition failed:", e);
    return false;
  }
}

export async function updateExhibitionArtworks(
  exhibitionId: string,
  artworkIds: string[]
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    await db
      .delete(schema.exhibitionArtworks)
      .where(eq(schema.exhibitionArtworks.exhibitionId, exhibitionId));

    if (artworkIds.length > 0) {
      await db.insert(schema.exhibitionArtworks).values(
        artworkIds.map((artworkId, index) => ({
          exhibitionId,
          artworkId,
          displayOrder: index,
        }))
      );
    }

    recordActivityLog("UPDATE_EXHIBITION_ARTWORKS", "exhibition", `Updated artwork assignments for exhibition ${exhibitionId}`, exhibitionId);
    return true;
  } catch (e) {
    console.error("Database updateExhibitionArtworks failed:", e);
    return false;
  }
}

export async function getHomepageSections(): Promise<MockHomepageSection[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select()
      .from(schema.homepageSections)
      .where(eq(schema.homepageSections.isEnabled, true))
      .orderBy(asc(schema.homepageSections.displayOrder));

    return rows.map((s) => ({
      id: s.id,
      sectionKey: s.sectionKey as any,
      title: s.title,
      subtitle: s.subtitle || "",
      contentJson: (s.contentJson as any) || {},
      isEnabled: s.isEnabled,
      displayOrder: s.displayOrder,
    }));
  } catch (e) {
    console.error("Database getHomepageSections failed:", e);
    return [];
  }
}

export async function getAllHomepageSectionsAdmin(): Promise<MockHomepageSection[]> {
  const db = getDb();
  if (!db) return INITIAL_HOMEPAGE_SECTIONS;

  try {
    const rows = await db
      .select()
      .from(schema.homepageSections)
      .orderBy(asc(schema.homepageSections.displayOrder));

    if (rows.length === 0) return INITIAL_HOMEPAGE_SECTIONS;

    return rows.map((s) => ({
      id: s.id,
      sectionKey: s.sectionKey as any,
      title: s.title,
      subtitle: s.subtitle || "",
      contentJson: (s.contentJson as any) || {},
      isEnabled: s.isEnabled,
      displayOrder: s.displayOrder,
    }));
  } catch (e) {
    console.error("Database getAllHomepageSectionsAdmin failed, using fallbacks:", e);
    return INITIAL_HOMEPAGE_SECTIONS;
  }
}

export async function updateHomepageSection(
  sectionKey: string,
  updates: Partial<MockHomepageSection>
): Promise<MockHomepageSection | null> {
  const db = getDb();
  if (!db) return null;

  try {
    await db
      .update(schema.homepageSections)
      .set({
        title: updates.title,
        subtitle: updates.subtitle,
        contentJson: updates.contentJson,
        isEnabled: updates.isEnabled,
        displayOrder: updates.displayOrder,
        updatedAt: new Date(),
      })
      .where(eq(schema.homepageSections.sectionKey, sectionKey));

    recordActivityLog("UPDATE_HOMEPAGE_SECTION", "homepage", `Updated ${sectionKey} section`);

    const updatedRows = await db
      .select()
      .from(schema.homepageSections)
      .where(eq(schema.homepageSections.sectionKey, sectionKey))
      .limit(1);

    if (updatedRows.length > 0) {
      const s = updatedRows[0];
      return {
        id: s.id,
        sectionKey: s.sectionKey as any,
        title: s.title,
        subtitle: s.subtitle || "",
        contentJson: (s.contentJson as any) || {},
        isEnabled: s.isEnabled,
        displayOrder: s.displayOrder,
      };
    }
    return null;
  } catch (e) {
    console.error("Database updateHomepageSection failed:", e);
    return null;
  }
}


export async function getSiteSettings(): Promise<SiteSettingsData> {
  const db = getDb();
  if (!db) {
    return DEFAULT_SITE_SETTINGS;
  }

  try {
    const rows = await db.select().from(schema.siteSettings).limit(1);
    if (rows.length > 0) {
      const s = rows[0];
      return {
        artistName: s.artistName || DEFAULT_SITE_SETTINGS.artistName,
        siteTitle: s.siteTitle || DEFAULT_SITE_SETTINGS.siteTitle,
        shortBrandName: s.shortBrandName || DEFAULT_SITE_SETTINGS.shortBrandName,
        tagline: s.tagline || DEFAULT_SITE_SETTINGS.tagline,
        logoUrl: s.logoUrl || "",
        faviconUrl: s.faviconUrl || "",
        bioSummary: s.bioSummary || DEFAULT_SITE_SETTINGS.bioSummary,
        statement: s.statement || DEFAULT_SITE_SETTINGS.statement,
        contactEmail: s.contactEmail || DEFAULT_SITE_SETTINGS.contactEmail,
        phone: s.phone || DEFAULT_SITE_SETTINGS.phone,
        whatsapp: s.whatsapp || DEFAULT_SITE_SETTINGS.whatsapp,
        location: s.location || DEFAULT_SITE_SETTINGS.location,
        address: s.address || DEFAULT_SITE_SETTINGS.address,
        city: s.city || DEFAULT_SITE_SETTINGS.city,
        country: s.country || DEFAULT_SITE_SETTINGS.country,
        businessHours: s.businessHours || DEFAULT_SITE_SETTINGS.businessHours,
        contactInstructions: s.contactInstructions || DEFAULT_SITE_SETTINGS.contactInstructions,
        socialLinks: (s.socialLinksJson as any) || DEFAULT_SITE_SETTINGS.socialLinks,
        announcementBar: (s.announcementBarJson as any) || DEFAULT_SITE_SETTINGS.announcementBar,
        headerConfig: (s.headerConfigJson as any) || DEFAULT_SITE_SETTINGS.headerConfig,
        navigationItems: Array.isArray(s.navigationItemsJson) && s.navigationItemsJson.length > 0
          ? (s.navigationItemsJson as any)
          : DEFAULT_SITE_SETTINGS.navigationItems,
        footerConfig: (s.footerConfigJson as any) || DEFAULT_SITE_SETTINGS.footerConfig,
        galleryPageConfig: (s.galleryPageConfigJson as any) || DEFAULT_SITE_SETTINGS.galleryPageConfig,
        collectionsPageConfig: (s.collectionsPageConfigJson as any) || DEFAULT_SITE_SETTINGS.collectionsPageConfig,
        exhibitionsPageConfig: (s.exhibitionsPageConfigJson as any) || DEFAULT_SITE_SETTINGS.exhibitionsPageConfig,
        aboutPageConfig: (s.aboutPageConfigJson as any) || DEFAULT_SITE_SETTINGS.aboutPageConfig,
        contactPageConfig: (s.contactPageConfigJson as any) || DEFAULT_SITE_SETTINGS.contactPageConfig,
        legalPages: (s.legalPagesJson as any) || DEFAULT_SITE_SETTINGS.legalPages,
        maintenanceMode: (s.maintenanceModeJson as any) || DEFAULT_SITE_SETTINGS.maintenanceMode,
        globalArDefaults: (s.globalArDefaultsJson as any) || DEFAULT_SITE_SETTINGS.globalArDefaults,
        copyrightText: s.copyrightText || DEFAULT_SITE_SETTINGS.copyrightText,
      };
    }
  } catch (e) {
    console.error("Database getSiteSettings failed, using fallbacks:", e);
  }

  return DEFAULT_SITE_SETTINGS;
}

export async function updateSiteSettings(settings: Partial<SiteSettingsData>): Promise<SiteSettingsData> {
  const db = getDb();
  if (!db) return { ...DEFAULT_SITE_SETTINGS, ...settings };

  try {
    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (settings.artistName !== undefined) updatePayload.artistName = settings.artistName;
    if (settings.siteTitle !== undefined) updatePayload.siteTitle = settings.siteTitle;
    if (settings.shortBrandName !== undefined) updatePayload.shortBrandName = settings.shortBrandName;
    if (settings.tagline !== undefined) updatePayload.tagline = settings.tagline;
    if (settings.logoUrl !== undefined) updatePayload.logoUrl = settings.logoUrl;
    if (settings.faviconUrl !== undefined) updatePayload.faviconUrl = settings.faviconUrl;
    if (settings.bioSummary !== undefined) updatePayload.bioSummary = settings.bioSummary;
    if (settings.statement !== undefined) updatePayload.statement = settings.statement;
    if (settings.contactEmail !== undefined) updatePayload.contactEmail = settings.contactEmail;
    if (settings.phone !== undefined) updatePayload.phone = settings.phone;
    if (settings.whatsapp !== undefined) updatePayload.whatsapp = settings.whatsapp;
    if (settings.location !== undefined) updatePayload.location = settings.location;
    if (settings.address !== undefined) updatePayload.address = settings.address;
    if (settings.city !== undefined) updatePayload.city = settings.city;
    if (settings.country !== undefined) updatePayload.country = settings.country;
    if (settings.businessHours !== undefined) updatePayload.businessHours = settings.businessHours;
    if (settings.contactInstructions !== undefined) updatePayload.contactInstructions = settings.contactInstructions;
    if (settings.socialLinks !== undefined) updatePayload.socialLinksJson = settings.socialLinks;
    if (settings.announcementBar !== undefined) updatePayload.announcementBarJson = settings.announcementBar;
    if (settings.headerConfig !== undefined) updatePayload.headerConfigJson = settings.headerConfig;
    if (settings.navigationItems !== undefined) updatePayload.navigationItemsJson = settings.navigationItems;
    if (settings.footerConfig !== undefined) updatePayload.footerConfigJson = settings.footerConfig;
    if (settings.galleryPageConfig !== undefined) updatePayload.galleryPageConfigJson = settings.galleryPageConfig;
    if (settings.collectionsPageConfig !== undefined) updatePayload.collectionsPageConfigJson = settings.collectionsPageConfig;
    if (settings.exhibitionsPageConfig !== undefined) updatePayload.exhibitionsPageConfigJson = settings.exhibitionsPageConfig;
    if (settings.aboutPageConfig !== undefined) updatePayload.aboutPageConfigJson = settings.aboutPageConfig;
    if (settings.contactPageConfig !== undefined) updatePayload.contactPageConfigJson = settings.contactPageConfig;
    if (settings.legalPages !== undefined) updatePayload.legalPagesJson = settings.legalPages;
    if (settings.maintenanceMode !== undefined) updatePayload.maintenanceModeJson = settings.maintenanceMode;
    if (settings.globalArDefaults !== undefined) updatePayload.globalArDefaultsJson = settings.globalArDefaults;
    if (settings.copyrightText !== undefined) updatePayload.copyrightText = settings.copyrightText;

    const existing = await db.select({ id: schema.siteSettings.id }).from(schema.siteSettings).limit(1);
    if (existing.length > 0) {
      await db.update(schema.siteSettings).set(updatePayload).where(eq(schema.siteSettings.id, existing[0].id));
    } else {
      await db.insert(schema.siteSettings).values({
        id: crypto.randomUUID(),
        ...updatePayload,
      });
    }
    recordActivityLog("UPDATE_SITE_SETTINGS", "settings", "Updated studio site settings and storefront CMS");
  } catch (e) {
    console.error("Database updateSiteSettings failed:", e);
  }

  return getSiteSettings();
}


export async function getThemeSettings(): Promise<ThemeSettingsData> {
  const db = getDb();
  if (!db) return DEFAULT_THEME_SETTINGS;

  try {
    const rows = await db.select().from(schema.themeSettings).limit(1);
    if (rows.length > 0) {
      const t = rows[0];
      return {
        primaryColor: t.primaryColor || DEFAULT_THEME_SETTINGS.primaryColor,
        accentColor: t.accentColor || DEFAULT_THEME_SETTINGS.accentColor,
        backgroundColor: t.backgroundColor || DEFAULT_THEME_SETTINGS.backgroundColor,
        foregroundColor: t.foregroundColor || DEFAULT_THEME_SETTINGS.foregroundColor,
        headingFont: t.headingFont || DEFAULT_THEME_SETTINGS.headingFont,
        bodyFont: t.bodyFont || DEFAULT_THEME_SETTINGS.bodyFont,
        borderRadius: t.borderRadius || DEFAULT_THEME_SETTINGS.borderRadius,
        containerWidth: t.containerWidth || DEFAULT_THEME_SETTINGS.containerWidth,
        animationLevel: (t.animationLevel as any) || DEFAULT_THEME_SETTINGS.animationLevel,
      };
    }
  } catch (e) {
    console.error("Database getThemeSettings failed:", e);
  }

  return DEFAULT_THEME_SETTINGS;
}

export async function updateThemeSettings(theme: Partial<ThemeSettingsData>): Promise<ThemeSettingsData> {
  const db = getDb();
  if (!db) return { ...DEFAULT_THEME_SETTINGS, ...theme };

  try {
    const existing = await db.select({ id: schema.themeSettings.id }).from(schema.themeSettings).limit(1);
    if (existing.length > 0) {
      await db
        .update(schema.themeSettings)
        .set({
          ...theme,
          updatedAt: new Date(),
        })
        .where(eq(schema.themeSettings.id, existing[0].id));
    } else {
      await db.insert(schema.themeSettings).values({
        primaryColor: theme.primaryColor || DEFAULT_THEME_SETTINGS.primaryColor,
        accentColor: theme.accentColor || DEFAULT_THEME_SETTINGS.accentColor,
        backgroundColor: theme.backgroundColor || DEFAULT_THEME_SETTINGS.backgroundColor,
        foregroundColor: theme.foregroundColor || DEFAULT_THEME_SETTINGS.foregroundColor,
        headingFont: theme.headingFont || DEFAULT_THEME_SETTINGS.headingFont,
        bodyFont: theme.bodyFont || DEFAULT_THEME_SETTINGS.bodyFont,
        borderRadius: theme.borderRadius || DEFAULT_THEME_SETTINGS.borderRadius,
        containerWidth: theme.containerWidth || DEFAULT_THEME_SETTINGS.containerWidth,
        animationLevel: theme.animationLevel || DEFAULT_THEME_SETTINGS.animationLevel,
      });
    }

    recordActivityLog("UPDATE_THEME_SETTINGS", "theme", `Updated design tokens and appearance`);
  } catch (e) {
    console.error("Database updateThemeSettings failed:", e);
  }

  return getThemeSettings();
}

export async function getInquiries(): Promise<MockInquiry[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select({
        inquiry: schema.inquiries,
        artworkTitle: schema.artworks.title,
      })
      .from(schema.inquiries)
      .leftJoin(schema.artworks, eq(schema.artworks.id, schema.inquiries.artworkId))
      .orderBy(desc(schema.inquiries.createdAt));

    // Return real inquiries directly from database. If zero, returns [].
    return rows.map((r) => ({
      id: r.inquiry.id,
      artworkId: r.inquiry.artworkId || undefined,
      artworkTitle: r.artworkTitle || undefined,
      name: r.inquiry.name,
      email: r.inquiry.email,
      phone: r.inquiry.phone || undefined,
      subject: r.inquiry.subject,
      message: r.inquiry.message,
      status: r.inquiry.status as any,
      createdAt: r.inquiry.createdAt.toISOString(),
    }));
  } catch (e) {
    console.error("Database getInquiries failed:", e);
    return [];
  }
}

export async function createInquiry(data: {
  userId?: string;
  artworkId?: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}): Promise<MockInquiry> {
  const db = getDb();
  if (!db) throw new Error("Database connection unavailable");

  try {
    let targetUserId = data.userId;

    if (!targetUserId || !isUuid(targetUserId)) {
      const found = await db
        .select({ id: schema.users.id })
        .from(schema.users)
        .where(eq(schema.users.email, data.email.toLowerCase().trim()))
        .limit(1);

      if (found.length > 0) {
        targetUserId = found[0].id;
      } else {
        const fallbackUser = await db
          .select({ id: schema.users.id })
          .from(schema.users)
          .limit(1);
        if (fallbackUser.length > 0) {
          targetUserId = fallbackUser[0].id;
        } else {
          throw new Error("No user registered in database to attach inquiry to");
        }
      }
    }

    const inserted = await db
      .insert(schema.inquiries)
      .values({
        userId: targetUserId,
        artworkId: data.artworkId && isUuid(data.artworkId) ? data.artworkId : undefined,
        name: data.name,
        email: data.email,
        phone: data.phone,
        subject: data.subject || "Artwork Inquiry",
        message: data.message,
        status: "new",
      })
      .returning();

    const inq = inserted[0];
    recordActivityLog("CREATE_INQUIRY", "inquiry", `Inquiry received from ${data.name}`, inq?.id);

    return {
      id: inq.id,
      artworkId: inq.artworkId || undefined,
      artworkTitle: undefined,
      name: inq.name,
      email: inq.email,
      phone: inq.phone || undefined,
      subject: inq.subject,
      message: inq.message,
      status: inq.status as any,
      createdAt: inq.createdAt.toISOString(),
    };
  } catch (e) {
    console.error("Database createInquiry failed:", e);
    throw e;
  }
}

export async function updateInquiryStatus(
  id: string,
  status: "new" | "read" | "replied" | "closed"
): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    await db
      .update(schema.inquiries)
      .set({ status, updatedAt: new Date() })
      .where(eq(schema.inquiries.id, id));

    recordActivityLog(
      "UPDATE_INQUIRY_STATUS",
      "inquiry",
      `Updated inquiry to '${status}'`,
      id
    );
    return true;
  } catch (e) {
    console.error("Database updateInquiryStatus failed:", e);
    return false;
  }
}

export async function getMediaItems(): Promise<MediaRecord[]> {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select()
      .from(schema.media)
      .orderBy(desc(schema.media.createdAt));

    return rows.map((m) => ({
      id: m.id,
      fileName: m.fileName,
      fileUrl: m.fileUrl,
      fileKey: m.fileKey,
      mimeType: m.mimeType,
      dimensions: `${m.width} × ${m.height} px`,
      byteSize: `${(m.byteSize / (1024 * 1024)).toFixed(1)} MB`,
      uploadedAt: new Date(m.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }),
      provider: m.provider as "imagekit" | "cloudflare",
      migrationStatus: m.migrationStatus,
    }));
  } catch (e) {
    console.error("Database getMediaItems failed:", e);
    return [];
  }
}

/**
 * Retrieve the full raw media row for provider-level deletion.
 * Returns provider, providerAssetId, fileKey, variantsJson, etc.
 */
export async function getMediaItemRaw(id: string) {
  const db = getDb();
  if (!db) return null;

  try {
    const rows = await db
      .select()
      .from(schema.media)
      .where(eq(schema.media.id, id))
      .limit(1);
    return rows[0] || null;
  } catch (e) {
    console.error("Database getMediaItemRaw failed:", e);
    return null;
  }
}

export async function deleteMediaItem(id: string): Promise<boolean> {
  const db = getDb();
  if (!db) return false;

  try {
    await db.delete(schema.media).where(eq(schema.media.id, id));
    recordActivityLog("DELETE_MEDIA", "media", `Deleted media asset ${id}`, id);
    return true;
  } catch (e) {
    console.error("Database deleteMediaItem failed:", e);
    return false;
  }
}

export async function getActivityLogs() {
  const db = getDb();
  if (!db) return [];

  try {
    const rows = await db
      .select()
      .from(schema.activityLogs)
      .orderBy(desc(schema.activityLogs.createdAt))
      .limit(50);

    return rows.map((l) => ({
      id: l.id,
      action: l.action,
      entityType: l.entityType,
      entityId: l.entityId || undefined,
      description: l.description,
      createdAt: l.createdAt.toISOString(),
    }));
  } catch (e) {
    console.error("Database getActivityLogs failed:", e);
    return [];
  }
}

export function recordActivityLog(
  action: string,
  entityType: string,
  description: string,
  entityId?: string
) {
  const db = getDb();
  if (db) {
    db.insert(schema.activityLogs)
      .values({
        action,
        entityType,
        entityId,
        description,
      })
      .catch((e) => console.warn("Failed to insert activity log to DB:", e));
  }
}
