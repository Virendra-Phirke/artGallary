"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Ruler,
  Layers,
  Compass,
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { ArtworkQuickViewModal } from "@/components/public/ArtworkQuickViewModal";

interface HeroShowcaseClientProps {
  artworks: MockArtwork[];
  heroBadge?: string;
  heroTitle?: string;
  heroDescription?: string;
  primaryCtaText?: string;
  primaryCtaUrl?: string;
  customHeroImage?: string;
  heroImages?: string[];
  heroSlideCount?: number;
  heroArtworkIds?: string[];
}

export function HeroShowcaseClient({
  artworks,
  heroBadge = "Spring 2026 Collection",
  heroTitle = "The Architecture of Luminous Stillness",
  heroDescription = "Original fine artworks by Vishal Patil. Exploring the threshold where lapis lazuli glazes, crushed mineral earth, and oceanic silence alter the atmospheric presence of space.",
  primaryCtaText = "Explore Curated Catalog",
  primaryCtaUrl = "/gallery",
  customHeroImage,
  heroImages,
  heroSlideCount,
  heroArtworkIds,
}: HeroShowcaseClientProps) {
  const slideCount = Math.max(1, Math.min(6, heroSlideCount ?? 4));

  // Build slide items based on slideCount and optional custom artwork assignments
  const showcaseWorks = Array.from({ length: slideCount }).map((_, idx) => {
    const linkedArtId = heroArtworkIds?.[idx];
    const linkedArt = linkedArtId
      ? artworks.find((a) => a.id === linkedArtId) || artworks[idx] || artworks[0]
      : artworks[idx] || artworks[0];
    return linkedArt;
  }).filter(Boolean) as MockArtwork[];

  const [activeIndex, setActiveIndex] = useState(0);
  const [quickViewArtwork, setQuickViewArtwork] = useState<MockArtwork | null>(null);

  const safeIndex = activeIndex >= showcaseWorks.length ? 0 : activeIndex;
  const activeArtwork = showcaseWorks[safeIndex] || artworks[0];

  const customImgForSlide =
    heroImages?.[safeIndex] ||
    (safeIndex === 0 ? customHeroImage : undefined);

  const displayImage =
    customImgForSlide ||
    activeArtwork?.coverImageUrl ||
    customHeroImage ||
    "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490";

  // Auto cycle slowly every 9 seconds if user hasn't interacted, with clean cleanup
  useEffect(() => {
    if (showcaseWorks.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % showcaseWorks.length);
    }, 9000);
    return () => clearInterval(timer);
  }, [showcaseWorks.length]);

  return (
    <>
      <section className="relative min-h-[92vh] flex items-center justify-center pt-28 xs:pt-32 sm:pt-36 pb-12 sm:pb-16 px-3.5 sm:px-10 md:px-14 lg:px-16 overflow-hidden w-full max-w-full">
        {/* Subtle Ambient Light Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[700px] h-[280px] sm:h-[700px] bg-[#d1a86e]/8 rounded-full blur-[120px] sm:blur-[160px] pointer-events-none" />

        <div className="max-w-[1800px] mx-auto w-full min-w-0 grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Left Hero Narrative */}
          <div className="lg:col-span-6 space-y-3.5 sm:space-y-6 md:space-y-8 z-10 w-full min-w-0">
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3.5 py-1 rounded-full bg-[#18191e] text-[9px] xs:text-[10px] sm:text-[11px] tracking-[0.18em] sm:tracking-[0.25em] text-[#d1a86e] uppercase max-w-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e] animate-pulse shrink-0" />
              <span className="truncate">{heroBadge}</span>
            </div>

            <h1 className="font-serif text-2xl xs:text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.15] sm:leading-[1.08] text-white tracking-tight font-medium break-words">
              {heroTitle}
            </h1>

            <p className="text-xs sm:text-sm md:text-base text-[#a6aabf] max-w-lg leading-relaxed font-light break-words">
              {heroDescription}
            </p>

            <div className="pt-1 sm:pt-2 flex flex-wrap items-center gap-2 sm:gap-3 w-full min-w-0">
              <Button
                asChild
                className="rounded-full bg-gradient-to-r from-[#d1a86e] via-[#e2c18d] to-[#b98e54] text-[#0d0e12] px-3.5 sm:px-6 py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-[0.18em] shadow-md shadow-[#d1a86e]/20 hover:shadow-[#d1a86e]/30 transition-all h-7.5 sm:h-9 active:scale-[0.98] w-auto inline-flex shrink-0"
              >
                <Link
                  href={primaryCtaUrl || "/account"}
                  className="flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[#0d0e12] shrink-0" />
                  <span className="truncate">{primaryCtaText || "Collector Portal"}</span>
                  <ArrowRight className="w-3 h-3 shrink-0" />
                </Link>
              </Button>

              {activeArtwork && (
                <Button
                  asChild
                  variant="secondary"
                  className="rounded-full bg-[#14151a]/90 hover:bg-[#1f212a] text-white px-3 sm:px-5 py-1.5 sm:py-2.5 text-[10px] sm:text-xs font-medium uppercase tracking-wider sm:tracking-[0.18em] backdrop-blur-md transition-all shadow-sm h-7.5 sm:h-9 active:scale-[0.98] w-auto inline-flex shrink-0"
                >
                  <Link
                    href={`/ar/${activeArtwork.slug}`}
                    className="flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3 h-3 text-[#d1a86e] shrink-0" />
                    <span className="truncate">View in AR</span>
                  </Link>
                </Button>
              )}
            </div>

            {/* Curatorial Highlights Metrics - 3 columns */}
            <div className="pt-4 sm:pt-8 grid grid-cols-3 gap-1.5 sm:gap-6 text-left w-full min-w-0">
              <div className="min-w-0">
                <span className="block font-serif text-base sm:text-2xl text-white truncate">20+</span>
                <span className="text-[7.5px] xs:text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase text-zinc-500 block truncate">
                  Oil Glaze Layers
                </span>
              </div>
              <div className="min-w-0">
                <span className="block font-serif text-base sm:text-2xl text-white truncate">1:1</span>
                <span className="text-[7.5px] xs:text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase text-zinc-500 block truncate">
                  Spatial Scale AR
                </span>
              </div>
              <div className="min-w-0">
                <span className="block font-serif text-base sm:text-2xl text-white truncate">Paris</span>
                <span className="text-[7.5px] xs:text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase text-zinc-500 block truncate">
                  Atelier &amp; Studio
                </span>
              </div>
            </div>
          </div>

          {/* Right Hero: Dynamic Masterpiece Plaque & Carousel */}
          <div className="lg:col-span-6 relative flex flex-col items-center z-10 w-full min-w-0">
            <div className="relative group w-full max-w-lg min-w-0">
              {/* Frame & Canvas Presentation */}
              <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-[#14151a] shadow-2xl shadow-black/90 group">
                <ProgressiveImage
                  src={displayImage}
                  alt={activeArtwork?.altText || heroTitle}
                  fill
                  priority
                  optimizeWidth={1200}
                  optimizeQuality={90}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Interactive Overlay on Hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6">
                  {activeArtwork && (
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setQuickViewArtwork(activeArtwork)}
                        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md text-xs uppercase tracking-wider text-white transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#d1a86e]" />
                        <span>Inspect Details</span>
                      </button>

                      <Link
                        href={`/artwork/${activeArtwork.slug}`}
                        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-[#d1a86e] hover:text-[#e2c18d] transition-colors"
                      >
                        <span>Examine</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              {/* Masterpiece Specification Plaque */}
              {activeArtwork && (
                <div className="mt-3 sm:mt-4 p-3 sm:p-4 rounded-xl bg-[#14151a]/95 backdrop-blur-md flex items-center justify-between shadow-xl w-full min-w-0">
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif text-sm sm:text-lg text-white font-medium truncate">
                        {activeArtwork.title}
                      </h2>
                      {activeArtwork.price && (
                        <span className="text-[11px] sm:text-xs text-[#d1a86e] font-mono shrink-0">
                          {formatCurrency(activeArtwork.price, activeArtwork.currency)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    <button
                      onClick={() => setQuickViewArtwork(activeArtwork)}
                      className="p-1.5 sm:p-2 rounded-full bg-[#1c1d25] hover:bg-[#262833] text-zinc-300 hover:text-white transition-colors"
                      title="Quick inspection"
                      aria-label="Inspect artwork details"
                    >
                      <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>

                    <Link
                      href={`/ar/${activeArtwork.slug}`}
                      className="flex items-center gap-1 text-[10px] sm:text-xs tracking-wider uppercase text-[#d1a86e] hover:text-white transition-colors bg-[#1a1c23] px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full"
                    >
                      <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5" />
                      <span>AR</span>
                    </Link>
                  </div>
                </div>
              )}

              {/* Multi-piece Showcase Selectors (if multiple artworks available) */}
              {showcaseWorks.length > 1 && (
                <div className="mt-3 flex items-center justify-between px-2 text-xs text-zinc-400">
                  <div className="flex items-center gap-1.5">
                    {showcaseWorks.map((work, idx) => (
                      <button
                        key={`${work.id}-${idx}`}
                        onClick={() => setActiveIndex(idx)}
                        className={`transition-all rounded-full ${
                          safeIndex === idx
                            ? "w-7 h-2 bg-[#d1a86e]"
                            : "w-2 h-2 bg-zinc-700 hover:bg-zinc-500"
                        }`}
                        aria-label={`Select masterpiece ${idx + 1}: ${work.title}`}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        setActiveIndex(
                          (prev) =>
                            (prev - 1 + showcaseWorks.length) % showcaseWorks.length
                        )
                      }
                      className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      aria-label="Previous artwork"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-[11px] font-mono text-zinc-500">
                      0{safeIndex + 1} / 0{showcaseWorks.length}
                    </span>
                    <button
                      onClick={() =>
                        setActiveIndex(
                          (prev) => (prev + 1) % showcaseWorks.length
                        )
                      }
                      className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                      aria-label="Next artwork"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      <ArtworkQuickViewModal
        artwork={quickViewArtwork}
        isOpen={!!quickViewArtwork}
        onClose={() => setQuickViewArtwork(null)}
      />
    </>
  );
}
