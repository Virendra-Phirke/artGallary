import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { getMediaItems, getMediaItemRaw, deleteMediaItem, recordActivityLog } from "@/db/repository";
import { getDb, schema } from "@/db";
import { mediaService } from "@/modules/media";
import type { MediaProviderName } from "@/modules/media/media.types";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const items = await getMediaItems();
    return NextResponse.json({ success: true, media: items });
  } catch (error: any) {
    console.error("[Admin Media GET API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch media assets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const {
      fileName,
      fileUrl,
      fileKey,
      mimeType = "image/webp",
      byteSize = 1500000,
      width = 2400,
      height = 1800,
      provider = "cloudflare",
    } = body;

    if (!fileName || !fileUrl) {
      return NextResponse.json(
        { error: "fileName and fileUrl are required" },
        { status: 400 }
      );
    }

    const db = getDb();
    if (!db) {
      return NextResponse.json(
        { error: "Database unavailable" },
        { status: 500 }
      );
    }

    const generatedKey =
      fileKey || `imported/${Date.now()}-${fileName.toLowerCase().replace(/[^a-z0-9.]/g, "-")}`;
    const aspectRatio = (Number(width) / Number(height || 1)).toFixed(4);

    const inserted = await db
      .insert(schema.media)
      .values({
        fileName,
        fileUrl,
        fileKey: generatedKey,
        mimeType,
        byteSize: Number(byteSize),
        width: Number(width),
        height: Number(height),
        aspectRatio,
        provider,
        migrationStatus: "verified",
        variantsJson: {
          original: fileUrl,
          optimized: fileUrl,
          thumbnail: fileUrl,
          arTexture: fileUrl,
        },
      })
      .returning();

    const created = inserted[0];
    recordActivityLog(
      "IMPORT_MEDIA",
      "media",
      `Imported media asset: ${fileName}`,
      created?.id
    );

    return NextResponse.json({
      success: true,
      media: {
        id: created.id,
        fileName: created.fileName,
        fileUrl: created.fileUrl,
        fileKey: created.fileKey,
        mimeType: created.mimeType,
        dimensions: `${created.width} × ${created.height} px`,
        byteSize: `${(created.byteSize / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: "Just now",
        provider: created.provider,
        migrationStatus: created.migrationStatus,
      },
    });
  } catch (error: any) {
    console.error("[Admin Media POST API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to register media asset" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Asset id is required" },
        { status: 400 }
      );
    }

    // 1. Fetch the full media row to get provider details before deleting
    const mediaRow = await getMediaItemRaw(id);
    if (!mediaRow) {
      return NextResponse.json(
        { error: "Media asset not found" },
        { status: 404 }
      );
    }

    const provider = (mediaRow.provider || "imagekit") as MediaProviderName;
    const providerAssetId = mediaRow.providerAssetId || mediaRow.fileKey || "";
    const fileKey = mediaRow.fileKey || "";
    const variants = mediaRow.variantsJson as {
      original?: string;
      optimized?: string;
      thumbnail?: string;
      arTexture?: string;
    } | null;

    let sourceDeleted = false;
    let sourceError: string | null = null;

    // 2. Attempt to delete from the source storage provider
    try {
      if (provider === "cloudflare") {
        // For Cloudflare R2, collect all variant object keys for thorough cleanup
        const variantKeys: string[] = [];

        // The fileKey is typically the primary object key
        if (fileKey && !fileKey.startsWith("imported/")) {
          variantKeys.push(fileKey);
        }

        // Extract R2 object keys from variant URLs
        if (variants) {
          for (const variantUrl of Object.values(variants)) {
            if (!variantUrl || typeof variantUrl !== "string") continue;
            // Extract object key from full URL: https://bucket.r2.dev/artworks/cover/123-name.webp → artworks/cover/123-name.webp
            const urlObj = safeParseUrl(variantUrl);
            if (urlObj) {
              const key = urlObj.pathname.replace(/^\//, "");
              if (key && !variantKeys.includes(key)) {
                variantKeys.push(key);
              }
            } else if (variantUrl.startsWith("artworks/") || variantUrl.startsWith("artists/")) {
              if (!variantKeys.includes(variantUrl)) {
                variantKeys.push(variantUrl);
              }
            }
          }
        }

        if (variantKeys.length > 0) {
          // Use the provider's multi-key delete for thorough cleanup
          const { CloudflareR2Provider } = await import("@/modules/media/providers/cloudflare/cloudflare.provider");
          const cfProvider = new CloudflareR2Provider();
          const result = await cfProvider.deleteMultipleKeys(variantKeys);
          sourceDeleted = result.deleted > 0;
          if (result.errors.length > 0) {
            sourceError = `Partial cleanup: ${result.errors.length} keys failed`;
          }
        } else {
          // Fallback to single-key delete via mediaService
          await mediaService.delete(providerAssetId, provider, fileKey);
          sourceDeleted = true;
        }
      } else if (provider === "imagekit") {
        // ImageKit uses providerAssetId (fileId) for deletion
        if (providerAssetId) {
          await mediaService.delete(providerAssetId, provider);
          sourceDeleted = true;
        }
      }
    } catch (providerErr: any) {
      console.error(`[Admin Media DELETE] Source deletion from ${provider} failed:`, providerErr);
      sourceError = providerErr?.message || `Failed to delete from ${provider}`;
      // Continue to delete DB record even if source deletion fails
    }

    // 3. Delete the database record
    const dbDeleted = await deleteMediaItem(id);
    if (!dbDeleted) {
      return NextResponse.json(
        { error: "Failed to delete media database record" },
        { status: 500 }
      );
    }

    // 4. Log the permanent deletion with provider details
    recordActivityLog(
      "PERMANENT_DELETE_MEDIA",
      "media",
      `Permanently deleted media "${mediaRow.fileName}" from ${provider}${sourceDeleted ? " (source purged)" : " (DB only)"}`,
      id
    );

    return NextResponse.json({
      success: true,
      deletedId: id,
      provider,
      sourceDeleted,
      sourceError,
    });
  } catch (error: any) {
    console.error("[Admin Media DELETE API] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete media asset" },
      { status: 500 }
    );
  }
}

/** Safely parse a URL string, returning null on failure */
function safeParseUrl(urlStr: string): URL | null {
  try {
    return new URL(urlStr);
  } catch {
    return null;
  }
}
