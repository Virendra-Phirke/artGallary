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
    <section className="max-w-[1800px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16">
      <div className="border-t border-[#1c1d25] pt-20 sm:pt-28">
        {/* Curatorial Quote Banner */}
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-20">
          <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            {subtitle}
          </span>
          <blockquote className="font-serif text-2xl sm:text-4xl md:text-5xl text-white font-light italic leading-tight">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-3 text-xs tracking-widest text-zinc-400 uppercase font-mono">
            <span className="w-8 h-[1px] bg-[#d1a86e]" />
            <span>Elena Vance — Atelier Paris</span>
            <span className="w-8 h-[1px] bg-[#d1a86e]" />
          </div>
        </div>

        {/* 2-Column Editorial Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Atelier Imagery with Framing */}
          <div className="lg:col-span-6 relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-[#262833] bg-[#14151a] shadow-2xl">
              <ProgressiveImage
                src={atelierImage}
                alt="Elena Vance Atelier Studio"
                fill
                optimizeWidth={1200}
                optimizeQuality={85}
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-6">
                <p className="text-xs text-zinc-300 font-mono tracking-wider uppercase">
                  Studio 04 • Rue Vivienne, Paris
                </p>
              </div>
            </div>
          </div>

          {/* Curatorial Essay & 4 Pillars */}
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-4">
              <h3 className="font-serif text-3xl sm:text-4xl text-white font-medium">
                {title || "The Alchemy of Natural Earth & Luminous Glazes"}
              </h3>
              <p className="text-sm md:text-base text-[#a6aabf] leading-relaxed font-light">
                {description}
              </p>
            </div>

            {/* 4 Pillars of Studio Craftsmanship */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
              <div className="space-y-2 border-l border-[#d1a86e]/40 pl-4">
                <span className="text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block">
                  01 / Badakhshan Lapis
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Semiprecious Afghan lapis lazuli stone hand-ground with walnut oil for deep spectral resonance.
                </p>
              </div>

              <div className="space-y-2 border-l border-[#d1a86e]/40 pl-4">
                <span className="text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block">
                  02 / Archival Belgian Linen
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Triple-primed Claessens linen hand-stretched onto custom tulipwood expanding stretchers.
                </p>
              </div>

              <div className="space-y-2 border-l border-[#d1a86e]/40 pl-4">
                <span className="text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block">
                  03 / Layered Glaze Optics
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Up to twenty-five micro-thin oil glazes cured over months to produce internal luminous refraction.
                </p>
              </div>

              <div className="space-y-2 border-l border-[#d1a86e]/40 pl-4">
                <span className="text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block">
                  04 / Permanent Provenance
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Every original canvas is cataloged in the studio ledger with verified physical dimensions and provenance.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-[#d1a86e] hover:text-[#e2c18d] font-semibold transition-colors"
              >
                <span>Read Full Biography &amp; Curatorial CV</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
