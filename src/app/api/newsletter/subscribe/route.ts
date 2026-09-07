import { NextRequest, NextResponse } from "next/server";
import { subscribeGuestEmail } from "@/db/repository";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { email, name, source } = body;

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 });
    }

    const result = await subscribeGuestEmail(email, name, source || "footer");

    if (!result.success) {
      return NextResponse.json({ error: result.error || "Subscription failed" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "You have been successfully enrolled in Elena Vance studio dispatches.",
    });
  } catch (err: any) {
    console.error("Subscribe route error:", err);
    return NextResponse.json({ error: err.message || "Failed to subscribe" }, { status: 500 });
  }
}
