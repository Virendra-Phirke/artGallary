import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { createInquiry } from "@/db/repository";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required to submit an inquiry" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { artworkId, name, email, phone, subject, message } = body;

    if (!message || message.trim().length < 5) {
      return NextResponse.json(
        { error: "Please enter a substantive inquiry message" },
        { status: 400 }
      );
    }

    const inquiry = await createInquiry({
      userId: session.user.id,
      artworkId,
      name: name || session.user.name,
      email: email || session.user.email,
      phone,
      subject,
      message,
    });

    return NextResponse.json({ success: true, inquiry });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to submit inquiry" },
      { status: 500 }
    );
  }
}
