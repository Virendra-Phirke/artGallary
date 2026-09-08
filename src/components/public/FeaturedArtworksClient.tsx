"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  Eye,
  SlidersHorizontal,
  Layers,
  Ruler,
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { ArtworkQuickViewModal } from "@/components/public/ArtworkQuickViewModal";

interface FeaturedArtworksClientProps {
  artworks: MockArtwork[];
  sectionTitle?: string;
  sectionSubtitle?: string;
}

type FilterCategory = "all" | "monumental" | "available" | "mineral";

export function FeaturedArtworksClient({
  artworks,
  sectionTitle = "Selected Works",
  sectionSubtitle = "Curated Catalogue",
}: FeaturedArtworksClientProps) {
  const [activeCategory, setActiveCategory] = useState<FilterCategory>("all");
  const [inspectArtwork, setInspectArtwork] = useState<MockArtwork | null>(null);

  const filteredArtworks = useMemo(() => {
    switch (activeCategory) {
      case "monumental":
        return artworks.filter(
          (a) => (a.widthCm && a.widthCm >= 100) || (a.heightCm && a.heightCm >= 100)
        );
      case "available":
        return artworks.filter((a) => a.status === "published");
      case "mineral":
        return artworks.filter((a) => {
          const m = (a.medium || "").toLowerCase();
          const d = (a.description || "").toLowerCase();
          return (
            m.includes("lapis") ||
            m.includes("mineral") ||
            m.includes("pigment") ||
            d.includes("mineral") ||
            d.includes("lapis")
          );
        });
      case "all":
      default:
        return artworks;
    }
  }, [artworks, activeCategory]);

  return (
    <>
      <section className="max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 w-full max-w-full overflow-hidden">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 sm:mb-8 pb-4 sm:pb-6 gap-4 sm:gap-6 w-full min-w-0 border-b border-[#1c1d25]">
          <div>
            <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
              {sectionSubtitle}
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl md:text-5xl text-white mt-1">
              {sectionTitle}
            </h2>
          </div>

          {/* Quick Categories Filter */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none w-full max-w-full min-w-0">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase transition-colors cursor-pointer shrink-0 ${
                activeCategory === "all"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold"
                  : "bg-[#14151a] text-zinc-400 hover:text-white"
              }`}
            >
              All Works
            </button>
            <button
              onClick={() => setActiveCategory("available")}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase transition-colors cursor-pointer shrink-0 ${
                activeCategory === "available"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold"
                  : "bg-[#14151a] text-zinc-400 hover:text-white"
              }`}
            >
              Available
            </button>
            <button
              onClick={() => setActiveCategory("monumental")}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase transition-colors cursor-pointer shrink-0 ${
                activeCategory === "monumental"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold"
                  : "bg-[#14151a] text-zinc-400 hover:text-white"
              }`}
            >
              Monumental
            </button>
            <button
              onClick={() => setActiveCategory("mineral")}
              className={`px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs tracking-wider uppercase transition-colors cursor-pointer shrink-0 ${
                activeCategory === "mineral"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold"
                  : "bg-[#14151a] text-zinc-400 hover:text-white"
              }`}
            >
              Mineral &amp; Lapis
            </button>
          </div>
        </div>

        {/* Artwork Grid - 2 columns on mobile */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-2.5 sm:gap-6 md:gap-8 w-full min-w-0">
          {(filteredArtworks.length > 0 ? filteredArtworks.slice(0, 6) : artworks.slice(0, 6)).map(
            (art, idx) => (
              <div
                key={art.id}
                className="group flex flex-col space-y-2.5 sm:space-y-4 bg-[#14151a] border border-[#262833] p-2.5 sm:p-4 rounded-xl sm:rounded-2xl transition-all duration-300 shadow-xl shadow-black/40 hover:border-[#d1a86e]/40 hover:shadow-2xl"
              >
                {/* Canvas Box */}
                <div className="relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-[#101116]">
                  <ProgressiveImage
                    src={art.coverImageUrl}
                    alt={art.altText || art.title}
                    fill
                    priority={idx < 3}
                    optimizeWidth={700}
                    optimizeQuality={85}
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Hover Quick Action Buttons */}
                  <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 sm:gap-3 p-2 sm:p-4">
                    <button
                      onClick={() => setInspectArtwork(art)}
                      className="p-2 sm:p-3 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors shadow-xl cursor-pointer"
                      title="Inspect Details"
                      aria-label={`Inspect ${art.title}`}
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    <Link
                      href={`/ar/${art.slug}`}
                      className="p-2 sm:p-3 bg-[#d1a86e] text-[#0d0e12] rounded-full hover:bg-[#e2c18d] transition-colors shadow-xl flex items-center justify-center"
                      title="View in Your Space (AR)"
                      aria-label={`View ${art.title} in AR`}
                    >
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Link>
                  </div>
                </div>

                {/* Clean Metadata: Name & Price Only */}
                <div className="pt-0.5 px-0.5">
                  <div className="flex items-baseline justify-between gap-1.5">
                    <Link
                      href={`/artwork/${art.slug}`}
                      className="font-serif text-xs sm:text-base text-white group-hover:text-[#d1a86e] transition-colors line-clamp-1 font-medium"
                    >
                      {art.title}
                    </Link>
                    {art.price && (
                      <span className="text-xs sm:text-sm text-[#d1a86e] font-mono font-semibold shrink-0">
                        {formatCurrency(art.price, art.currency)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* View Complete Collection Footer CTA */}
        <div className="mt-8 sm:mt-14 text-center px-2">
          <Button
            asChild
            variant="outline"
            className="rounded-full border-[#383a48] bg-gradient-to-b from-[#181920] to-[#121318] hover:border-[#d1a86e] hover:bg-[#1a1c24] text-white h-8 sm:h-10 px-3.5 sm:px-7 text-[10px] sm:text-xs uppercase tracking-wider sm:tracking-[0.2em] shadow-xl shadow-black/80 hover:shadow-[#d1a86e]/10 transition-all active:scale-[0.98] w-auto inline-flex"
          >
            <Link href="/account?tab=gallery" className="inline-flex items-center gap-1.5 sm:gap-2">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d1a86e] shrink-0" />
              <span className="hidden sm:inline">Explore Full Private Catalogue</span>
              <span className="inline sm:hidden">Full Private Catalogue</span>
              <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d1a86e] shrink-0" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Quick View Modal */}
      <ArtworkQuickViewModal
        artwork={inspectArtwork}
        isOpen={!!inspectArtwork}
        onClose={() => setInspectArtwork(null)}
      />
    </>
  );
}
