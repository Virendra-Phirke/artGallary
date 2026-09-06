import { NextRequest, NextResponse } from "next/server";
import { mediaService, MediaTransform } from "@/modules/media";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { searchParams } = new URL(request.url);

    const width = searchParams.get("w") ? Number(searchParams.get("w")) : undefined;
    const height = searchParams.get("h") ? Number(searchParams.get("h")) : undefined;
    const quality = searchParams.get("q") ? Number(searchParams.get("q")) : undefined;
    const format = searchParams.get("f") as any;

    const transform: MediaTransform = {
      width,
      height,
      quality,
      format,
    };

    const resolvedUrl = mediaService.getUrl(
      {
        providerAssetId: id,
        objectKey: id.startsWith("artworks/") ? id : undefined,
      },
      transform
    );

    // Redirect client directly to the optimized CDN asset URL
    return NextResponse.redirect(resolvedUrl, 307);
  } catch (error: any) {
    console.error("[Media GET API] Error:", error);
    return NextResponse.json(
      { error: "Media asset resolution failed" },
      { status: 404 }
    );
  }
}
