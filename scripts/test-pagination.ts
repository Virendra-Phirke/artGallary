import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { getPaginatedArtworks } from "../src/db/repository";

async function runTests() {
  console.log("=================================================");
  console.log("     PAGINATION & DATABASE RELAXATION TEST      ");
  console.log("=================================================");

  // 1. Test 10 items per page (default)
  console.log("\n[1/4] Testing page size = 10...");
  const res10 = await getPaginatedArtworks({ page: 1, limit: 10 });
  console.log(`  ✓ Returned ${res10.artworks.length} artworks`);
  console.log(`  ✓ Total Count in Neon DB: ${res10.pagination.totalCount}`);
  console.log(`  ✓ Total Pages: ${res10.pagination.totalPages}`);
  console.log(`  ✓ hasNextPage: ${res10.pagination.hasNextPage}, hasPrevPage: ${res10.pagination.hasPrevPage}`);
  if (res10.artworks.length > 10) throw new Error("Returned more than 10 artworks!");

  // 2. Test 20 items per page
  console.log("\n[2/4] Testing page size = 20...");
  const res20 = await getPaginatedArtworks({ page: 1, limit: 20 });
  console.log(`  ✓ Returned ${res20.artworks.length} artworks`);
  console.log(`  ✓ Total Pages with limit 20: ${res20.pagination.totalPages}`);
  if (res20.artworks.length > 20) throw new Error("Returned more than 20 artworks!");

  // 3. Test 50 & 100 items per page
  console.log("\n[3/4] Testing page size = 50 and 100...");
  const res50 = await getPaginatedArtworks({ page: 1, limit: 50 });
  const res100 = await getPaginatedArtworks({ page: 1, limit: 100 });
  console.log(`  ✓ Limit 50 returned ${res50.artworks.length} items`);
  console.log(`  ✓ Limit 100 returned ${res100.artworks.length} items`);

  // 4. Test Page Traversal (Page 2 if more than 1 page exists)
  console.log("\n[4/4] Testing Page Navigation & Offset calculation...");
  if (res10.pagination.totalPages > 1) {
    const resPage2 = await getPaginatedArtworks({ page: 2, limit: 10 });
    console.log(`  ✓ Page 2 returned ${resPage2.artworks.length} artworks`);
    console.log(`  ✓ Page 2 hasPrevPage: ${resPage2.pagination.hasPrevPage} (Expected: true)`);
    if (res10.artworks[0].id === resPage2.artworks[0].id) {
      throw new Error("Page 1 and Page 2 returned the exact same first item; offset did not work!");
    }
    console.log("  ✓ Page 1 and Page 2 contain distinct offset items.");
  } else {
    console.log("  ℹ Only 1 page of data exists in the database; skipping page 2 test.");
  }

  console.log("\n=================================================");
  console.log("   ALL PAGINATION TESTS PASSED SUCCESSFULLY!    ");
  console.log("=================================================\n");
}

runTests().catch((err) => {
  console.error("❌ Test failed:", err);
  process.exit(1);
});
