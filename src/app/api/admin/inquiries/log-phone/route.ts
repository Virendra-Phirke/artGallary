import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { updateInquiryStatus, recordActivityLog } from "@/db/repository";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  try {
    const { inquiryId, phone, notes } = await request.json();

    if (!inquiryId) {
      return NextResponse.json({ error: "inquiryId is required" }, { status: 400 });
    }

    await updateInquiryStatus(inquiryId, "replied");
    recordActivityLog(
      "PHONE_CALL",
      "inquiry",
      `Collector contacted via direct mobile call (${phone || "N/A"})${notes ? `: ${notes}` : ""}`,
      inquiryId
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error in admin log-phone:", err);
    return NextResponse.json({ error: err.message || "Failed to log phone contact" }, { status: 500 });
  }
}
