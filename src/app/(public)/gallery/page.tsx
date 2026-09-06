import React from "react";
import { getArtworks, getCollections } from "@/db/repository";
import { GalleryCatalog } from "@/components/public/GalleryCatalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Art Gallery & Catalogue | Elena Vance",
  description:
    "Explore the complete collection of fine contemporary paintings by Elena Vance. Available for private collection acquisition with true-scale WebAR previews.",
};

export default async function GalleryPage() {
  const [artworks, collections] = await Promise.all([
    getArtworks(),
    getCollections(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24">
      {/* Header Plaque */}
      <div className="max-w-2xl mb-12 space-y-3">
        <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
          The Studio Catalogue
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-white">
          Original Canvases &amp; Pigments
        </h1>
        <p className="text-sm text-[#a6aabf] leading-relaxed">
          Each painting is an original piece created using natural mineral pigments, French lapis lazuli glazes, and raw Belgian linen. Inquire for provenance or launch the 1:1 scale WebAR viewer.
        </p>
      </div>

      <GalleryCatalog initialArtworks={artworks} collections={collections} />
    </div>
  );
}
