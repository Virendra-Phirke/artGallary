import {
  saveArtwork,
  getArtworkById,
  getArtworkBySlug,
  getArtworks,
  getAllArtworksAdmin,
  archiveArtwork,
  saveCollection,
  getCollections,
  getAllCollectionsAdmin,
  getCollectionBySlug,
  deleteCollection,
  updateCollectionArtworks,
  saveExhibition,
  getExhibitions,
  getAllExhibitionsAdmin,
  getExhibitionBySlug,
  deleteExhibition,
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  getMediaItems,
  deleteMediaItem,
  getHomepageSections,
  getAllHomepageSectionsAdmin,
  updateHomepageSection,
  getSiteSettings,
  updateSiteSettings,
} from "../src/db/repository";

async function runComprehensiveCrudAudit() {
  console.log("==================================================");
  console.log("   ART GALLERY PLATFORM — COMPREHENSIVE CRUD AUDIT");
  console.log("==================================================");

  const results: Record<string, boolean> = {};

  try {
    // ----------------------------------------------------
    // 1. COLLECTION CRUD (create first to test artwork relation)
    // ----------------------------------------------------
    console.log("\n[1] Testing COLLECTION CRUD...");
    const timestamp = Date.now();
    const testCol = await saveCollection({
      title: `Audit Thematic Series ${timestamp}`,
      slug: `audit-col-${timestamp}`,
      description: "Atmospheric study of ultramarine pigments.",
      curatorialStatement: "Curatorial statement for audit testing.",
      coverImageUrl: "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg",
      isPublished: true,
      displayOrder: 1,
    });
    results["Collection Create"] = Boolean(testCol?.id);
    console.log("  ✓ Collection Created:", testCol.id, testCol.slug);

    const colBySlug = await getCollectionBySlug(testCol.slug);
    results["Collection Read By Slug"] = colBySlug?.id === testCol.id;
    console.log("  ✓ Collection Read by Slug:", results["Collection Read By Slug"]);

    // Test Partial Update: only toggling isPublished without providing title
    const colPartial = await saveCollection({
      id: testCol.id,
      isPublished: false,
    });
    results["Collection Partial Update (isPublished)"] =
      colPartial.isPublished === false && colPartial.title === testCol.title;
    console.log("  ✓ Collection Partial Update (safe without title):", results["Collection Partial Update (isPublished)"]);

    // ----------------------------------------------------
    // 2. ARTWORK CRUD
    // ----------------------------------------------------
    console.log("\n[2] Testing ARTWORK CRUD...");
    const testArt = await saveArtwork({
      title: `Canvas Audit ${timestamp}`,
      slug: `canvas-audit-${timestamp}`,
      description: "Evocative oil study examining horizon boundaries.",
      longDescription: "Extended provenance notes for testing.",
      year: 2026,
      medium: "Oil and lapis lazuli on Belgian linen",
      widthCm: 140,
      heightCm: 100,
      depthCm: 4.0,
      price: 24000,
      currency: "USD",
      status: "draft",
      coverImageUrl: "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg",
      altText: "Canvas Audit Test Alt",
      isFeatured: false,
      collectionSlug: testCol.slug, // test linking during create
      arConfig: {
        isArEnabled: true,
        defaultWidthCm: 140,
        defaultHeightCm: 100,
        defaultScale: 1.0,
        defaultRotation: 0,
        minScale: 0.5,
        maxScale: 2.0,
        placementMode: "wall",
        frameEnabled: true,
        frameType: "minimal_black",
        frameDepthCm: 3.5,
        frameWidthCm: 3.0,
        matColor: "#ffffff",
        arReadinessStatus: "ready",
        arInstructions: "Point camera at eye level on flat wall.",
      },
    });
    results["Artwork Create (with collection linking)"] =
      Boolean(testArt?.id) && testArt.collectionSlug === testCol.slug;
    console.log("  ✓ Artwork Created with Collection Link:", results["Artwork Create (with collection linking)"]);

    const artById = await getArtworkById(testArt.id);
    results["Artwork Read By ID"] = artById?.title === testArt.title;
    console.log("  ✓ Artwork Read by ID:", results["Artwork Read By ID"]);

    const artBySlug = await getArtworkBySlug(testArt.slug);
    results["Artwork Read By Slug"] = artBySlug?.id === testArt.id;
    console.log("  ✓ Artwork Read by Slug:", results["Artwork Read By Slug"]);

    // Test Partial Update: ONLY updating status (no title provided)
    const artStatusPartial = await saveArtwork({
      id: testArt.id,
      status: "reserved",
    });
    results["Artwork Partial Update (status only, safe NOT NULL)"] =
      artStatusPartial.status === "reserved" && artStatusPartial.title === testArt.title;
    console.log("  ✓ Artwork Partial Update (status only):", results["Artwork Partial Update (status only, safe NOT NULL)"]);

    // Test Partial Update: updating featured & price
    const artPricePartial = await saveArtwork({
      id: testArt.id,
      price: 28000,
      isFeatured: true,
    });
    results["Artwork Partial Update (price & featured)"] =
      artPricePartial.price === 28000 && artPricePartial.isFeatured === true;
    console.log("  ✓ Artwork Partial Update (price & featured):", results["Artwork Partial Update (price & featured)"]);

    // Test Unlinking Collection via "none"
    const artUnlinked = await saveArtwork({
      id: testArt.id,
      collectionSlug: "none",
    });
    results["Artwork Collection Unlink"] = !artUnlinked.collectionSlug;
    console.log("  ✓ Artwork Collection Unlinked ('none'):", results["Artwork Collection Unlink"]);

    // Test Archiving
    const archived = await archiveArtwork(testArt.id);
    const artAfterArchive = await getArtworkById(testArt.id);
    results["Artwork Archive"] = archived && artAfterArchive?.status === "archived";
    console.log("  ✓ Artwork Archived:", results["Artwork Archive"]);

    // ----------------------------------------------------
    // 3. COLLECTION ARTWORKS SYNC & DELETE
    // ----------------------------------------------------
    console.log("\n[3] Testing COLLECTION ARTWORK SYNC & DELETION...");
    await updateCollectionArtworks(testCol.id, [testArt.id]);
    const colAfterSync = await getCollectionBySlug(testCol.slug);
    results["Collection Artworks Sync"] = Boolean(colAfterSync?.artworkSlugs.includes(testArt.slug));
    console.log("  ✓ Collection Artworks Sync:", results["Collection Artworks Sync"]);

    const colDeleted = await deleteCollection(testCol.id);
    const colAfterDelete = await getCollectionBySlug(testCol.slug);
    results["Collection Delete (Cascade Clean)"] = colDeleted && colAfterDelete === null;
    console.log("  ✓ Collection Deleted:", results["Collection Delete (Cascade Clean)"]);

    // ----------------------------------------------------
    // 4. EXHIBITION CRUD
    // ----------------------------------------------------
    console.log("\n[4] Testing EXHIBITION CRUD...");
    const testExh = await saveExhibition({
      title: `Audit Retrospective ${timestamp}`,
      slug: `audit-exh-${timestamp}`,
      subtitle: "Winter Vernissage",
      description: "Exhibition testing summary",
      curatorNote: "Notes from curator",
      location: "Paris Grand Palais",
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 60 * 86400000).toISOString(),
      status: "upcoming",
      isPublished: true,
      displayOrder: 1,
    });
    results["Exhibition Create"] = Boolean(testExh?.id);
    console.log("  ✓ Exhibition Created:", testExh.id);

    const exhBySlug = await getExhibitionBySlug(testExh.slug);
    results["Exhibition Read By Slug"] = exhBySlug?.id === testExh.id;
    console.log("  ✓ Exhibition Read by Slug:", results["Exhibition Read By Slug"]);

    // Test Partial Update: only updating status
    const exhPartial = await saveExhibition({
      id: testExh.id,
      status: "current",
    });
    results["Exhibition Partial Update (status only)"] =
      exhPartial.status === "current" && exhPartial.title === testExh.title;
    console.log("  ✓ Exhibition Partial Update (status only):", results["Exhibition Partial Update (status only)"]);

    const exhDeleted = await deleteExhibition(testExh.id);
    const exhAfterDelete = await getExhibitionBySlug(testExh.slug);
    results["Exhibition Delete"] = exhDeleted && exhAfterDelete === null;
    console.log("  ✓ Exhibition Deleted:", results["Exhibition Delete"]);

    // ----------------------------------------------------
    // 5. INQUIRIES CRUD
    // ----------------------------------------------------
    console.log("\n[5] Testing INQUIRY CRUD...");
    const testInq = await createInquiry({
      artworkId: testArt.id,
      name: "Audit Collector",
      email: "collector@example.com",
      phone: "+33 1 42 68 00 00",
      subject: `Acquisition Inquiry: ${testArt.title}`,
      message: "Please provide condition report and crating estimates.",
    });
    results["Inquiry Create"] = Boolean(testInq?.id) && testInq.status === "new";
    console.log("  ✓ Inquiry Created:", testInq.id, testInq.status);

    const allInquiries = await getInquiries();
    const foundInq = allInquiries.find((i) => i.id === testInq.id);
    results["Inquiry Read"] = Boolean(foundInq);
    console.log("  ✓ Inquiry Read:", results["Inquiry Read"]);

    const statusUpdatedRead = await updateInquiryStatus(testInq.id, "read");
    const statusUpdatedReplied = await updateInquiryStatus(testInq.id, "replied");
    const statusUpdatedClosed = await updateInquiryStatus(testInq.id, "closed");
    results["Inquiry Status Lifecycle"] =
      statusUpdatedRead && statusUpdatedReplied && statusUpdatedClosed;
    console.log("  ✓ Inquiry Status Transitions (read -> replied -> closed):", results["Inquiry Status Lifecycle"]);

    // ----------------------------------------------------
    // 6. MEDIA READ
    // ----------------------------------------------------
    console.log("\n[6] Testing MEDIA READ...");
    const mediaList = await getMediaItems();
    results["Media Read"] = Array.isArray(mediaList);
    console.log("  ✓ Media Items Count:", mediaList.length);

    // ----------------------------------------------------
    // 7. HOMEPAGE SECTIONS & SITE SETTINGS
    // ----------------------------------------------------
    console.log("\n[7] Testing SETTINGS & HOMEPAGE CRUD...");
    const settings = await getSiteSettings();
    results["Site Settings Read"] = Boolean(settings?.artistName);
    console.log("  ✓ Site Settings Read:", settings.artistName);

    const updatedSettings = await updateSiteSettings({
      ...settings,
      tagline: "Fine Contemporary Art & WebAR Virtual Room Preview",
    });
    results["Site Settings Update"] = updatedSettings.tagline.includes("WebAR");
    console.log("  ✓ Site Settings Updated:", results["Site Settings Update"]);

    const sections = await getAllHomepageSectionsAdmin();
    results["Homepage Sections Read"] = sections.length > 0;
    console.log("  ✓ Homepage Sections Count:", sections.length);

    if (sections[0]) {
      await updateHomepageSection(sections[0].sectionKey, {
        title: sections[0].title,
        subtitle: sections[0].subtitle,
        isEnabled: sections[0].isEnabled,
        displayOrder: sections[0].displayOrder,
        contentJson: sections[0].contentJson,
      });
      results["Homepage Section Update"] = true;
      console.log("  ✓ Homepage Section Updated:", sections[0].sectionKey);
    }

    // ----------------------------------------------------
    // CLEANUP TEST RECORDS
    // ----------------------------------------------------
    const db = (await import("../src/db")).getDb();
    if (db) {
      const { schema } = await import("../src/db");
      const { eq } = await import("drizzle-orm");
      await db.delete(schema.inquiries).where(eq(schema.inquiries.id, testInq.id));
      await db.delete(schema.artworkAr).where(eq(schema.artworkAr.artworkId, testArt.id));
      await db.delete(schema.artworks).where(eq(schema.artworks.id, testArt.id));
      console.log("\n  ✓ Temporary audit artwork & inquiry cleaned up safely.");
    }

    // ----------------------------------------------------
    // FINAL AUDIT REPORT
    // ----------------------------------------------------
    console.log("\n==================================================");
    console.log("               AUDIT SCORECARD");
    console.log("==================================================");
    let allPassed = true;
    for (const [testName, passed] of Object.entries(results)) {
      console.log(` ${passed ? "✓ PASS" : "✗ FAIL"} | ${testName}`);
      if (!passed) allPassed = false;
    }
    console.log("==================================================");
    if (allPassed) {
      console.log(">>> ALL CRUD TESTS PASSED WITH 100% SUCCESS! <<<");
    } else {
      console.error(">>> SOME CRUD TESTS FAILED! <<<");
      process.exit(1);
    }
  } catch (err) {
    console.error("Fatal audit error:", err);
    process.exit(1);
  }
}

runComprehensiveCrudAudit();
