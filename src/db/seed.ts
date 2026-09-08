import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getDb, schema } from "./index";
import {
  INITIAL_ARTWORKS,
  INITIAL_COLLECTIONS,
  INITIAL_EXHIBITIONS,
  INITIAL_HOMEPAGE_SECTIONS,
  INITIAL_SITE_SETTINGS,
} from "./mockData";

async function runSeed() {
  console.log("Starting database seed...");
  const db = getDb();

  if (!db) {
    console.log("No remote PostgreSQL connection established. Skipping SQL insert.");
    console.log("In-memory repository is active and ready for local development.");
    return;
  }

  try {
    // Insert initial users & Better Auth credentials
    console.log("Seeding users and authentication credentials...");
    const vishalAdmin = await db
      .insert(schema.users)
      .values({
        name: "Vishal (Admin)",
        email: "vishal",
        emailVerified: true,
        role: "ADMIN",
        image: null,
      })
      .onConflictDoNothing()
      .returning({ id: schema.users.id });

    if (vishalAdmin[0]?.id) {
      await db
        .insert(schema.accounts)
        .values({
          id: `acc-vishal-${Date.now()}`,
          userId: vishalAdmin[0].id,
          accountId: "vishal",
          providerId: "credential",
          passwordHash: "79f8c778f28ecebd274eaacafc9f1019644d5636907393c28c2b8f4daf077eac", // 2004
        })
        .onConflictDoNothing();
    }

    const adminUser = await db
      .insert(schema.users)
      .values({
        name: "Vishal Patil (Curator)",
        email: "curator@latelier-lumineux.art",
        emailVerified: true,
        role: "ADMIN",
        image: null,
      })
      .onConflictDoNothing()
      .returning({ id: schema.users.id });

    if (adminUser[0]?.id) {
      await db
        .insert(schema.accounts)
        .values({
          id: `acc-admin-${Date.now()}`,
          userId: adminUser[0].id,
          accountId: "curator@latelier-lumineux.art",
          providerId: "credential",
          passwordHash: "5cf61d7b1a293c6f890b3967ff0c80ec9ef66a3d132646671a5cb67aa9960ff6", // Curator2026!
        })
        .onConflictDoNothing();
    }

    const collectorUser = await db
      .insert(schema.users)
      .values({
        name: "Henrietta Sterling",
        email: "collector@haute-art.com",
        emailVerified: true,
        role: "USER",
        image: null,
      })
      .onConflictDoNothing()
      .returning({ id: schema.users.id });

    if (collectorUser[0]?.id) {
      await db
        .insert(schema.accounts)
        .values({
          id: `acc-collector-${Date.now()}`,
          userId: collectorUser[0].id,
          accountId: "collector@haute-art.com",
          providerId: "credential",
          passwordHash: "5cf61d7b1a293c6f890b3967ff0c80ec9ef66a3d132646671a5cb67aa9960ff6", // Collector2026!
        })
        .onConflictDoNothing();
    }

    // Insert site settings
    console.log("Seeding site settings...");
    await db
      .insert(schema.siteSettings)
      .values({
        artistName: INITIAL_SITE_SETTINGS.artistName,
        siteTitle: INITIAL_SITE_SETTINGS.siteTitle,
        tagline: INITIAL_SITE_SETTINGS.tagline,
        bioSummary: INITIAL_SITE_SETTINGS.bioSummary,
        statement: INITIAL_SITE_SETTINGS.statement,
        contactEmail: INITIAL_SITE_SETTINGS.contactEmail,
        phone: INITIAL_SITE_SETTINGS.phone,
        location: INITIAL_SITE_SETTINGS.location,
        socialLinksJson: INITIAL_SITE_SETTINGS.socialLinks,
        copyrightText: INITIAL_SITE_SETTINGS.copyrightText,
      })
      .onConflictDoNothing();

    // Insert homepage sections
    console.log("Seeding homepage sections...");
    for (const sec of INITIAL_HOMEPAGE_SECTIONS) {
      await db
        .insert(schema.homepageSections)
        .values({
          sectionKey: sec.sectionKey,
          title: sec.title,
          subtitle: sec.subtitle,
          contentJson: sec.contentJson,
          isEnabled: sec.isEnabled,
          displayOrder: sec.displayOrder,
        })
        .onConflictDoNothing();
    }

    // Insert collections
    console.log("Seeding collections...");
    for (const col of INITIAL_COLLECTIONS) {
      await db
        .insert(schema.collections)
        .values({
          slug: col.slug,
          title: col.title,
          description: col.description,
          curatorialStatement: col.curatorialStatement,
          coverImageUrl: col.coverImageUrl,
          isPublished: col.isPublished,
          displayOrder: col.displayOrder,
        })
        .onConflictDoNothing();
    }

    // Insert exhibitions
    console.log("Seeding exhibitions...");
    for (const exh of INITIAL_EXHIBITIONS) {
      await db
        .insert(schema.exhibitions)
        .values({
          slug: exh.slug,
          title: exh.title,
          subtitle: exh.subtitle,
          description: exh.description,
          curatorNote: exh.curatorNote,
          location: exh.location,
          startDate: new Date(exh.startDate),
          endDate: new Date(exh.endDate),
          status: exh.status,
          coverImageUrl: exh.coverImageUrl,
          isPublished: exh.isPublished,
          displayOrder: exh.displayOrder,
        })
        .onConflictDoNothing();
    }

    // Insert artworks & AR configurations
    console.log("Seeding artworks...");
    for (const art of INITIAL_ARTWORKS) {
      const inserted = await db
        .insert(schema.artworks)
        .values({
          slug: art.slug,
          title: art.title,
          description: art.description,
          longDescription: art.longDescription,
          year: art.year,
          medium: art.medium,
          widthCm: String(art.widthCm),
          heightCm: String(art.heightCm),
          depthCm: art.depthCm ? String(art.depthCm) : undefined,
          price: art.price ? String(art.price) : undefined,
          currency: art.currency,
          status: art.status,
          coverImageUrl: art.coverImageUrl,
          altText: art.altText,
          seoTitle: art.seoTitle,
          seoDescription: art.seoDescription,
          isFeatured: art.isFeatured,
          displayOrder: art.displayOrder,
          publishedAt: new Date(),
        })
        .onConflictDoNothing()
        .returning({ id: schema.artworks.id });

      if (inserted[0]?.id) {
        await db
          .insert(schema.artworkAr)
          .values({
            artworkId: inserted[0].id,
            isArEnabled: art.arConfig.isArEnabled,
            defaultWidthCm: String(art.arConfig.defaultWidthCm),
            defaultHeightCm: String(art.arConfig.defaultHeightCm),
            defaultScale: String(art.arConfig.defaultScale),
            defaultRotation: String(art.arConfig.defaultRotation),
            frameEnabled: art.arConfig.frameEnabled,
            frameType: art.arConfig.frameType,
            frameDepthCm: String(art.arConfig.frameDepthCm),
            frameWidthCm: String(art.arConfig.frameWidthCm),
            matColor: art.arConfig.matColor,
            arReadinessStatus: art.arConfig.arReadinessStatus,
            arInstructions: art.arConfig.arInstructions,
          })
          .onConflictDoNothing();
      }
    }

    // Insert collection_artworks relations
    console.log("Seeding collection_artworks relations...");
    const allCollections = await db.select().from(schema.collections);
    const allArtworks = await db.select().from(schema.artworks);
    const allExhibitions = await db.select().from(schema.exhibitions);

    const artMap = new Map(allArtworks.map((a) => [a.slug, a.id]));
    const colMap = new Map(allCollections.map((c) => [c.slug, c.id]));
    const exhMap = new Map(allExhibitions.map((e) => [e.slug, e.id]));

    const collectionMappings: Record<string, string[]> = {
      "chromatic-solitude": [
        "solitude-in-ultramarine",
        "the-silence-of-amber",
        "whispering-tides",
        "nocturne-in-terre-verte",
      ],
      "ephemeral-terrains": [
        "aurora-at-the-meridian",
        "resonance-in-granite-no-4",
        "fracture-in-bone-and-gold",
        "strata-of-forgotten-empires",
      ],
    };

    for (const [colSlug, artSlugs] of Object.entries(collectionMappings)) {
      const colId = colMap.get(colSlug);
      if (!colId) continue;
      for (let i = 0; i < artSlugs.length; i++) {
        const artId = artMap.get(artSlugs[i]);
        if (!artId) continue;
        await db
          .insert(schema.collectionArtworks)
          .values({ collectionId: colId, artworkId: artId, displayOrder: i + 1 })
          .onConflictDoNothing();
      }
    }

    // Insert exhibition_artworks relations
    console.log("Seeding exhibition_artworks relations...");
    const exhibitionMappings: Record<string, string[]> = {
      "luminescence-at-twilight": [
        "solitude-in-ultramarine",
        "whispering-tides",
        "nocturne-in-terre-verte",
        "the-silence-of-amber",
      ],
      "resonance-of-the-earth": [
        "aurora-at-the-meridian",
        "resonance-in-granite-no-4",
        "fracture-in-bone-and-gold",
        "strata-of-forgotten-empires",
      ],
    };

    for (const [exhSlug, artSlugs] of Object.entries(exhibitionMappings)) {
      const exhId = exhMap.get(exhSlug);
      if (!exhId) continue;
      for (let i = 0; i < artSlugs.length; i++) {
        const artId = artMap.get(artSlugs[i]);
        if (!artId) continue;
        await db
          .insert(schema.exhibitionArtworks)
          .values({ exhibitionId: exhId, artworkId: artId, displayOrder: i + 1 })
          .onConflictDoNothing();
      }
    }

    // Insert media records and artwork images
    console.log("Seeding media and artwork images...");
    for (const art of allArtworks) {
      if (!art.coverImageUrl) continue;
      const fileKey = `artworks/${art.id}/original/${art.slug}.webp`;
      await db
        .insert(schema.media)
        .values({
          provider: "imagekit",
          providerAssetId: art.id,
          fileName: `${art.slug}.webp`,
          fileKey: fileKey,
          fileUrl: art.coverImageUrl,
          mimeType: "image/webp",
          byteSize: 1450000,
          width: 2400,
          height: Math.round(2400 * (Number(art.heightCm) / Number(art.widthCm))),
          aspectRatio: String((Number(art.widthCm) / Number(art.heightCm)).toFixed(4)),
          migrationStatus: "verified",
          variantsJson: {
            original: art.coverImageUrl,
            optimized: art.coverImageUrl,
            thumbnail: art.coverImageUrl,
            arTexture: art.coverImageUrl,
          },
        })
        .onConflictDoNothing();

      await db
        .insert(schema.artworkImages)
        .values({
          artworkId: art.id,
          imageUrl: art.coverImageUrl,
          displayOrder: 0,
          caption: `${art.title} - Primary View`,
          isPrimary: true,
        })
        .onConflictDoNothing();
    }

    console.log("Database seed completed successfully.");
  } catch (error) {
    console.error("Error during database seed:", error);
  }
}

runSeed();
