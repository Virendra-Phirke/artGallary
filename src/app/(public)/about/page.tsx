import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Award, GraduationCap, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About the Artist | Elena Vance Biography & Statement",
  description:
    "Biography, artist statement, and curatorial curriculum vitae of contemporary painter Elena Vance. Studio locations in Paris and Brittany.",
};

export default function AboutPage() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-20">
      {/* Hero Biography Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-[#262833] shadow-2xl">
            <Image
              src="https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490"
              alt="Vishal in the studio"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
            />
          </div>
          <div className="mt-3 text-center text-xs text-zinc-500">
            Studio showcase, 2026. L&apos;Atelier Gallery Archive.
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
            Biography &amp; Studio Practice
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-white leading-tight">
            Elena Vance
          </h1>
          <p className="text-sm font-light text-[#d1a86e] tracking-widest uppercase">
            b. 1986, Brest, France • Lives and works between Paris and Côtes-d&apos;Armor
          </p>

          <div className="space-y-4 text-sm text-[#a6aabf] leading-relaxed">
            <p>
              Elena Vance is a contemporary fine artist whose paintings investigate the physics of optical depth, geological materiality, and oceanic stillness. After training at the École Nationale Supérieure des Beaux-Arts in Paris under master colorists, Vance developed a distinct technique combining archaic mineral pigments—chiefly Afghan lapis lazuli and Roman pozzolana—with multi-layered oil glazes on raw Belgian linen.
            </p>
            <p>
              Her studio practice resists the rapid consumption of images. Canvases are frequently held in progress across several seasons, receiving up to twenty gossamer layers of translucent stand-oil glaze. When light enters these layers, it reflects off underlying mineral particles, causing the paintings to subtly alter their character as natural room lighting transitions from dawn to dusk.
            </p>
            <p>
              Vance’s works have been acquired by distinguished corporate collections, private family foundations across Geneva, London, New York, and Tokyo, and exhibited in major museum institutions throughout Europe.
            </p>
          </div>

          <div className="pt-4">
            <Button asChild size="lg" className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] shadow-lg shadow-[#d1a86e]/10">
              <Link
                href="/contact"
                className="inline-flex items-center gap-2"
              >
                <span>Contact the Studio</span>
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
          &ldquo;I do not depict landscapes. I collect the dust of the earth and the residue of sea foam, suspending them in oil so that the silence of the horizon can dwell inside an interior wall.&rdquo;
        </blockquote>
        <p className="text-xs text-zinc-500 uppercase tracking-widest">
          — Elena Vance, Paris Notebooks
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
          {/* Education */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-[#d1a86e]" />
              <span>Education &amp; Training</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2 gap-1 sm:gap-4">
                <span className="text-white">École Nationale Supérieure des Beaux-Arts, Paris (DNSAP)</span>
                <span className="text-zinc-500 text-xs sm:text-sm">2007 – 2011</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2 gap-1 sm:gap-4">
                <span className="text-white">Research Residency, Mineral Pigment Chemistry, Florence</span>
                <span className="text-zinc-500 text-xs sm:text-sm">2012</span>
              </div>
            </div>
          </div>

          {/* Selected Solo Exhibitions */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#d1a86e]" />
              <span>Selected Solo Exhibitions</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2 gap-1 sm:gap-4">
                <span className="text-white">Luminescence at Twilight — Galerie Vivienne, Paris</span>
                <span className="text-zinc-500 text-xs sm:text-sm">2026</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2 gap-1 sm:gap-4">
                <span className="text-white">The Mineral Horizon — Marlborough Fine Art, London</span>
                <span className="text-zinc-500 text-xs sm:text-sm">2024</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2 gap-1 sm:gap-4">
                <span className="text-white">Subterranean Glazes — Ginza Contemporary, Tokyo</span>
                <span className="text-zinc-500 text-xs sm:text-sm">2023</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2 gap-1 sm:gap-4">
                <span className="text-white">Breton Strata — Centre d’Art Passerelle, Brest</span>
                <span className="text-zinc-500 text-xs sm:text-sm">2021</span>
              </div>
            </div>
          </div>

          {/* Awards & Honors */}
          <div className="space-y-4">
            <h3 className="text-xs uppercase tracking-[0.2em] text-zinc-400 font-semibold flex items-center gap-2">
              <Award className="w-4 h-4 text-[#d1a86e]" />
              <span>Honors &amp; Collections</span>
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2 gap-1 sm:gap-4">
                <span className="text-white">Prix Fondation d&apos;Entreprise Ricard (Nominee)</span>
                <span className="text-zinc-500 text-xs sm:text-sm">2023</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2 gap-1 sm:gap-4">
                <span className="text-white">Permanent Acquisition, Geneva Heritage Trust</span>
                <span className="text-zinc-500 text-xs sm:text-sm">2022</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline border-b border-[#1f212b] pb-2 gap-1 sm:gap-4">
                <span className="text-white">ADAGP French Registered Visual Artist</span>
                <span className="text-zinc-500 text-xs sm:text-sm">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
