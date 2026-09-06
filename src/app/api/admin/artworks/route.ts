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
