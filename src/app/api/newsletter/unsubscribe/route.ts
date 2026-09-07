import { NextRequest, NextResponse } from "next/server";
import { unsubscribeByToken } from "@/db/repository";

/**
 * RFC 8058 compliant One-Click Unsubscribe Endpoint
 *
 * Handlers:
 * - POST: Used by Gmail, Yahoo, Apple Mail for native "Unsubscribe" button (RFC 8058).
 *         Body may contain "List-Unsubscribe=One-Click".
 * - GET:  Redirects human browser clicks to the editorial confirmation page.
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const token = searchParams.get("token");

    if (!token || token.trim().length < 5) {
      return NextResponse.json({ error: "Invalid or missing unsubscribe token" }, { status: 400 });
    }

    const result = await unsubscribeByToken(token);

    if (!result.success) {
      return NextResponse.json(
        { error: "Token expired or not found" },
        { status: 404 }
      );
    }

    // RFC 8058 requires a 200 OK response upon successful unsubscription
    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from studio announcements",
      email: result.email,
    });
  } catch (error: any) {
    console.error("RFC 8058 POST unsubscribe error:", error);
    return NextResponse.json({ error: "Failed to process unsubscribe request" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const token = searchParams.get("token");

  // Redirect human clicks to the elegant editorial landing page
  const redirectUrl = new URL("/unsubscribe", request.url);
  if (token) {
    redirectUrl.searchParams.set("token", token);
  }

  return NextResponse.redirect(redirectUrl);
}
