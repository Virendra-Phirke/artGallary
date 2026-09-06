import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { mediaService, MediaRole, MediaProviderName } from "@/modules/media";
import { recordActivityLog } from "@/db/repository";
import { getDb, schema } from "@/db";

export const maxDuration = 60; // 60 seconds timeout for high-res image processing

export async function POST(request: NextRequest) {
  try {
    // 1. Enforce strict Admin authorization server-side
    const session = await getSession();
    if (!session?.user || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Unauthorized: Admin privileges required for media uploads" },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const providerOverride = formData.get("provider") as MediaProviderName | null;
    const role = (formData.get("role") as MediaRole) || "gallery";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Maximum 30MB validation
    if (file.size > 30 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File exceeds maximum size limit of 30MB" },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. Process and upload via provider-independent MediaService
    const asset = await mediaService.upload(
      {
        buffer,
        filename: file.name,
        mimeType: file.type || "image/jpeg",
        role,
      },
      providerOverride || undefined
    );

    // 3. Persist media record to Neon PostgreSQL
    let persistedAsset = { ...asset };
    const db = getDb();
    if (db) {
      try {
        const fileUrl = asset.variants?.optimized || asset.variants?.original || "";
        const variantsJson = asset.variants
          ? {
              original: asset.variants.original,
              optimized: asset.variants.optimized,
              thumbnail: asset.variants.thumbnail,
              arTexture: asset.variants.arTexture,
            }
          : undefined;

        const valuesToInsert: typeof schema.media.$inferInsert = {
          provider: asset.provider,
          providerAssetId: asset.providerAssetId,
          fileName: asset.filename,
          fileKey: asset.objectKey || `artworks/${Date.now()}-${asset.filename}`,
          fileUrl,
          mimeType: asset.mimeType,
          byteSize: asset.size,
          width: asset.width || 2400,
          height: asset.height || 1800,
          aspectRatio: String(asset.aspectRatio),
          blurDataUrl: asset.blurDataUrl,
          migrationStatus: "verified",
          variantsJson,
        };

        const inserted = await db
          .insert(schema.media)
          .values(valuesToInsert)
          .returning({ id: schema.media.id });

        if (inserted[0]?.id) {
          persistedAsset.id = inserted[0].id;
        }
      } catch (dbErr) {
        console.error("[Upload API] Failed to save media row to DB:", dbErr);
      }
    }

    recordActivityLog(
      "UPLOAD_MEDIA",
      "media",
      `Uploaded artwork media via ${asset.provider.toUpperCase()}: ${file.name} (${asset.width}x${asset.height}, ${(asset.size / 1024).toFixed(0)}KB)`,
      persistedAsset.id
    );

    return NextResponse.json({
      success: true,
      media: persistedAsset,
    });
  } catch (error: any) {
    console.error("[Upload API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process and upload artwork media" },
      { status: error.statusCode || 500 }
    );
  }
}
