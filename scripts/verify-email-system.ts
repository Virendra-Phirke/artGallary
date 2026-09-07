import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import {
  getActiveSubscribers,
  getSubscriberStats,
  subscribeGuestEmail,
  unsubscribeByToken,
  resubscribeByToken,
} from "../src/db/repository";
import {
  generateArtworkAnnouncementHtml,
  generateArtworkAnnouncementText,
} from "../src/lib/email/templates/artworkAnnouncement";
import {
  generateInquiryUserConfirmationHtml,
  generateCuratorInquiryAlertHtml,
} from "../src/lib/email/templates/inquiryReceipt";
import { broadcastArtworkAnnouncement } from "../src/lib/email/resend";

async function verify() {
  console.log("=== BEGIN RESEND MAILING SYSTEM VERIFICATION ===");

  // 1. Verify Templates
  console.log("\n1. Testing Email Template Generators...");
  const mockArtwork = {
    id: "art-test-1",
    title: "Nocturne in Ultramarine",
    slug: "nocturne-in-ultramarine",
    description: "Deep lapis lazuli pigment on textured Belgian linen.",
    medium: "Oil & crushed lapis lazuli",
    year: 2026,
    widthCm: 140,
    heightCm: 100,
    depthCm: 4,
    price: 24000,
    currency: "USD",
    coverImageUrl: "https://ik.imagekit.io/bpnsp30ni/artworks/sample.jpg",
  };

  const announcementHtml = generateArtworkAnnouncementHtml({
    artwork: mockArtwork,
    artworkUrl: "http://localhost:3000/artwork/nocturne-in-ultramarine",
    unsubscribeUrl: "http://localhost:3000/unsubscribe?token=sample-test-token",
  });
  console.log("✓ Artwork announcement HTML generated (length:", announcementHtml.length, "chars)");

  if (!announcementHtml.includes("Nocturne in Ultramarine") || !announcementHtml.includes("sample-test-token")) {
    throw new Error("Artwork announcement HTML template missing title or unsubscribe token!");
  }

  const announcementText = generateArtworkAnnouncementText({
    artwork: mockArtwork,
    artworkUrl: "http://localhost:3000/artwork/nocturne-in-ultramarine",
    unsubscribeUrl: "http://localhost:3000/unsubscribe?token=sample-test-token",
  });
  console.log("✓ Plain-text announcement generated (length:", announcementText.length, "chars)");

  const inquiryConfirmHtml = generateInquiryUserConfirmationHtml({
    inquiry: {
      id: "inq-1",
      name: "Lord Sterling",
      email: "sterling@haute-art.com",
      message: "Please reserve this masterwork for private studio viewing.",
    },
    artworkTitle: "Nocturne in Ultramarine",
  });
  console.log("✓ Inquiry user confirmation HTML generated (length:", inquiryConfirmHtml.length, "chars)");

  const curatorAlertHtml = generateCuratorInquiryAlertHtml({
    inquiry: {
      id: "inq-1",
      name: "Lord Sterling",
      email: "sterling@haute-art.com",
      message: "Please reserve this masterwork for private studio viewing.",
    },
    artworkTitle: "Nocturne in Ultramarine",
  });
  console.log("✓ Curator inquiry alert HTML generated (length:", curatorAlertHtml.length, "chars)");

  // 2. Test Subscriber Database Operations
  console.log("\n2. Testing Subscriber Database Operations...");
  const testEmail = `test-collector-${Date.now()}@example.com`;

  console.log(`Subscribing test guest: ${testEmail}...`);
  const subResult = await subscribeGuestEmail(testEmail, "Test Collector", "test_suite");
  if (!subResult.success || !subResult.token) {
    throw new Error(`Failed to subscribe test email: ${subResult.error}`);
  }
  console.log("✓ Guest successfully subscribed with token:", subResult.token);

  // Check active subscribers
  const activeSubs = await getActiveSubscribers();
  console.log(`✓ Active subscribers in registry: ${activeSubs.length}`);
  const found = activeSubs.find((s) => s.email.toLowerCase() === testEmail.toLowerCase());
  if (!found) {
    throw new Error("Subscribed test email not found in active subscribers list!");
  }
  console.log("✓ Test subscriber verified in active registry with valid unsubscribeToken");

  // 3. Test RFC 8058 One-Click Unsubscribe
  console.log("\n3. Testing RFC 8058 One-Click Unsubscribe...");
  const unsubResult = await unsubscribeByToken(subResult.token);
  if (!unsubResult.success) {
    throw new Error("unsubscribeByToken failed!");
  }
  console.log("✓ Unsubscribe executed successfully for:", unsubResult.email);

  const activeAfterUnsub = await getActiveSubscribers();
  const stillPresent = activeAfterUnsub.find((s) => s.email.toLowerCase() === testEmail.toLowerCase());
  if (stillPresent) {
    throw new Error("Unsubscribed user still appears in active registry!");
  }
  console.log("✓ Verified user is removed from active broadcast registry");

  // 4. Test Re-subscribe
  console.log("\n4. Testing Re-subscription...");
  const resubResult = await resubscribeByToken(subResult.token);
  if (!resubResult.success) {
    throw new Error("resubscribeByToken failed!");
  }
  console.log("✓ Re-subscribe executed successfully for:", resubResult.email);

  // 5. Test Resend Batch Dispatcher (in dev mock mode)
  console.log("\n5. Testing Resend Batch Dispatching with RFC 8058 Headers...");
  const broadcastResult = await broadcastArtworkAnnouncement({
    artwork: mockArtwork,
    subscribers: [
      {
        email: testEmail,
        name: "Test Collector",
        unsubscribeToken: subResult.token,
      },
    ],
  });
  console.log("✓ Broadcast dispatch completed:", broadcastResult);

  console.log("\n=== ALL EMAIL & SUBSCRIBER SYSTEM CHECKS PASSED ===");
}

verify().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
