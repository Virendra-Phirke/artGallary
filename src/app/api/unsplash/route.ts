import { NextRequest, NextResponse } from "next/server";
import { getUnsplashArtImages } from "@/lib/unsplash";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "contemporary art oil painting";
    const count = searchParams.get("count") ? parseInt(searchParams.get("count")!, 10) : 10;

    const images = await getUnsplashArtImages({ query, count });

    return NextResponse.json({
      success: true,
      count: images.length,
      images,
    });
  } catch (error: any) {
    console.error("[Unsplash API] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch Unsplash art images" },
      { status: 500 }
    );
  }
}
