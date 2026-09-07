import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import {
  getAllExhibitionsAdmin,
  saveExhibition,
  deleteExhibition,
} from "@/db/repository";

export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  const exhibitions = await getAllExhibitionsAdmin();
  return NextResponse.json({ success: true, exhibitions });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const isUpdate = Boolean(body.id);

    if (!isUpdate) {
      if (!body.title || typeof body.title !== "string" || body.title.trim().length < 2) {
        return NextResponse.json({ error: "Exhibition title is required (min 2 characters)" }, { status: 400 });
      }

      if (!body.location || typeof body.location !== "string") {
        return NextResponse.json({ error: "Exhibition location is required" }, { status: 400 });
      }

      if (!body.startDate || !body.endDate) {
        return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 });
      }
    } else {
      if (body.title !== undefined && (typeof body.title !== "string" || body.title.trim().length < 2)) {
        return NextResponse.json({ error: "Exhibition title must be at least 2 characters" }, { status: 400 });
      }
    }

    if (body.status && !["upcoming", "current", "past"].includes(body.status)) {
      return NextResponse.json({ error: "Invalid status. Must be 'upcoming', 'current', or 'past'" }, { status: 400 });
    }

    const exhibition = await saveExhibition(body);
    return NextResponse.json({ success: true, exhibition });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to save exhibition" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  const { searchParams } = request.nextUrl;
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Exhibition ID is required" }, { status: 400 });
  }

  const deleted = await deleteExhibition(id);
  return NextResponse.json({ success: deleted });
}
