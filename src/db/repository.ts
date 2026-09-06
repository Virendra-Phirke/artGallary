import { getDb, schema } from "./index";
import { eq, desc, asc, and, or, sql } from "drizzle-orm";
import {
  MockArtwork,
  MockCollection,
  MockExhibition,
  MockHomepageSection,
  MockInquiry,
} from "./mockData";

export type { MockArtwork, MockCollection, MockExhibition, MockHomepageSection, MockInquiry };

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
  if (!db) return [];

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

    let list = results.map((r) =>
      mapDbArtwork(r.artwork, r.ar, {
        collectionSlug: r.collectionSlug || undefined,
        collectionName: r.collectionName || undefined,
      })
    );

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
  } catch (e) {
    console.error("Database getArtworks failed:", e);
    return [];
  }
}

export async function getAllArtworksAdmin(): Promise<MockArtwork[]> {
  const db = getDb();
  if (!db) return [];

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

    return results.map((r) =>
      mapDbArtwork(r.artwork, r.ar, {
        collectionSlug: r.collectionSlug || undefined,
        collectionName: r.collectionName || undefined,
      })
    );
  } catch (e) {
    console.error("Database getAllArtworksAdmin failed:", e);
    return [];
  }
}

export async function getArtworkBySlug(slug: string): Promise<MockArtwork | null> {
  const db = getDb();
  if (!db) return null;

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

    if (results.length === 0) return null;

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
    console.error("Database getArtworkBySlug failed:", e);
    return null;
  }
}

export async function getArtworkById(id: string): Promise<MockArtwork | null> {
  const db = getDb();
  if (!db) return null;

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

    if (results.length === 0) return null;

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
    console.error("Database getArtworkById failed:", e);
    return null;
  }
}

