import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/auth";
import { getSiteSettings, updateSiteSettings } from "@/db/repository";

export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  const settings = await getSiteSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = await updateSiteSettings(body);
    
    // Immediately revalidate public storefront layout so new gallery name applies instantly
    try {
      revalidatePath("/", "layout");
      revalidatePath("/");
      revalidatePath("/gallery");
      revalidatePath("/about");
      revalidatePath("/contact");
    } catch {}

    return NextResponse.json({ success: true, settings: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update site settings" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  return POST(request);
}
