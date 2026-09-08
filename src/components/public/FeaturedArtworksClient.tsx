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
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 border-b border-[#1c1d25] pb-6 gap-6">
          <div>
            <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
              {sectionSubtitle}
            </span>
            <h2 className="font-serif text-3xl md:text-5xl text-white mt-1">
              {sectionTitle}
            </h2>
          </div>

          {/* Curatorial Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
                activeCategory === "all"
                  ? "bg-[#d1a86e] text-[#0d0e12] shadow-md shadow-[#d1a86e]/15 font-semibold"
                  : "bg-[#14151a] hover:bg-[#1f2129] text-zinc-400 hover:text-white border border-[#262833]"
              }`}
            >
              All Masterworks
            </button>
            <button
              onClick={() => setActiveCategory("available")}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
                activeCategory === "available"
                  ? "bg-[#d1a86e] text-[#0d0e12] shadow-md shadow-[#d1a86e]/15 font-semibold"
                  : "bg-[#14151a] hover:bg-[#1f2129] text-zinc-400 hover:text-white border border-[#262833]"
              }`}
            >
              Available for Acquisition
            </button>
            <button
              onClick={() => setActiveCategory("monumental")}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
                activeCategory === "monumental"
                  ? "bg-[#d1a86e] text-[#0d0e12] shadow-md shadow-[#d1a86e]/15 font-semibold"
                  : "bg-[#14151a] hover:bg-[#1f2129] text-zinc-400 hover:text-white border border-[#262833]"
              }`}
            >
              Monumental Scale
            </button>
            <button
              onClick={() => setActiveCategory("mineral")}
              className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider font-medium transition-all ${
                activeCategory === "mineral"
                  ? "bg-[#d1a86e] text-[#0d0e12] shadow-md shadow-[#d1a86e]/15 font-semibold"
                  : "bg-[#14151a] hover:bg-[#1f2129] text-zinc-400 hover:text-white border border-[#262833]"
              }`}
            >
              Mineral &amp; Lapis
            </button>
          </div>
        </div>

        {/* Artwork Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {(filteredArtworks.length > 0 ? filteredArtworks.slice(0, 6) : artworks.slice(0, 6)).map(
            (art, idx) => (
              <div
                key={art.id}
                className="group flex flex-col space-y-4 bg-[#14151a]/40 p-4 rounded-2xl border border-[#262833]/60 hover:border-[#d1a86e]/40 transition-all duration-300 hover:shadow-2xl hover:shadow-black/60"
              >
                {/* Canvas Box */}
                <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#101116] border border-[#262833]">
                  <ProgressiveImage
                    src={art.coverImageUrl}
                    alt={art.altText || art.title}
                    fill
                    priority={idx < 3}
                    optimizeWidth={700}
                    optimizeQuality={85}
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 z-10">
                    <Badge
                      variant={
                        art.status === "published"
                          ? "success"
                          : art.status === "reserved"
                          ? "warning"
                          : "secondary"
                      }
                      className="backdrop-blur-md bg-black/60 border border-white/10"
                    >
                      {art.status === "published" ? "Available" : art.status}
                    </Badge>
                  </div>

                  {/* Year / Medium Tag */}
                  <div className="absolute top-3 right-3 z-10 text-[10px] uppercase font-mono px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-zinc-300 border border-white/10">
                    {art.year}
                  </div>

                  {/* Hover Quick Action Buttons */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3 p-4">
                    <button
                      onClick={() => setInspectArtwork(art)}
                      className="p-3 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors shadow-xl"
                      title="Inspect High-Res Details"
                      aria-label={`Inspect ${art.title}`}
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    <Link
                      href={`/ar/${art.slug}`}
                      className="p-3 bg-[#d1a86e] text-[#0d0e12] rounded-full hover:bg-[#e2c18d] transition-colors shadow-xl flex items-center justify-center"
                      title="View in Your Space (AR)"
                      aria-label={`View ${art.title} in AR`}
                    >
                      <Sparkles className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                {/* Museum Exhibition Plaque */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <Link
                      href={`/artwork/${art.slug}`}
                      className="font-serif text-xl text-white group-hover:text-[#d1a86e] transition-colors line-clamp-1 font-medium"
                    >
                      {art.title}
                    </Link>
                    {art.price && (
                      <span className="text-sm text-[#d1a86e] font-mono font-medium shrink-0">
                        {formatCurrency(art.price, art.currency)}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-[#8e92a4] line-clamp-1">
                    {art.medium}
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-[#1c1d25]">
                    <span className="flex items-center gap-1">
                      <Ruler className="w-3 h-3 text-[#d1a86e]" />
                      {formatDimensions(art.widthCm, art.heightCm)}
                    </span>

                    <Link
                      href={`/ar/${art.slug}`}
                      className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider text-[#d1a86e] hover:text-[#e2c18d] transition-colors"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>AR Preview</span>
                    </Link>
                  </div>
                </div>
              </div>
            )
          )}
        </div>

        {/* View Complete Collection Footer CTA */}
        <div className="mt-14 text-center">
          <Button
            asChild
            variant="outline"
            size="lg"
            className="rounded-full border-[#383a48] bg-gradient-to-b from-[#181920] to-[#121318] hover:border-[#d1a86e] hover:bg-[#1a1c24] text-white px-9 py-4 text-xs uppercase tracking-[0.22em] shadow-2xl shadow-black/80 hover:shadow-[#d1a86e]/10 transition-all hover:scale-[1.02]"
          >
            <Link href="/account?tab=gallery" className="inline-flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-[#d1a86e]" />
              <span>Enter Collector Salon for Complete Catalogue</span>
              <ArrowRight className="w-4 h-4 text-[#d1a86e]" />
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
