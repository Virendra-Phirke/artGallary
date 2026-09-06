import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { mediaService, MediaRole, MediaProviderName } from "@/modules/media";
import { recordActivityLog } from "@/db/repository";

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

    recordActivityLog(
      "UPLOAD_MEDIA",
      "media",
      `Uploaded artwork media via ${asset.provider.toUpperCase()}: ${file.name} (${asset.width}x${asset.height}, ${(asset.size / 1024).toFixed(0)}KB)`,
      asset.id
    );

    return NextResponse.json({
      success: true,
      media: asset,
    });
  } catch (error: any) {
    console.error("[Upload API] Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process and upload artwork media" },
      { status: error.statusCode || 500 }
    );
  }
}
