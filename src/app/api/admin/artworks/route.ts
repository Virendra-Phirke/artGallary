import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import {
  getAllArtworksAdmin,
  saveArtwork,
  archiveArtwork,
  getArtworkById,
} from "@/db/repository";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  const artworks = await getAllArtworksAdmin();
  return NextResponse.json({ success: true, artworks });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (!body.title || typeof body.title !== "string" || body.title.trim().length < 2) {
      return NextResponse.json({ error: "Artwork title is required" }, { status: 400 });
    }

    // Validate AR configuration parameters
    if (body.arConfig) {
      const minScale = Number(body.arConfig.minScale ?? 0.5);
      const maxScale = Number(body.arConfig.maxScale ?? 2.0);
      if (
        isNaN(minScale) ||
        isNaN(maxScale) ||
        minScale < 0.1 ||
        maxScale > 5.0 ||
        minScale > maxScale
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid AR scale bounds. minScale must be >= 0.1 and <= maxScale (up to 5.0)",
          },
          { status: 400 }
        );
      }
      if (
        body.arConfig.placementMode &&
        !["wall", "floor"].includes(body.arConfig.placementMode)
      ) {
        return NextResponse.json(
          { error: "Invalid placementMode. Must be 'wall' or 'floor'" },
          { status: 400 }
        );
      }
    }

    const artwork = await saveArtwork(body);
    return NextResponse.json({ success: true, artwork });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to save artwork" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Artwork ID is required" }, { status: 400 });
  }

  const archived = await archiveArtwork(id);
  return NextResponse.json({ success: archived });
}
