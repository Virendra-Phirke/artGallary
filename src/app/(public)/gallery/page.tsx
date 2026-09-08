import React from "react";
import { getPaginatedArtworks, getCollections, getSiteSettings } from "@/db/repository";
import { GalleryCatalog } from "@/components/public/GalleryCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Art Gallery & Catalogue | Vishal Patil",
  description:
    "Explore the complete collection of fine contemporary paintings by Vishal Patil. Available for private collection acquisition with true-scale WebAR previews.",
};

export const revalidate = 3600; // Cache ISR for 1 hour with instant write-invalidation

interface GalleryPageProps {
  searchParams?: Promise<{
    page?: string;
    limit?: string;
    collection?: string;
    status?: string;
    search?: string;
    sort?: string;
  }>;
}

export default async function GalleryPage({ searchParams }: GalleryPageProps) {
  const resolvedParams = searchParams ? await searchParams : {};
  const page = Math.max(1, parseInt(resolvedParams.page || "1", 10) || 1);
  const rawLimit = parseInt(resolvedParams.limit || "10", 10) || 10;
  const limit = Math.min(100, Math.max(1, rawLimit));

  const [paginatedResult, collections, settings] = await Promise.all([
    getPaginatedArtworks({
      page,
      limit,
      status: resolvedParams.status || "all",
      collectionSlug: resolvedParams.collection || "all",
      searchQuery: resolvedParams.search || undefined,
      sortBy: (resolvedParams.sort as any) || "featured",
    }),
    getCollections(),
    getSiteSettings(),
  ]);

  const cfg = settings.galleryPageConfig;
  const eyebrow = cfg.subtitle || "The Studio Catalogue";
  const title = cfg.title || "Original Canvases & Pigments";
  const description =
    cfg.description ||
    "Each painting is an original piece created using natural mineral pigments, French lapis lazuli glazes, and raw Belgian linen. Inquire for provenance or launch the 1:1 scale WebAR viewer.";

  return (
    <div className="max-w-[1800px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16 pt-32 pb-24">
      {/* Header Plaque */}
      <div className="max-w-2xl mb-12 space-y-3">
        <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
          {eyebrow}
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-white">
          {title}
        </h1>
        <p className="text-sm text-[#a6aabf] leading-relaxed">
          {description}
        </p>
      </div>

      <GalleryCatalog
        initialArtworks={paginatedResult.artworks}
        initialPagination={paginatedResult.pagination}
        collections={collections}
      />
    </div>
  );
}
