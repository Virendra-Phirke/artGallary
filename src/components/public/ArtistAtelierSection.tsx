"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Compass, Sparkles, Feather, ShieldCheck } from "lucide-react";
import { ProgressiveImage } from "@/components/ui/progressive-image";

interface ArtistAtelierSectionProps {
  title?: string;
  quote?: string;
  description?: string;
  imageUrl?: string;
  subtitle?: string;
}

export function ArtistAtelierSection({
  title,
  quote = "A painting is not merely an image hanging upon a partition; it is an alteration of the atmospheric silence within a room.",
  description = "Elena Vance (b. 1986) divides her studio practice between Paris and the wind-sculpted granite coast of Brittany. Her monumental canvases investigate the physical threshold where lapis lazuli glazes, crushed mineral earth, and oceanic silence transform architectural interiors.",
  imageUrl,
  subtitle = "Studio Monologue & Philosophy",
}: ArtistAtelierSectionProps) {
  const atelierImage =
    imageUrl ||
    "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490";

  return (
    <section className="max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16">
      <div className="pt-10 sm:pt-20">
        {/* Curatorial Quote Banner */}
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 mb-10 sm:mb-16">
          <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            {subtitle}
          </span>
          <blockquote className="font-serif text-xl sm:text-3xl md:text-4xl text-white font-light italic leading-snug sm:leading-tight">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-2.5 text-[10px] sm:text-xs tracking-widest text-zinc-400 uppercase font-mono">
            <span className="w-6 sm:w-8 h-[1px] bg-[#d1a86e]" />
            <span>Elena Vance — Atelier Paris</span>
            <span className="w-6 sm:w-8 h-[1px] bg-[#d1a86e]" />
          </div>
        </div>

        {/* 2-Column Editorial Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
          {/* Atelier Imagery with Framing */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#14151a] shadow-2xl">
              <ProgressiveImage
                src={atelierImage}
                alt="Elena Vance Atelier Studio"
                fill
                optimizeWidth={1200}
                optimizeQuality={85}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-4 sm:p-6">
                <p className="text-[10px] sm:text-xs text-zinc-300 font-mono tracking-wider uppercase">
                  Studio 04 • Rue Vivienne, Paris
                </p>
              </div>
            </div>
          </div>

          {/* Curatorial Essay & 4 Pillars */}
          <div className="lg:col-span-6 space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-serif text-2xl sm:text-4xl text-white font-medium">
                {title || "The Alchemy of Natural Earth & Luminous Glazes"}
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-[#a6aabf] leading-relaxed font-light">
                {description}
              </p>
            </div>

            {/* 4 Pillars of Studio Craftsmanship - 2 COLUMNS ON MOBILE */}
            <div className="grid grid-cols-2 gap-2 sm:gap-4 pt-1">
              <div className="space-y-1 sm:space-y-1.5 p-3 sm:p-4 rounded-xl bg-[#14151a] shadow-sm">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block truncate">
                  01 / Lapis Lazuli
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed line-clamp-3 sm:line-clamp-none font-light">
                  Semiprecious Afghan lapis lazuli stone hand-ground with walnut oil for deep spectral resonance.
                </p>
              </div>

              <div className="space-y-1 sm:space-y-1.5 p-3 sm:p-4 rounded-xl bg-[#14151a] shadow-sm">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block truncate">
                  02 / Belgian Linen
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed line-clamp-3 sm:line-clamp-none font-light">
                  Triple-primed Claessens linen hand-stretched onto custom tulipwood expanding stretchers.
                </p>
              </div>

              <div className="space-y-1 sm:space-y-1.5 p-3 sm:p-4 rounded-xl bg-[#14151a] shadow-sm">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block truncate">
                  03 / Glaze Optics
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed line-clamp-3 sm:line-clamp-none font-light">
                  Up to twenty-five micro-thin oil glazes cured over months to produce internal luminous refraction.
                </p>
              </div>

              <div className="space-y-1 sm:space-y-1.5 p-3 sm:p-4 rounded-xl bg-[#14151a] shadow-sm">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block truncate">
                  04 / Provenance
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed line-clamp-3 sm:line-clamp-none font-light">
                  Every original canvas is cataloged in the studio ledger with verified physical dimensions.
                </p>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-xs uppercase tracking-[0.18em] text-[#d1a86e] hover:text-[#e2c18d] font-semibold transition-colors"
              >
                <span>Read Full Biography &amp; Curatorial CV</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
