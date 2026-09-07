import { NextRequest, NextResponse } from "next/server";
import { resubscribeByToken } from "@/db/repository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { token } = body;

    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const result = await resubscribeByToken(token);

    if (!result.success) {
      return NextResponse.json({ error: "Subscription record not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Subscription re-activated. You will receive upcoming studio announcements.",
      email: result.email,
    });
  } catch (err: any) {
    console.error("Resubscribe route error:", err);
    return NextResponse.json({ error: "Failed to re-subscribe" }, { status: 500 });
  }
}
