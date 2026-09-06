import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import {
  getAllCollectionsAdmin,
  saveCollection,
  deleteCollection,
} from "@/db/repository";

export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  const collections = await getAllCollectionsAdmin();
  return NextResponse.json({ success: true, collections });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    if (!body.title || typeof body.title !== "string" || body.title.trim().length < 2) {
      return NextResponse.json({ error: "Collection title is required (min 2 characters)" }, { status: 400 });
    }

    const collection = await saveCollection(body);
    return NextResponse.json({ success: true, collection });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save collection" },
      { status: 500 }
    );
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
    return NextResponse.json({ error: "Collection ID is required" }, { status: 400 });
  }

  const deleted = await deleteCollection(id);
  return NextResponse.json({ success: deleted });
}
