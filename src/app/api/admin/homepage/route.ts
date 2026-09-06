import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { getAllHomepageSectionsAdmin, updateHomepageSection } from "@/db/repository";

export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  const sections = await getAllHomepageSectionsAdmin();
  return NextResponse.json({ success: true, sections });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  try {
    const { sections } = await request.json();
    if (!Array.isArray(sections)) {
      return NextResponse.json({ error: "Sections array is required" }, { status: 400 });
    }

    for (const sec of sections) {
      if (sec.sectionKey) {
        await updateHomepageSection(sec.sectionKey, {
          title: sec.title,
          subtitle: sec.subtitle,
          isEnabled: sec.isEnabled,
          displayOrder: sec.displayOrder,
          contentJson: sec.contentJson,
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update homepage sections" },
      { status: 500 }
    );
  }
}