export async function saveArtwork(data: Partial<MockArtwork>): Promise<MockArtwork> {
  const db = getDb();
  if (!db) throw new Error("Database connection unavailable");

  try {
    const existing = await getArtworkById(data.id || data.slug || "");
    if (existing) {
      await db
        .update(schema.artworks)
        .set({
          title: data.title,
          slug: data.slug,
          description: data.description,
          longDescription: data.longDescription,
          year: data.year,
          medium: data.medium,
          widthCm: data.widthCm ? String(data.widthCm) : undefined,
          heightCm: data.heightCm ? String(data.heightCm) : undefined,
          depthCm: data.depthCm ? String(data.depthCm) : undefined,
          price: data.price ? String(data.price) : undefined,
          currency: data.currency,
          status: data.status,
          coverImageUrl: data.coverImageUrl,
          altText: data.altText,
          isFeatured: data.isFeatured,
          updatedAt: new Date(),
        })
        .where(eq(schema.artworks.id, existing.id));

      if (data.arConfig) {
        await db
          .insert(schema.artworkAr)
          .values({
            artworkId: existing.id,
            isArEnabled: data.arConfig.isArEnabled,
            defaultWidthCm: String(data.arConfig.defaultWidthCm),
            defaultHeightCm: String(data.arConfig.defaultHeightCm),
            defaultScale: String(data.arConfig.defaultScale ?? 1.0),
            defaultRotation: String(data.arConfig.defaultRotation ?? 0.0),
            minScale: String(data.arConfig.minScale ?? 0.5),
            maxScale: String(data.arConfig.maxScale ?? 2.0),
            placementMode: data.arConfig.placementMode || "wall",
            frameEnabled: data.arConfig.frameEnabled,
            frameType: data.arConfig.frameType,
            frameDepthCm: String(data.arConfig.frameDepthCm),
            frameWidthCm: String(data.arConfig.frameWidthCm),
            matColor: data.arConfig.matColor,
            arReadinessStatus: data.arConfig.arReadinessStatus,
            arInstructions: data.arConfig.arInstructions,
          })
          .onConflictDoUpdate({
            target: schema.artworkAr.artworkId,
            set: {
              isArEnabled: data.arConfig.isArEnabled,
              defaultWidthCm: String(data.arConfig.defaultWidthCm),
              defaultHeightCm: String(data.arConfig.defaultHeightCm),
              defaultScale: String(data.arConfig.defaultScale ?? 1.0),
              defaultRotation: String(data.arConfig.defaultRotation ?? 0.0),
              minScale: String(data.arConfig.minScale ?? 0.5),
              maxScale: String(data.arConfig.maxScale ?? 2.0),
              placementMode: data.arConfig.placementMode || "wall",
              frameEnabled: data.arConfig.frameEnabled,
              frameType: data.arConfig.frameType,
              frameDepthCm: String(data.arConfig.frameDepthCm),
              frameWidthCm: String(data.arConfig.frameWidthCm),
              matColor: data.arConfig.matColor,
              arReadinessStatus: data.arConfig.arReadinessStatus,
              arInstructions: data.arConfig.arInstructions,
              updatedAt: new Date(),
            },
          });
      }

      recordActivityLog("UPDATE_ARTWORK", "artwork", `Updated artwork '${data.title}'`, existing.id);
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
      if (newId && data.arConfig) {
        await db.insert(schema.artworkAr).values({
          artworkId: newId,
          isArEnabled: data.arConfig.isArEnabled,
          defaultWidthCm: String(data.arConfig.defaultWidthCm),
          defaultHeightCm: String(data.arConfig.defaultHeightCm),
          defaultScale: String(data.arConfig.defaultScale ?? 1.0),
          defaultRotation: String(data.arConfig.defaultRotation ?? 0.0),
          minScale: String(data.arConfig.minScale ?? 0.5),
          maxScale: String(data.arConfig.maxScale ?? 2.0),
          placementMode: data.arConfig.placementMode || "wall",
          frameEnabled: data.arConfig.frameEnabled,
          frameType: data.arConfig.frameType,
          frameDepthCm: String(data.arConfig.frameDepthCm),
          frameWidthCm: String(data.arConfig.frameWidthCm),
          matColor: data.arConfig.matColor,
          arReadinessStatus: data.arConfig.arReadinessStatus,
          arInstructions: data.arConfig.arInstructions,
        });
      }

      recordActivityLog("CREATE_ARTWORK", "artwork", `Created artwork '${data.title}'`, newId);
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

export async function saveCollection(data: Partial<MockCollection> & { title: string }): Promise<MockCollection> {
  const db = getDb();
  if (!db) throw new Error("Database connection unavailable");

  try {
    if (data.id) {
      // Update existing
      await db
        .update(schema.collections)
        .set({
          title: data.title,
          slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
          description: data.description || "",
          curatorialStatement: data.curatorialStatement,
          coverImageUrl: data.coverImageUrl,
          isPublished: data.isPublished,
          displayOrder: data.displayOrder,
          updatedAt: new Date(),
        })
        .where(eq(schema.collections.id, data.id));

      recordActivityLog("UPDATE_COLLECTION", "collection", `Updated collection '${data.title}'`, data.id);
    } else {
      // Create new
      const slug = data.slug || data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      const inserted = await db
        .insert(schema.collections)
        .values({
          slug,
          title: data.title,
          description: data.description || "",
          curatorialStatement: data.curatorialStatement || "",
          coverImageUrl: data.coverImageUrl,
          isPublished: data.isPublished ?? false,
          displayOrder: data.displayOrder ?? 99,
        })
        .returning({ id: schema.collections.id });

      data.id = inserted[0]?.id;
      recordActivityLog("CREATE_COLLECTION", "collection", `Created collection '${data.title}'`, data.id);
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
      await db
        .update(schema.exhibitions)
        .set({
          title: data.title,
          slug: data.slug || data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, ""),
          subtitle: data.subtitle,
          description: data.description || "",
          curatorNote: data.curatorNote,
          location: data.location || "",
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : new Date(),
          status: data.status || "upcoming",
          coverImageUrl: data.coverImageUrl,
          isPublished: data.isPublished,
          displayOrder: data.displayOrder,
          updatedAt: new Date(),
        })
        .where(eq(schema.exhibitions.id, data.id));

      recordActivityLog("UPDATE_EXHIBITION", "exhibition", `Updated exhibition '${data.title}'`, data.id);
    } else {
      // Create new
      const slug = data.slug || data.title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
      const inserted = await db
        .insert(schema.exhibitions)
        .values({
          slug,
          title: data.title,
          subtitle: data.subtitle || "",
          description: data.description || "",
          curatorNote: data.curatorNote || "",
          location: data.location || "",
          startDate: data.startDate ? new Date(data.startDate) : new Date(),
          endDate: data.endDate ? new Date(data.endDate) : new Date(),
          status: data.status || "upcoming",
          coverImageUrl: data.coverImageUrl,
          isPublished: data.isPublished ?? false,
          displayOrder: data.displayOrder ?? 99,
        })
        .returning({ id: schema.exhibitions.id });

      data.id = inserted[0]?.id;
      recordActivityLog("CREATE_EXHIBITION", "exhibition", `Created exhibition '${data.title}'`, data.id);
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
  if (!db) return [];

  try {
    const rows = await db
      .select()
      .from(schema.homepageSections)
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
    console.error("Database getAllHomepageSectionsAdmin failed:", e);
    return [];
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

export async function getSiteSettings() {
  const db = getDb();
  if (!db) {
    return {
      artistName: "Elena Vance",
      siteTitle: "Elena Vance — Contemporary Fine Art Studio",
      tagline: "Fine Art Paintings & Spatial Explorations",
      bioSummary: "Contemporary fine artist exploring oceanic silence and mineral materiality.",
      statement: "A painting is an alteration of the atmospheric silence within a room.",
      contactEmail: "studio@elenavance.art",
      phone: "+33 1 42 68 55 00",
      location: "Paris & Brittany, France",
      socialLinks: {},
      copyrightText: "© 2026 Elena Vance Studio. All rights reserved.",
    };
  }

  try {
    const rows = await db.select().from(schema.siteSettings).limit(1);
    if (rows.length > 0) {
      const s = rows[0];
      return {
        artistName: s.artistName,
        siteTitle: s.siteTitle,
        tagline: s.tagline || "",
        bioSummary: s.bioSummary,
        statement: s.statement || "",
        contactEmail: s.contactEmail,
        phone: s.phone || "",
        location: s.location || "",
        socialLinks: (s.socialLinksJson as any) || {},
        copyrightText: s.copyrightText || "",
      };
    }
  } catch (e) {
    console.error("Database getSiteSettings failed:", e);
  }

  return {
    artistName: "Elena Vance",
    siteTitle: "Elena Vance — Contemporary Fine Art Studio",
    tagline: "Fine Art Paintings & Spatial Explorations",
    bioSummary: "Contemporary fine artist exploring oceanic silence and mineral materiality.",
    statement: "A painting is an alteration of the atmospheric silence within a room.",
    contactEmail: "studio@elenavance.art",
    phone: "+33 1 42 68 55 00",
    location: "Paris & Brittany, France",
    socialLinks: {},
    copyrightText: "© 2026 Elena Vance Studio. All rights reserved.",
  };
}

export async function updateSiteSettings(settings: Partial<Awaited<ReturnType<typeof getSiteSettings>>>) {
  const db = getDb();
  if (!db) return settings;

  try {
    await db
      .update(schema.siteSettings)
      .set({
        artistName: settings.artistName,
        siteTitle: settings.siteTitle,
        tagline: settings.tagline,
        bioSummary: settings.bioSummary,
        statement: settings.statement,
        contactEmail: settings.contactEmail,
        phone: settings.phone,
        location: settings.location,
        socialLinksJson: settings.socialLinks,
        copyrightText: settings.copyrightText,
        updatedAt: new Date(),
      });
    recordActivityLog("UPDATE_SITE_SETTINGS", "settings", "Updated studio site settings");
  } catch (e) {
    console.error("Database updateSiteSettings failed:", e);
  }

  return getSiteSettings();
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
