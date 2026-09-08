"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Package, Award, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CollectorServicesSection() {
  return (
    <section className="max-w-[1800px] mx-auto px-3.5 sm:px-10 md:px-14 lg:px-16 w-full max-w-full overflow-hidden">
      <div className="rounded-3xl bg-[#101116] p-5 sm:p-10 md:p-14 space-y-8 sm:space-y-12 shadow-2xl w-full min-w-0">
        <div className="max-w-2xl space-y-2 sm:space-y-3 w-full min-w-0">
          <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Private Acquisition Standards
          </span>
          <h2 className="font-serif text-2xl sm:text-4xl text-white font-medium break-words">
            Museum-Grade Handling for Distinguished Collectors
          </h2>
          <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed font-light break-words">
            Every acquired canvas is prepared directly under museum archival standards to ensure permanent preservation and flawless international transit.
          </p>
        </div>

        {/* 4 Feature Columns - 2 COLUMNS ON MOBILE */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-6 w-full min-w-0">
          <div className="space-y-2 sm:space-y-3 p-3.5 sm:p-5 rounded-2xl bg-[#14151a] shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#1c1d25] flex items-center justify-center text-[#d1a86e]">
              <Award className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-serif text-xs sm:text-base md:text-lg text-white font-medium line-clamp-2">
              Signed Certificate &amp; Provenance
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-400 leading-snug sm:leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
              Embossed fine art paper certificate signed by Vishal Patil with documented photographic catalog register.
            </p>
          </div>

          <div className="space-y-2 sm:space-y-3 p-3.5 sm:p-5 rounded-2xl bg-[#14151a] shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#1c1d25] flex items-center justify-center text-[#d1a86e]">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-serif text-xs sm:text-base md:text-lg text-white font-medium line-clamp-2">
              Thermal Archival Crate
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-400 leading-snug sm:leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
              Custom-built multi-ply plywood crate with museum insulation, humidity buffering, and corner reinforcement.
            </p>
          </div>

          <div className="space-y-2 sm:space-y-3 p-3.5 sm:p-5 rounded-2xl bg-[#14151a] shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#1c1d25] flex items-center justify-center text-[#d1a86e]">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-serif text-xs sm:text-base md:text-lg text-white font-medium line-clamp-2">
              Insured White-Glove Transit
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-400 leading-snug sm:leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
              Direct door-to-door insured air courier with specialized fine art handlers across 45 countries worldwide.
            </p>
          </div>

          <div className="space-y-2 sm:space-y-3 p-3.5 sm:p-5 rounded-2xl bg-[#14151a] shadow-sm">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#1c1d25] flex items-center justify-center text-[#d1a86e]">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <h3 className="font-serif text-xs sm:text-base md:text-lg text-white font-medium line-clamp-2">
              Spatial AR Consultation
            </h3>
            <p className="text-[10px] sm:text-xs text-zinc-400 leading-snug sm:leading-relaxed font-light line-clamp-3 sm:line-clamp-none">
              Bespoke digital wall preview assistance and framing recommendations calibrated to your architectural lighting.
            </p>
          </div>
        </div>

        {/* Footer Contact Banner */}
        <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <span className="text-[11px] sm:text-xs text-zinc-400 font-light">
            Inquire for private foundation viewing appointments or enter the collector portal.
          </span>
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              asChild
              className="rounded-full bg-[#161720] hover:bg-[#202230] text-zinc-300 hover:text-white text-[10px] sm:text-xs uppercase tracking-wider h-7.5 sm:h-8.5 px-3.5 sm:px-4 active:scale-[0.98] w-auto inline-flex"
            >
              <Link href="/contact" className="flex items-center justify-center gap-1.5">
                <span>Inquiries</span>
                <ArrowRight className="w-3 h-3 shrink-0" />
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-[#d1a86e] text-[#0d0e12] hover:bg-[#b38947] text-[10px] sm:text-xs font-semibold uppercase tracking-wider h-7.5 sm:h-8.5 px-3.5 sm:px-4 shadow-md shadow-[#d1a86e]/15 active:scale-[0.98] w-auto inline-flex"
            >
              <Link href="/account" className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-3 h-3 shrink-0" />
                <span>Collector Portal</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
