import { NextRequest, NextResponse } from "next/server";
import { getSession, updateAdminCredentials } from "@/lib/auth/auth";

export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    user: session.user,
  });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { name, email, currentPassword, newPassword } = body;

    const result = await updateAdminCredentials(session.user.id, {
      name,
      email,
      currentPassword,
      newPassword,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update admin credentials" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: result.user,
    });
  } catch (error: any) {
    console.error("Failed to update admin profile:", error);
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
