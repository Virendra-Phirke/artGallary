"use client";

import React from "react";
import { ArrowRight, Building2, Award, Sparkles } from "lucide-react";
import { ProgressiveImage } from "@/components/ui/progressive-image";

interface ExhibitionRecord {
  year: string;
  title: string;
  location: string;
}

interface ArtistAtelierSectionProps {
  title?: string;
  quote?: string;
  description?: string;
  imageUrl?: string;
  subtitle?: string;
  artistName?: string;
  location?: string;
  tagline?: string;
  bio?: string;
  philosophy?: string;
  exhibitions?: ExhibitionRecord[];
  achievements?: string[];
}

export function ArtistAtelierSection({
  title = "The Alchemy of Natural Earth & Luminous Glazes",
  quote = "A painting is not merely an image hanging upon a partition; it is an alteration of the atmospheric silence within a room.",
  description = "Elena Vance (b. 1986) divides her studio practice between Paris and the wind-sculpted granite coast of Brittany. Her monumental canvases investigate the physical threshold where lapis lazuli glazes, crushed mineral earth, and oceanic silence transform architectural interiors.",
  imageUrl,
  subtitle = "Studio Monologue & Biography",
  artistName = "Elena Vance",
  location = "Paris & Côtes-d'Armor, France",
  tagline = "Contemporary Mineral & Oil Paintings",
  bio,
  philosophy,
  exhibitions = [
    { year: "2026", title: "Luminescence at Twilight — Galerie Vivienne", location: "Paris, France" },
    { year: "2024", title: "The Mineral Horizon — Marlborough Fine Art", location: "London, UK" },
    { year: "2023", title: "Subterranean Glazes — Ginza Contemporary", location: "Tokyo, Japan" },
  ],
  achievements = [
    "Prix Jean-François Millet pour la Peinture Contemporaine",
    "Permanent Collection Acquisition, Geneva Heritage Trust",
    "ADAGP France Registered Contemporary Master",
  ],
}: ArtistAtelierSectionProps) {
  const atelierImage =
    imageUrl ||
    "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490";

  const handleScrollToContact = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const elem = document.getElementById("contact");
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
      window.history.pushState(null, "", "#contact");
    }
  };

  return (
    <section
      id="about"
      className="max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 w-full max-w-full overflow-hidden scroll-mt-24 sm:scroll-mt-32 space-y-16 sm:space-y-24"
    >
      <div className="pt-10 sm:pt-20 w-full min-w-0">
        {/* Curatorial Quote Banner */}
        <div className="max-w-4xl mx-auto text-center space-y-4 sm:space-y-6 mb-12 sm:mb-20 w-full min-w-0">
          <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            {subtitle}
          </span>
          <blockquote className="font-serif text-xl sm:text-3xl md:text-4xl text-white font-light italic leading-snug sm:leading-tight break-words">
            &ldquo;{quote}&rdquo;
          </blockquote>
          <div className="flex items-center justify-center gap-2.5 text-[10px] sm:text-xs tracking-widest text-zinc-400 uppercase font-mono">
            <span className="w-6 sm:w-8 h-[1px] bg-[#d1a86e]" />
            <span>{artistName} — Atelier Paris</span>
            <span className="w-6 sm:w-8 h-[1px] bg-[#d1a86e]" />
          </div>
        </div>

        {/* 2-Column Editorial Spread */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center w-full min-w-0">
          {/* Atelier Imagery with Framing */}
          <div className="lg:col-span-5 relative">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-[#14151a] shadow-2xl border border-[#262833] group">
              <ProgressiveImage
                src={atelierImage}
                alt={`${artistName} Studio Archive`}
                fill
                optimizeWidth={1200}
                optimizeQuality={85}
                sizes="(max-width: 1024px) 100vw, 40vw"
                className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent flex flex-col justify-end p-5 sm:p-6 pointer-events-none">
                <span className="text-[9px] font-mono text-[#d1a86e] tracking-widest uppercase">
                  Studio Archive • {new Date().getFullYear()}
                </span>
                <p className="text-xs sm:text-sm text-white font-serif font-light">
                  {artistName} Studio, 14 Rue de Beaune
                </p>
              </div>
            </div>
            <div className="mt-2.5 text-center text-[11px] text-zinc-500 font-mono tracking-wider">
              {location} • {tagline}
            </div>
          </div>

          {/* Curatorial Essay & 4 Pillars */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-8">
            <div className="space-y-3 sm:space-y-4">
              <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold block">
                Biography &amp; Studio Practice
              </span>
              <h3 className="font-serif text-2xl sm:text-4xl text-white font-medium leading-tight">
                {title}
              </h3>
              <div className="space-y-3 text-xs sm:text-sm md:text-base text-[#a6aabf] leading-relaxed font-light">
                <p>{bio || description}</p>
                {philosophy && <p>{philosophy}</p>}
              </div>
            </div>

            {/* 4 Pillars of Studio Craftsmanship */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-4 pt-1">
              <div className="space-y-1 sm:space-y-1.5 p-3.5 sm:p-4 rounded-xl bg-[#14151a] border border-[#232530] shadow-sm">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block truncate">
                  01 / Lapis Lazuli
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed font-light">
                  Semiprecious Afghan lapis lazuli stone hand-ground with cold-pressed walnut oil.
                </p>
              </div>

              <div className="space-y-1 sm:space-y-1.5 p-3.5 sm:p-4 rounded-xl bg-[#14151a] border border-[#232530] shadow-sm">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block truncate">
                  02 / Belgian Linen
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed font-light">
                  Triple-primed Claessens linen stretched on custom tulipwood expansion keys.
                </p>
              </div>

              <div className="space-y-1 sm:space-y-1.5 p-3.5 sm:p-4 rounded-xl bg-[#14151a] border border-[#232530] shadow-sm">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block truncate">
                  03 / Glaze Optics
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed font-light">
                  Up to twenty-five micro-thin oil glazes cured over seasons for luminous refraction.
                </p>
              </div>

              <div className="space-y-1 sm:space-y-1.5 p-3.5 sm:p-4 rounded-xl bg-[#14151a] border border-[#232530] shadow-sm">
                <span className="text-[10px] sm:text-xs uppercase tracking-wider text-[#d1a86e] font-semibold block truncate">
                  04 / Provenance
                </span>
                <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed font-light">
                  Cataloged in the studio ledger with verified centimeter scale and ADAGP record.
                </p>
              </div>
            </div>

            {/* Quick action to scroll to contact */}
            <div className="pt-2 flex items-center gap-4">
              <a
                href="#contact"
                onClick={handleScrollToContact}
                className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#d1a86e] hover:text-[#e2c18d] font-semibold transition-colors"
              >
                <span>Inquire With Curatorial Office</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>

        {/* Curriculum Vitae (CV) & Provenance Ledger */}
        <div className="border-t border-[#1c1d25] pt-12 sm:pt-16 mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-4 space-y-2">
            <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
              Curriculum Vitae
            </span>
            <h4 className="font-serif text-2xl sm:text-3xl text-white">
              Exhibitions &amp; Provenance
            </h4>
            <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-sm pt-1">
              Institutional record, solo museum presentations, and permanent foundation collections.
            </p>
          </div>

          <div className="lg:col-span-8 space-y-8 sm:space-y-10">
            {/* Selected Solo Exhibitions */}
            <div className="space-y-3.5">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-semibold flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#d1a86e]" />
                <span>Selected Exhibitions</span>
              </div>
              <div className="space-y-2.5 text-xs sm:text-sm">
                {exhibitions.map((ex, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2.5 gap-1 sm:gap-4 hover:border-[#d1a86e]/30 transition-colors"
                  >
                    <span className="text-white font-medium">{ex.title} — {ex.location}</span>
                    <span className="text-zinc-500 font-mono text-[11px] sm:text-xs shrink-0">{ex.year}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Honors & Collections */}
            <div className="space-y-3.5">
              <div className="text-[11px] uppercase tracking-[0.2em] text-zinc-400 font-semibold flex items-center gap-2">
                <Award className="w-4 h-4 text-[#d1a86e]" />
                <span>Honors &amp; Museum Acquisitions</span>
              </div>
              <div className="space-y-2.5 text-xs sm:text-sm">
                {achievements.map((ach, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2.5 gap-1 sm:gap-4 hover:border-[#d1a86e]/30 transition-colors"
                  >
                    <span className="text-white font-medium">{ach}</span>
                    <span className="text-[#d1a86e] text-[10px] sm:text-xs font-mono uppercase tracking-wider shrink-0 flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>Verified Provenance</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
