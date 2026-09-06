import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const url = searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "URL parameter is required" }, { status: 400 });
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      margin: 2,
      width: 400,
      color: {
        dark: "#0f1013",
        light: "#ffffff",
      },
    });

    return NextResponse.json({
      success: true,
      url,
      qrDataUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to generate QR code" }, { status: 500 });
  }
}
