import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { sendAdminInquiryReply } from "@/lib/email/resend";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  try {
    const { inquiryId, recipientEmail, recipientName, subject, message } = await request.json();

    if (!inquiryId || !recipientEmail || !message?.trim()) {
      return NextResponse.json(
        { error: "inquiryId, recipientEmail, and message are required" },
        { status: 400 }
      );
    }

    const result = await sendAdminInquiryReply({
      inquiryId,
      recipientEmail,
      recipientName: recipientName || "Collector",
      subject: subject || "Re: Artwork Inquiry",
      messageText: message.trim(),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Email delivery failed with provider" },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err: unknown) {
    console.error("Error in admin inquiry reply:", err);
    const message = err instanceof Error ? err.message : "Failed to send email";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
