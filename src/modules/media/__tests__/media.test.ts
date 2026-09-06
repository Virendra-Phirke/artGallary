import assert from "node:assert/strict";
import { getMediaConfig } from "../media.config";
import { MediaConfigurationError, MediaValidationError } from "../media.errors";
import { providerResolver } from "../media.resolver";
import { mediaService } from "../media.service";
import { ImageKitProvider } from "../providers/imagekit/imagekit.provider";
import { CloudflareR2Provider } from "../providers/cloudflare/cloudflare.provider";

async function runTests() {
  console.log("=================================================");
  console.log("  Running Media Infrastructure Layer Test Suite  ");
  console.log("=================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ✗ FAIL: ${name}`);
      console.error(`    ${err.message}\n`);
      failed++;
    }
  }

  // Group 1: Configuration & Fail-Fast Validation
  console.log("[Group 1: Configuration & Startup Validation]");

  await test("getMediaConfig() returns valid configuration when both providers enabled", () => {
    process.env.MEDIA_PROVIDER = "imagekit";
    process.env.IMAGEKIT_STORAGE = "true";
    process.env.CLOUDFLARE_STORAGE = "true";

    const config = getMediaConfig();
    assert.equal(config.activeProvider, "imagekit");
    assert.equal(config.isImageKitEnabled, true);
    assert.equal(config.isCloudflareEnabled, true);
  });

  await test("Fail-fast throws MediaConfigurationError when active provider imagekit is disabled", () => {
    process.env.MEDIA_PROVIDER = "imagekit";
    process.env.IMAGEKIT_STORAGE = "false";
    process.env.CLOUDFLARE_STORAGE = "true";

    assert.throws(
      () => getMediaConfig(),
      (err: any) => err instanceof MediaConfigurationError && err.message.includes("IMAGEKIT_STORAGE is disabled")
    );
  });

  await test("Fail-fast throws MediaConfigurationError when active provider cloudflare is disabled", () => {
    process.env.MEDIA_PROVIDER = "cloudflare";
    process.env.IMAGEKIT_STORAGE = "true";
    process.env.CLOUDFLARE_STORAGE = "false";

    assert.throws(
      () => getMediaConfig(),
      (err: any) => err instanceof MediaConfigurationError && err.message.includes("CLOUDFLARE_STORAGE is disabled")
    );
  });

  // Reset env to valid state
  process.env.MEDIA_PROVIDER = "imagekit";
  process.env.IMAGEKIT_STORAGE = "true";
  process.env.CLOUDFLARE_STORAGE = "true";

  // Group 2: Provider Resolver
  console.log("\n[Group 2: Provider Resolver]");

  await test("providerResolver resolves ImageKitProvider for 'imagekit'", () => {
    const provider = providerResolver.resolveProvider("imagekit");
    assert.equal(provider.name, "imagekit");
    assert.equal(provider instanceof ImageKitProvider, true);
  });

  await test("providerResolver resolves CloudflareR2Provider for 'cloudflare'", () => {
    const provider = providerResolver.resolveProvider("cloudflare");
    assert.equal(provider.name, "cloudflare");
    assert.equal(provider instanceof CloudflareR2Provider, true);
  });

  await test("providerResolver resolves active provider matching MEDIA_PROVIDER", () => {
    process.env.MEDIA_PROVIDER = "imagekit";
    assert.equal(providerResolver.resolveActiveProvider().name, "imagekit");

    process.env.MEDIA_PROVIDER = "cloudflare";
    assert.equal(providerResolver.resolveActiveProvider().name, "cloudflare");

    // Revert to imagekit
    process.env.MEDIA_PROVIDER = "imagekit";
  });

  // Group 3: ImageKit Transformations & AR Profiles
  console.log("\n[Group 3: Image Transformations & AR Texture Profiles]");

  await test("ImageKitProvider transforms URL with width, quality, and format", () => {
    const ikProvider = new ImageKitProvider();
    const url = ikProvider.getUrl(
      { fileUrl: "https://ik.imagekit.io/latelier/artworks/sample.jpg" },
      { width: 1200, quality: 80, format: "webp" }
    );
    assert.ok(url.includes("tr=w-1200,q-80,f-webp"), `Expected transform parameters in ${url}`);
  });

  await test("ImageKitProvider generates high-fidelity WebAR texture profile (2048px)", () => {
    const ikProvider = new ImageKitProvider();
    const arUrl = ikProvider.getUrl(
      { fileUrl: "https://ik.imagekit.io/latelier/artworks/ar-source.png" },
      { width: 2048, quality: 85, format: "webp" }
    );
    assert.ok(arUrl.includes("tr=w-2048,q-85,f-webp"), `Expected AR texture profile in ${arUrl}`);
  });

  // Group 4: Cloudflare R2 Provider
  console.log("\n[Group 4: Cloudflare R2 Provider]");

  await test("CloudflareR2Provider generates canonical object key URL", () => {
    const r2Provider = new CloudflareR2Provider();
    const url = r2Provider.getUrl({
      objectKey: "artworks/gallery/sample-optimized.webp",
    });
    assert.ok(url.includes("artworks/gallery/sample-optimized.webp"), `Expected key in URL: ${url}`);
  });

  // Group 5: MediaService & Hybrid Storage Resolution
  console.log("\n[Group 5: Hybrid Storage & MediaService]");

  await test("mediaService resolves ImageKit asset URL correctly based on asset.provider", () => {
    const url = mediaService.getUrl(
      {
        provider: "imagekit",
        fileUrl: "https://ik.imagekit.io/latelier/solitude.jpg",
      },
      { width: 800 }
    );
    assert.ok(url.includes("ik.imagekit.io"), "Should resolve ImageKit endpoint");
    assert.ok(url.includes("tr=w-800"), "Should include transform");
  });

  await test("mediaService resolves Cloudflare R2 asset URL correctly based on asset.provider", () => {
    const url = mediaService.getUrl({
      provider: "cloudflare",
      fileUrl: "https://art-gallery-media.r2.dev/artworks/aurora.webp",
    });
    assert.equal(url, "https://art-gallery-media.r2.dev/artworks/aurora.webp");
  });

  await test("mediaService validates empty buffer and rejects with MediaValidationError", async () => {
    await assert.rejects(
      async () => {
        await mediaService.upload({
          buffer: Buffer.alloc(0),
          filename: "empty.jpg",
          mimeType: "image/jpeg",
        });
      },
      (err: any) => err instanceof MediaValidationError
    );
  });

  await test("mediaService returns health check status without leaking secrets", async () => {
    const health = await mediaService.getHealth();
    assert.equal(health.status, "healthy");
    assert.equal(health.activeProvider, "imagekit");
    assert.equal(typeof health.providers.imagekit.enabled, "boolean");
    assert.equal(typeof health.providers.cloudflare.enabled, "boolean");
    // Verify no secret keys leaked in health object
    const serialized = JSON.stringify(health);
    assert.equal(serialized.includes("privateKey"), false);
    assert.equal(serialized.includes("secretAccessKey"), false);
  });

  // Summary
  console.log("\n=================================================");
  console.log(`  Tests Completed: ${passed + failed} | Passed: ${passed} | Failed: ${failed}`);
  console.log("=================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test runner failed:", err);
  process.exit(1);
});
