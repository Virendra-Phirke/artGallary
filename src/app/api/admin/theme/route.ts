import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { getThemeSettings, updateThemeSettings } from "@/db/repository";

export async function GET() {
  const theme = await getThemeSettings();
  return NextResponse.json({ success: true, theme });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const updated = await updateThemeSettings(body);
    return NextResponse.json({ success: true, theme: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to update theme settings" },
      { status: 500 }
    );
  }
}
