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

export interface SiteSettingsData {
  artistName: string;
  siteTitle: string;
  shortBrandName: string;
  tagline: string;
  logoUrl?: string;
  faviconUrl?: string;
  bioSummary?: string;
  statement?: string;
  contactEmail: string;
  phone?: string;
  whatsapp?: string;
  location: string;
  address?: string;
  city?: string;
  country?: string;
  businessHours?: string;
  contactInstructions?: string;
  socialLinks: {
    instagram?: string;
    twitter?: string;
    linkedin?: string;
    artsy?: string;
    facebook?: string;
    pinterest?: string;
    youtube?: string;
  };
  announcementBar: {
    isEnabled: boolean;
    message: string;
    link?: string;
    linkLabel?: string;
    bg?: string;
    textColor?: string;
    dismissible?: boolean;
  };
  headerConfig: {
    logoType: "text" | "image";
    logoText?: string;
    logoUrl?: string;
    style: "transparent" | "solid" | "sticky";
    showCta: boolean;
    ctaLabel?: string;
    ctaUrl?: string;
  };
  navigationItems: Array<{
    id: string;
    label: string;
    href: string;
    isEnabled: boolean;
    order: number;
    openInNewTab?: boolean;
  }>;
  footerConfig: {
    description?: string;
    columns: Array<{
      title: string;
      links: Array<{ label: string; href: string }>;
    }>;
    contactText?: string;
    copyrightText?: string;
    showNewsletterCta?: boolean;
  };
  galleryPageConfig: {
    title?: string;
    subtitle?: string;
    description?: string;
    coverImageUrl?: string;
    defaultLayout: "grid" | "masonry" | "editorial";
    enabledFilters: {
      medium: boolean;
      price: boolean;
      year: boolean;
      availability: boolean;
      collection: boolean;
    };
    defaultSort: string;
  };
  collectionsPageConfig: {
    title?: string;
    subtitle?: string;
    description?: string;
    coverImageUrl?: string;
    eyebrow?: string;
  };
  exhibitionsPageConfig: {
    title?: string;
    subtitle?: string;
    description?: string;
    coverImageUrl?: string;
    eyebrow?: string;
  };
  aboutPageConfig: {
    intro?: string;
    bio?: string;
    artistImageUrl?: string;
    story?: string;
    philosophy?: string;
    process?: string;
    quote?: string;
    exhibitions?: Array<{ year: string; title: string; location: string }>;
    achievements?: string[];
    ctaText?: string;
    ctaUrl?: string;
  };
  contactPageConfig: {
    title?: string;
    description?: string;
    recipientEmail?: string;
    officeAddress?: string;
    openingHours?: string;
    contactInstructions?: string;
    formFields: {
      name: boolean;
      email: boolean;
      phone: boolean;
      message: boolean;
      artworkContext: boolean;
    };
    successMessage?: string;
  };
  legalPages: {
    privacyPolicy?: string;
    termsOfService?: string;
    cookiePolicy?: string;
    refundPolicy?: string;
    shippingPolicy?: string;
  };
  maintenanceMode: {
    isEnabled: boolean;
    title?: string;
    message?: string;
    expectedReturn?: string;
  };
  globalArDefaults: {
    defaultFrame: string;
    defaultScale: number;
    defaultPlacement: "wall" | "floor";
    defaultInstructions?: string;
    ctaLabel?: string;
    fallbackMessage?: string;
  };
  copyrightText: string;
}

const DEFAULT_NAVIGATION_ITEMS = [
  { id: "nav-gallery", label: "Gallery", href: "/gallery", isEnabled: true, order: 1 },
  { id: "nav-collections", label: "Collections", href: "/collections", isEnabled: true, order: 2 },
  { id: "nav-exhibitions", label: "Exhibitions", href: "/exhibitions", isEnabled: true, order: 3 },
  { id: "nav-about", label: "About", href: "/about", isEnabled: true, order: 4 },
  { id: "nav-contact", label: "Contact", href: "/contact", isEnabled: true, order: 5 },
];

