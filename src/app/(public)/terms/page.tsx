import React from "react";
import { getSiteSettings } from "@/db/repository";
import { Scale } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Acquisition & Provenance | Studio Protocol",
  description: "Terms and conditions for original artwork acquisition, certificate provenance, and copyright conventions.",
};

export const revalidate = 60;

export default async function TermsPage() {
  const settings = await getSiteSettings();
  const termsText =
    settings.legalPages.termsOfService ||
    "All artworks displayed on this platform are original copyright-protected creations of Vishal Patil. Authenticated certificates of authenticity are registered with ADAGP France upon completion of acquisition.";

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 pt-36 pb-24 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18191e] border border-[#262833] text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase">
          <Scale className="w-3.5 h-3.5" />
          <span>Curatorial Covenant</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-white">Terms of Acquisition</h1>
        <p className="text-xs text-zinc-500">
          Last revised: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} • {settings.siteTitle}
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-sm text-[#a6aabf] leading-relaxed space-y-6 bg-[#14151a] border border-[#262833] p-8 rounded-2xl">
        <p>{termsText}</p>

        <h3 className="font-serif text-xl text-white pt-4">Authenticity &amp; Title</h3>
        <p>
          Title to each painting transfers to the collector upon receipt of cleared funds and physical crated delivery. Each piece is catalogued with unique provenance numbers and stamped by the artist studio.
        </p>

        <h3 className="font-serif text-xl text-white pt-4">Intellectual Property &amp; Reproduction Rights</h3>
        <p>
          Purchase of physical artworks conveys ownership of the physical object. Intellectual property, reproduction rights, and exhibition catalogue publishing rights remain reserved to the artist and ADAGP France.
        </p>
      </div>
    </div>
  );
}
