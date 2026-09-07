import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { createInquiry } from "@/db/repository";
import { getInquiryLimiter, checkRateLimit } from "@/lib/redis/ratelimit";

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: "Authentication required to submit an inquiry" },
        { status: 401 }
      );
    }

    // Upstash Sliding-Window Rate Limiting (5 inquiries per hour per IP/user)
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      session.user.id;
    const rateLimit = await checkRateLimit(getInquiryLimiter(), clientIp);

    if (!rateLimit.success) {
      const retryAfterSec = Math.max(1, Math.ceil((rateLimit.reset - Date.now()) / 1000));
      return NextResponse.json(
        {
          error: "Too many inquiries submitted. Please wait before submitting another inquiry.",
          retryAfter: retryAfterSec,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(retryAfterSec),
            "X-RateLimit-Limit": String(rateLimit.limit),
            "X-RateLimit-Remaining": String(rateLimit.remaining),
          },
        }
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
