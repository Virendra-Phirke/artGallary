import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import { getInquiries, updateInquiryStatus, getSentEmails } from "@/db/repository";

export async function GET() {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  const [inquiries, sentEmails] = await Promise.all([
    getInquiries(),
    getSentEmails(100),
  ]);
  return NextResponse.json({ success: true, inquiries, sentEmails });
}

export async function PATCH(request: NextRequest) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden: Admin required" }, { status: 403 });
  }

  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "id and status are required" }, { status: 400 });
    }

    const updated = await updateInquiryStatus(id, status);
    return NextResponse.json({ success: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update inquiry" }, { status: 500 });
  }
}
