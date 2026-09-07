import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/auth";
import {
  getUserMarketingPreference,
  updateUserMarketingPreference,
} from "@/db/repository";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const marketingSubscribed = await getUserMarketingPreference(session.user.id);
  return NextResponse.json({ success: true, marketingSubscribed });
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { marketingSubscribed } = body;

    if (typeof marketingSubscribed !== "boolean") {
      return NextResponse.json(
        { error: "marketingSubscribed must be a boolean" },
        { status: 400 }
      );
    }

    const ok = await updateUserMarketingPreference(session.user.id, marketingSubscribed);
    if (!ok) {
      return NextResponse.json({ error: "Failed to update preference" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      marketingSubscribed,
      message: marketingSubscribed
        ? "You are now subscribed to studio dispatches."
        : "You have been unsubscribed from marketing dispatches.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
