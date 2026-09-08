"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Package, Award, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CollectorServicesSection() {
  return (
    <section className="max-w-7xl mx-auto px-6 md:px-12">
      <div className="rounded-3xl bg-[#101116] border border-[#1c1d25] p-8 sm:p-12 md:p-16 space-y-12">
        <div className="max-w-2xl space-y-3">
          <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Private Acquisition Standards
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl text-white font-medium">
            Museum-Grade Handling for Distinguished Collectors
          </h2>
          <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed">
            Every acquired canvas is prepared directly in the Paris studio under museum archival standards to ensure permanent preservation and flawless international transit.
          </p>
        </div>

        {/* 4 Feature Columns */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3 p-5 rounded-2xl bg-[#14151a] border border-[#262833]/60">
            <div className="w-10 h-10 rounded-full bg-[#1c1d25] border border-[#262833] flex items-center justify-center text-[#d1a86e]">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg text-white font-medium">
              Signed Certificate &amp; Provenance
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Embossed fine art paper certificate signed by Elena Vance with documented photographic catalog register.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-[#14151a] border border-[#262833]/60">
            <div className="w-10 h-10 rounded-full bg-[#1c1d25] border border-[#262833] flex items-center justify-center text-[#d1a86e]">
              <Package className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg text-white font-medium">
              Thermal Archival Crate
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Custom-built multi-ply plywood crate with museum insulation, humidity buffering, and corner reinforcement.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-[#14151a] border border-[#262833]/60">
            <div className="w-10 h-10 rounded-full bg-[#1c1d25] border border-[#262833] flex items-center justify-center text-[#d1a86e]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg text-white font-medium">
              Insured White-Glove Transit
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Direct door-to-door insured air courier with specialized fine art handlers across 45 countries worldwide.
            </p>
          </div>

          <div className="space-y-3 p-5 rounded-2xl bg-[#14151a] border border-[#262833]/60">
            <div className="w-10 h-10 rounded-full bg-[#1c1d25] border border-[#262833] flex items-center justify-center text-[#d1a86e]">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-serif text-lg text-white font-medium">
              Spatial AR Consultation
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Bespoke digital wall preview assistance and framing recommendations calibrated to your architectural lighting.
            </p>
          </div>
        </div>

        {/* Footer Contact Banner */}
        <div className="pt-4 border-t border-[#1c1d25] flex flex-col sm:flex-row items-center justify-between gap-4">
          <span className="text-xs text-zinc-400">
            Inquire for private foundation viewing appointments or enter the private salon.
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              asChild
              variant="outline"
              className="rounded-full border-[#262833] bg-[#14151a] hover:bg-[#1a1c23] text-zinc-300 hover:text-white text-xs uppercase tracking-wider px-5 py-2"
            >
              <Link href="/contact" className="flex items-center gap-2">
                <span>Studio Inquiries</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
            <Button
              asChild
              className="rounded-full bg-[#d1a86e] text-[#0d0e12] hover:bg-[#b38947] text-xs font-semibold uppercase tracking-wider px-5 py-2"
            >
              <Link href="/account" className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enter Collector Portal</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
