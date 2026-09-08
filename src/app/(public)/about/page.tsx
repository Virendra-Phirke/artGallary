import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getSiteSettings } from "@/db/repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Artist | Biography & Statement",
  description:
    "Biography, artist statement, and curatorial curriculum vitae of contemporary fine artist Elena Vance.",
};

export const revalidate = 60;

export default async function AboutPage() {
  const settings = await getSiteSettings();
  const cfg = settings.aboutPageConfig;
  const artistName = settings.artistName || "Elena Vance";
  const portraitUrl =
    cfg.artistImageUrl ||
    "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490";
  const bio = cfg.bio || settings.bioSummary;
  const quote =
    cfg.quote ||
    "I do not depict landscapes. I collect the dust of the earth and the residue of sea foam, suspending them in oil so that the silence of the horizon can dwell inside an interior wall.";
  const exhibitions = cfg.exhibitions && cfg.exhibitions.length > 0 ? cfg.exhibitions : [
    { year: "2026", title: "Luminescence at Twilight — Galerie Vivienne", location: "Paris, France" },
    { year: "2024", title: "The Mineral Horizon — Marlborough Fine Art", location: "London, UK" },
    { year: "2023", title: "Subterranean Glazes — Ginza Contemporary", location: "Tokyo, Japan" },
  ];

  return (
    <div className="max-w-[1800px] mx-auto px-6 sm:px-10 md:px-14 lg:px-16 pt-32 pb-24 space-y-20">
      {/* Hero Biography Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#262833] shadow-2xl">
            <Image
              src={portraitUrl}
              alt={artistName}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <div className="mt-3 text-center text-xs text-zinc-500">
            {artistName} Studio Archive, {new Date().getFullYear()}.
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
            {cfg.intro || "Biography & Studio Practice"}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-white leading-tight">
            {artistName}
          </h1>
          <p className="text-sm font-light text-[#d1a86e] tracking-widest uppercase">
            {settings.location} • {settings.tagline}
          </p>

          <div className="space-y-4 text-sm text-[#a6aabf] leading-relaxed">
            <p>{bio}</p>
            {cfg.philosophy && <p>{cfg.philosophy}</p>}
          </div>

          <div className="pt-4">
            <Button asChild size="lg" className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] shadow-lg shadow-[#d1a86e]/10">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2"
              >
                <span>{cfg.ctaText || "Contact the Studio"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Artist Statement Section */}
      <section className="bg-[#14151a] border border-[#262833] rounded-2xl p-6 sm:p-10 md:p-14 space-y-6 max-w-4xl mx-auto text-center">
        <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
          Artist Statement
        </span>
        <blockquote className="font-serif text-2xl sm:text-3xl text-white font-light italic leading-snug">
          &ldquo;{quote}&rdquo;
        </blockquote>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">
          — {artistName}, Studio Monologue
        </p>
      </section>

      {/* Curriculum Vitae (CV) */}
      <div className="border-t border-[#1c1d25] pt-16 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
        <div className="lg:col-span-4 space-y-2">
          <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
            Curriculum Vitae
          </span>
          <h2 className="font-serif text-3xl text-white">Record &amp; Provenance</h2>
        </div>

        <div className="lg:col-span-8 space-y-12">
          {/* Selected Solo Exhibitions */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#d1a86e]" />
              <span>Selected Exhibitions</span>
            </h3>
            <div className="space-y-3 text-sm">
              {exhibitions.map((ex, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2 gap-1 sm:gap-4"
                >
                  <span className="text-white">{ex.title} — {ex.location}</span>
                  <span className="text-zinc-500 text-xs sm:text-sm">{ex.year}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Awards & Honors */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-[#d1a86e]" />
              <span>Honors &amp; Collections</span>
            </h3>
            <div className="space-y-3 text-sm">
              {(cfg.achievements && cfg.achievements.length > 0 ? cfg.achievements : [
                "Prix Jean-François Millet pour la Peinture Contemporaine",
                "Permanent Collection Acquisition, Geneva Heritage Trust",
                "ADAGP France Registered Contemporary Master",
              ]).map((ach, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2 gap-1 sm:gap-4"
                >
                  <span className="text-white">{ach}</span>
                  <span className="text-zinc-500 text-xs sm:text-sm">Verified</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
