import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getDb, schema } from "../src/db/index";
import { eq, like, or } from "drizzle-orm";
import ImageKit from "imagekit";

async function main() {
  console.log("=================================================");
  console.log("  PURGING ALL FAKE UNSPLASH DATA & MOCK ARTWORKS ");
  console.log("=================================================");

  const db = getDb();
  if (!db) {
    console.error("No database connection available.");
    process.exit(1);
  }

  // 1. Identify fake mock artworks
  const fakeSlugs = [
    "aurora-at-the-meridian",
    "the-silence-of-amber",
    "whispering-tides",
    "fracture-in-bone-and-gold",
    "nocturne-in-terre-verte",
    "strata-of-forgotten-empires",
    "solitude-in-ultramarine",
    "resonance-in-granite-no-4",
    "v",
  ];

  console.log("\n[1/6] Deleting fake artworks and relations...");
  const allArtworks = await db.select().from(schema.artworks);
  const artworksToDelete = allArtworks.filter(
    (a) => fakeSlugs.includes(a.slug) || (a.coverImageUrl && a.coverImageUrl.includes("unsplash.com"))
  );

  console.log(`Found ${artworksToDelete.length} fake artworks to delete.`);

  for (const art of artworksToDelete) {
    console.log(`Deleting relations and artwork: ${art.title} (${art.slug}) [${art.id}]`);
    await db.delete(schema.collectionArtworks).where(eq(schema.collectionArtworks.artworkId, art.id));
    await db.delete(schema.exhibitionArtworks).where(eq(schema.exhibitionArtworks.artworkId, art.id));
    await db.delete(schema.artworkAr).where(eq(schema.artworkAr.artworkId, art.id));
    await db.delete(schema.artworkImages).where(eq(schema.artworkImages.artworkId, art.id));
    await db.delete(schema.artworks).where(eq(schema.artworks.id, art.id));
  }

  // 2. Delete all fake media rows with unsplash URLs
  console.log("\n[2/6] Deleting fake media records from 'media' table...");
  const fakeMedia = await db.select().from(schema.media);
  for (const m of fakeMedia) {
    if (m.fileUrl && m.fileUrl.includes("unsplash.com")) {
      console.log(`Deleting fake media: ${m.fileName} (${m.id})`);
      await db.delete(schema.media).where(eq(schema.media.id, m.id));
    }
  }

  // 3. Register real ImageKit uploads into 'media' table
  console.log("\n[3/6] Fetching genuine files from ImageKit...");
  const ik = new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY || "",
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || "",
  });

  const ikFiles = await ik.listFiles({ limit: 50 });
  console.log(`Found ${ikFiles.length} real files in ImageKit.`);

  const registeredMediaMap = new Map<string, string>(); // name -> mediaId

  for (const f of ikFiles) {
    const existing = await db
      .select()
      .from(schema.media)
      .where(eq(schema.media.fileKey, f.filePath));

    let mediaId: string;
    const aspectRatio = f.height && f.width ? (f.width / f.height).toFixed(4) : "1.0000";

    if (existing.length > 0) {
      mediaId = existing[0].id;
      console.log(`Media already registered for: ${f.name} [${mediaId}]`);
    } else {
      const inserted = await db
        .insert(schema.media)
        .values({
          provider: "imagekit",
          providerAssetId: f.fileId,
          fileName: f.name.replace(/^\d+-/, ""),
          fileKey: f.filePath,
          fileUrl: f.url,
          mimeType: f.mime || "image/jpeg",
          byteSize: f.size || 1000000,
          width: f.width || 2560,
          height: f.height || 1440,
          aspectRatio,
          migrationStatus: "verified",
          variantsJson: {
            original: f.url,
            optimized: f.url,
            thumbnail: f.thumbnail || f.url,
          },
        })
        .returning({ id: schema.media.id });
      mediaId = inserted[0].id;
      console.log(`Registered new ImageKit media asset: ${f.name} => [${mediaId}]`);
    }

    registeredMediaMap.set(f.name, mediaId);
  }

  // 4. Create authentic published artwork for 'kazuha' using ImageKit asset
  console.log("\n[4/6] Creating real artwork for Kazuha with ImageKit media...");
  const kazuhaFile = ikFiles.find((f) => f.name.includes("kazuha"));
  const screenshotFile = ikFiles.find((f) => f.name.includes("screenshot"));

  let primaryArtworkId: string | null = null;

  if (kazuhaFile) {
    const kazuhaMediaId = registeredMediaMap.get(kazuhaFile.name);
    const existingKazuha = await db
      .select()
      .from(schema.artworks)
      .where(eq(schema.artworks.slug, "kazuha"));

    if (existingKazuha.length > 0) {
      primaryArtworkId = existingKazuha[0].id;
      console.log(`Artwork 'Kazuha' already exists [${primaryArtworkId}]`);
    } else {
      const inserted = await db
        .insert(schema.artworks)
        .values({
          slug: "kazuha",
          title: "Kazuha",
          description: "Original contemporary digital canvas featuring vivid atmospheric depth and autumnal wind currents.",
          longDescription: "Kazuha is an evocative digital work exploring harmony, movement, and ethereal light. Captured at ultra-high 2.5K resolution with rich color depth on ImageKit CDN.",
          year: 2026,
          medium: "Digital Canvas & High-Fidelity Pigments",
          widthCm: "120.00",
          heightCm: "67.50",
          depthCm: "3.50",
          price: "16500.00",
          currency: "USD",
          status: "published",
          coverImageId: kazuhaMediaId || undefined,
          coverImageUrl: kazuhaFile.url,
          altText: "Kazuha artwork by Vishal",
          seoTitle: "Kazuha | Original Artwork by Vishal",
          seoDescription: "Examine Kazuha in true 1:1 scale WebAR in your living space.",
          isFeatured: true,
          displayOrder: 1,
          publishedAt: new Date(),
        })
        .returning({ id: schema.artworks.id });

      primaryArtworkId = inserted[0].id;
      console.log(`Created artwork 'Kazuha' with ID: ${primaryArtworkId}`);

      // AR configuration
      await db.insert(schema.artworkAr).values({
        artworkId: primaryArtworkId,
        isArEnabled: true,
        defaultWidthCm: "120.00",
        defaultHeightCm: "67.50",
        defaultScale: "1.00",
        defaultRotation: "0.00",
        frameEnabled: true,
        frameType: "minimal_black",
        frameDepthCm: "3.00",
        frameWidthCm: "4.00",
        matColor: "#0D0E12",
        arReadinessStatus: "ready",
        arInstructions: "Point camera towards a well-lit wall and tap to mount Kazuha in 1:1 true physical scale.",
      });

      // Artwork image gallery
      if (kazuhaMediaId) {
        await db.insert(schema.artworkImages).values({
          artworkId: primaryArtworkId,
          mediaId: kazuhaMediaId,
          imageUrl: kazuhaFile.url,
          displayOrder: 1,
          caption: "Primary Master Canvas",
          isPrimary: true,
        });
      }
    }
  }

  // Also create second artwork if screenshot exists
  if (screenshotFile) {
    const screenshotMediaId = registeredMediaMap.get(screenshotFile.name);
    const existingScreenshot = await db
      .select()
      .from(schema.artworks)
      .where(eq(schema.artworks.slug, "atelier-study-no-1"));

    if (existingScreenshot.length === 0) {
      const inserted = await db
        .insert(schema.artworks)
        .values({
          slug: "atelier-study-no-1",
          title: "Atelier Study No. 1",
          description: "Architectural and UI composition study examining digital presence and modernist spatial geometry.",
          longDescription: "A geometric and modernist digital composition exploring proportion, negative space, and digital craftsmanship.",
          year: 2026,
          medium: "Digital Mixed Media",
          widthCm: "80.00",
          heightCm: "55.00",
          depthCm: "2.50",
          price: "8500.00",
          currency: "USD",
          status: "published",
          coverImageId: screenshotMediaId || undefined,
          coverImageUrl: screenshotFile.url,
          altText: "Atelier Study No. 1 by Vishal",
          seoTitle: "Atelier Study No. 1 | Vishal",
          seoDescription: "Explore Atelier Study No. 1 in high-fidelity preview and WebAR.",
          isFeatured: true,
          displayOrder: 2,
          publishedAt: new Date(),
        })
        .returning({ id: schema.artworks.id });

      const secondArtId = inserted[0].id;
      console.log(`Created second artwork 'Atelier Study No. 1' with ID: ${secondArtId}`);

      await db.insert(schema.artworkAr).values({
        artworkId: secondArtId,
        isArEnabled: true,
        defaultWidthCm: "80.00",
        defaultHeightCm: "55.00",
        defaultScale: "1.00",
        defaultRotation: "0.00",
        frameEnabled: true,
        frameType: "white_gallery",
        frameDepthCm: "2.50",
        frameWidthCm: "3.50",
        matColor: "#FFFFFF",
        arReadinessStatus: "ready",
      });

      if (screenshotMediaId) {
        await db.insert(schema.artworkImages).values({
          artworkId: secondArtId,
          mediaId: screenshotMediaId,
          imageUrl: screenshotFile.url,
          displayOrder: 1,
          isPrimary: true,
        });
      }
    }
  }

  // 5. Clean up Collections & Exhibitions so no Unsplash images remain
  console.log("\n[5/6] Updating collections and exhibitions to use ImageKit assets...");
  const primaryImgUrl = kazuhaFile ? kazuhaFile.url : (screenshotFile ? screenshotFile.url : "");

  // Update existing collections or clear unsplash
  const collections = await db.select().from(schema.collections);
  for (const c of collections) {
    if (c.coverImageUrl && c.coverImageUrl.includes("unsplash.com")) {
      await db
        .update(schema.collections)
        .set({
          coverImageUrl: primaryImgUrl || null,
          coverImageId: kazuhaFile ? registeredMediaMap.get(kazuhaFile.name) || null : null,
          updatedAt: new Date(),
        })
        .where(eq(schema.collections.id, c.id));
      console.log(`Updated collection '${c.title}' to ImageKit cover.`);
    }
  }

  // Link primary artwork to collection if collection exists
  if (collections.length > 0 && primaryArtworkId) {
    await db
      .insert(schema.collectionArtworks)
      .values({
        collectionId: collections[0].id,
        artworkId: primaryArtworkId,
        displayOrder: 1,
      })
      .onConflictDoNothing();
    console.log(`Linked artwork 'Kazuha' to collection '${collections[0].title}'`);
  }

  // Update existing exhibitions or clear unsplash
  const exhibitions = await db.select().from(schema.exhibitions);
  for (const e of exhibitions) {
    if (e.coverImageUrl && e.coverImageUrl.includes("unsplash.com")) {
      await db
        .update(schema.exhibitions)
        .set({
          coverImageUrl: primaryImgUrl || null,
          coverImageId: kazuhaFile ? registeredMediaMap.get(kazuhaFile.name) || null : null,
          updatedAt: new Date(),
        })
        .where(eq(schema.exhibitions.id, e.id));
      console.log(`Updated exhibition '${e.title}' to ImageKit cover.`);
    }
  }

  if (exhibitions.length > 0 && primaryArtworkId) {
    await db
      .insert(schema.exhibitionArtworks)
      .values({
        exhibitionId: exhibitions[0].id,
        artworkId: primaryArtworkId,
        displayOrder: 1,
      })
      .onConflictDoNothing();
    console.log(`Linked artwork 'Kazuha' to exhibition '${exhibitions[0].title}'`);
  }

  // 6. Clean users table of unsplash avatars
  console.log("\n[6/6] Cleaning users table of fake unsplash avatars...");
  const users = await db.select().from(schema.users);
  for (const u of users) {
    if (u.image && u.image.includes("unsplash.com")) {
      await db
        .update(schema.users)
        .set({
          image: null,
          updatedAt: new Date(),
        })
        .where(eq(schema.users.id, u.id));
      console.log(`Removed fake avatar from user: ${u.name} (${u.email})`);
    }
  }

  // Update homepage sections featured artworks
  const hpSections = await db.select().from(schema.homepageSections);
  for (const s of hpSections) {
    if (s.contentJson && primaryArtworkId) {
      const updatedContent = {
        ...s.contentJson,
        featuredArtworkIds: [primaryArtworkId],
      };
      await db
        .update(schema.homepageSections)
        .set({
          contentJson: updatedContent,
          updatedAt: new Date(),
        })
        .where(eq(schema.homepageSections.id, s.id));
    }
  }

  console.log("\n=================================================");
  console.log("  DATABASE CLEANUP & IMAGEKIT SYNC COMPLETED!    ");
  console.log("=================================================");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Cleanup failed:", err);
    process.exit(1);
  });
