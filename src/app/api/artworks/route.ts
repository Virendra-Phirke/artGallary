import { NextRequest, NextResponse } from "next/server";
import { getPaginatedArtworks } from "@/db/repository";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10) || 1);
    const rawLimit = parseInt(searchParams.get("limit") || "10", 10) || 10;
    // Standardize to supported limits: 10, 20, 50, 100 (or clamp between 1 and 100)
    const limit = Math.min(100, Math.max(1, rawLimit));

    const status = searchParams.get("status") || "all";
    const collectionSlug = searchParams.get("collection") || "all";
    const medium = searchParams.get("medium") || undefined;
    const searchQuery = searchParams.get("search") || undefined;
    const sortBy = (searchParams.get("sort") as any) || "featured";

    const result = await getPaginatedArtworks({
      page,
      limit,
      status,
      collectionSlug,
      medium,
      searchQuery,
      sortBy,
    });

    return NextResponse.json(
      {
        success: true,
        artworks: result.artworks,
        pagination: result.pagination,
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (error: any) {
    console.error("[API /api/artworks] Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch paginated artworks" },
      { status: 500 }
    );
  }
}