const DEFAULT_SITE_SETTINGS: SiteSettingsData = {
  artistName: "Elena Vance",
  siteTitle: "L'Atelier Lumineux",
  shortBrandName: "L'Atelier",
  tagline: "Contemporary Fine Art Studio & WebAR Gallery",
  logoUrl: "",
  faviconUrl: "",
  bioSummary: "Contemporary fine artist exploring oceanic silence and mineral materiality.",
  statement: "A painting is an alteration of the atmospheric silence within a room.",
  contactEmail: "curator@latelier-lumineux.art",
  phone: "+33 1 42 68 55 00",
  whatsapp: "+33 6 12 34 56 78",
  location: "Paris & Brittany, France",
  address: "14 Rue de Beaune, 7th Arrondissement",
  city: "Paris",
  country: "France",
  businessHours: "Monday – Saturday: 10:00 – 19:00 (By Appointment)",
  contactInstructions: "For private acquisitions, curatorial loan requests, and press access, please correspond using our liaison desk.",
  socialLinks: {
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    linkedin: "https://linkedin.com",
    artsy: "https://artsy.net",
  },
  announcementBar: {
    isEnabled: true,
    message: "Spring 2026 Retrospective: New lapis lazuli originals now available for private acquisition.",
    link: "/gallery",
    linkLabel: "Explore Catalogue",
    bg: "#18191e",
    textColor: "#d1a86e",
    dismissible: true,
  },
  headerConfig: {
    logoType: "text",
    logoText: "L'Atelier Lumineux",
    logoUrl: "",
    style: "transparent",
    showCta: true,
    ctaLabel: "Inquire",
    ctaUrl: "/contact",
  },
  navigationItems: DEFAULT_NAVIGATION_ITEMS,
  footerConfig: {
    description: "The independent studio and private gallery of contemporary artist Elena Vance. Dedicated to exploring lapis lazuli glazes, geological materiality, and true-scale spatial WebAR curation.",
    columns: [
      {
        title: "Explore",
        links: [
          { label: "All Artworks", href: "/gallery" },
          { label: "Curated Series", href: "/collections" },
          { label: "Exhibitions", href: "/exhibitions" },
          { label: "Artist Monologue & CV", href: "/about" },
          { label: "Acquisitions & Press", href: "/contact" },
        ],
      },
      {
        title: "Legal & Studio",
        links: [
          { label: "Privacy Policy", href: "/privacy" },
          { label: "Terms of Acquisition", href: "/terms" },
          { label: "Collector Inquiries", href: "/contact" },
        ],
      },
    ],
    contactText: "curator@latelier-lumineux.art",
    copyrightText: "© 2026 Elena Vance Studio. All rights reserved.",
    showNewsletterCta: true,
  },
  galleryPageConfig: {
    title: "Original Canvases & Pigments",
    subtitle: "The Studio Catalogue",
    description: "Each painting is an original piece created using natural mineral pigments, French lapis lazuli glazes, and raw Belgian linen. Inquire for provenance or launch the 1:1 scale WebAR viewer.",
    coverImageUrl: "",
    defaultLayout: "grid",
    enabledFilters: {
      medium: true,
      price: true,
      year: true,
      availability: true,
      collection: true,
    },
    defaultSort: "featured",
  },
  collectionsPageConfig: {
    title: "Curated Series",
    subtitle: "Thematic Bodies of Work",
    description: "Elena Vance groups her artistic inquiries into multi-year cycles. Each series represents a focused exploration of specific pigments, geological binders, and spatial tensions.",
    coverImageUrl: "",
    eyebrow: "Thematic Bodies of Work",
  },
  exhibitionsPageConfig: {
    title: "Exhibitions",
    subtitle: "Public & Museum History",
    description: "Chronological record of curated solo exhibitions, biennale participations, and institutional showcases across Paris, New York, London, and Tokyo.",
    coverImageUrl: "",
    eyebrow: "Public & Museum History",
  },
  aboutPageConfig: {
    intro: "Biography & Studio Practice",
    bio: "Elena Vance is a contemporary fine artist whose paintings investigate the physics of optical depth, geological materiality, and oceanic stillness. Combining archaic mineral pigments—chiefly Afghan lapis lazuli and Roman pozzolana—with multi-layered stand-oil glazes on raw Belgian linen.",
    artistImageUrl: "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490",
    story: "Her studio practice resists the rapid consumption of images. Canvases are frequently held in progress across several seasons, receiving up to twenty gossamer layers of translucent stand-oil glaze.",
    philosophy: "A painting is not merely a depiction; it is an alteration of the atmospheric stillness and light acoustics within a room.",
    process: "Pure powdered lapis lazuli, crushed slate, cold-pressed walnut oil, and Belgian flax linen.",
    quote: "Light does not strike the surface; it penetrates the mineral stratums and is reflected from within.",
    exhibitions: [
      { year: "2026", title: "Luminous Stillness Retrospective", location: "Fondation d'Art Contemporain, Paris" },
      { year: "2025", title: "Mineral Stratum & Oceanic Silence", location: "Galerie Pompéi, Geneva" },
      { year: "2024", title: "The Blue Horizon: Spatial Canvases", location: "Chelsea Arts Pavilion, New York" },
    ],
    achievements: [
      "Lauréate du Prix Jean-François Millet pour la Peinture Contemporaine (2024)",
      "Permanent collection acquisition: Fondation d'Art Contemporain, Geneva",
      "ADAGP France Certified Contemporary Master (Registration #89421)",
    ],
    ctaText: "Contact Curatorial Office",
    ctaUrl: "/contact",
  },
  contactPageConfig: {
    title: "Inquiries & Acquisitions",
    description: "For private acquisitions, curatorial loan requests, and press access, please correspond using our studio liaison desk.",
    recipientEmail: "curator@latelier-lumineux.art",
    officeAddress: "14 Rue de Beaune, 7th Arrondissement, 75007 Paris, France",
    openingHours: "Monday – Saturday: 10:00 – 19:00 (By Appointment)",
    contactInstructions: "Every acquisition is accompanied by a signed Certificate of Authenticity and custom museum-grade crating.",
    formFields: {
      name: true,
      email: true,
      phone: true,
      message: true,
      artworkContext: true,
    },
    successMessage: "Thank you for your correspondence. The curatorial studio office will review your inquiry and respond within one business day.",
  },
  legalPages: {
    privacyPolicy: "We respect your collector privacy. Personal data submitted through inquiries or account registration is encrypted, never sold, and used solely for private studio correspondence, provenance records, and authenticated certificate delivery.",
    termsOfService: "All artworks displayed on this platform are original copyright-protected creations of Elena Vance. Authenticated certificates of authenticity are registered with ADAGP France upon completion of acquisition.",
    cookiePolicy: "This studio uses essential session cookies for collector authentication and anonymous telemetry to evaluate exhibition interest and true-scale AR room sessions. Camera data used in AR never leaves your local device.",
    refundPolicy: "Private collection acquisitions include a 14-day inspection period upon white-glove crated delivery. Inquiries regarding condition reports and international transit insurance are handled directly by the curatorial office.",
    shippingPolicy: "International museum-grade crating and climate-controlled freight are coordinated through specialized fine art logistics couriers (Crozier / Hasenkamp).",
  },
  maintenanceMode: {
    isEnabled: false,
    title: "Studio Under Curation",
    message: "L'Atelier Lumineux is currently undergoing curatorial updates for an upcoming retrospective exhibition. The digital gallery will resume normal visitor access shortly.",
    expectedReturn: "Returning Today at 18:00 CET",
  },
  globalArDefaults: {
    defaultFrame: "minimal_black",
    defaultScale: 1.0,
    defaultPlacement: "wall",
    defaultInstructions: "Point camera at a well-lit wall surface. Tap to position the canvas at true 1:1 physical scale.",
    ctaLabel: "View in Your Space",
    fallbackMessage: "AR requires a WebXR or camera-enabled mobile device. You can explore true-scale dimensions and virtual room views directly above.",
  },
  copyrightText: "© 2026 Elena Vance Studio. All rights reserved.",
};

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

    await db.update(schema.siteSettings).set(updatePayload);
    recordActivityLog("UPDATE_SITE_SETTINGS", "settings", "Updated studio site settings and storefront CMS");
  } catch (e) {
    console.error("Database updateSiteSettings failed:", e);
  }

  return getSiteSettings();
}

export interface ThemeSettingsData {
  primaryColor: string;
  accentColor: string;
  backgroundColor: string;
  foregroundColor: string;
  headingFont: string;
  bodyFont: string;
  borderRadius: string;
  containerWidth: string;
  animationLevel: "minimal" | "standard" | "cinematic";
}

const DEFAULT_THEME_SETTINGS: ThemeSettingsData = {
  primaryColor: "#d1a86e",
  accentColor: "#e2c18d",
  backgroundColor: "#0d0e12",
  foregroundColor: "#f4f4f6",
  headingFont: "Playfair Display",
  bodyFont: "Plus Jakarta Sans",
  borderRadius: "0.375rem",
  containerWidth: "1440px",
  animationLevel: "cinematic",
};

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
