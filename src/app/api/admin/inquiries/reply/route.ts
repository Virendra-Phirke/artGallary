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

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error in admin inquiry reply:", err);
    return NextResponse.json({ error: err.message || "Failed to send email" }, { status: 500 });
  }
}
