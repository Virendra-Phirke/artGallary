import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { getMediaItems, deleteMediaItem, recordActivityLog } from "@/db/repository";
import { getDb, schema } from "@/db";

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

    const deleted = await deleteMediaItem(id);
    if (!deleted) {
      return NextResponse.json(
        { error: "Asset not found or failed to delete" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error("[Admin Media DELETE API] Error:", error);
    return NextResponse.json(
      { error: "Failed to delete media asset" },
      { status: 500 }
    );
  }
}
