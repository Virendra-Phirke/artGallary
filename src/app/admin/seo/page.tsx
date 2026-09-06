import React from "react";
import Image from "next/image";
import { Search, Globe, Code, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "SEO & Discovery | Studio Administration",
};

export default function AdminSeoPage() {
  const jsonLdExample = {
    "@context": "https://schema.org",
    "@type": "VisualArtwork",
    name: "Solitude in Ultramarine",
    artist: {
      "@type": "Person",
      name: "Elena Vance",
      sameAs: "https://latelier-lumineux.art/about",
    },
    artMedium: "Oil and pulverized lapis lazuli on Belgian linen",
    artform: "Painting",
    width: "140 cm",
    height: "100 cm",
    depth: "4.5 cm",
    dateCreated: 2025,
    offers: {
      "@type": "Offer",
      price: "18500",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-[#1c1d25] pb-6">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
          Search Discovery &amp; Metadata
        </span>
        <h1 className="font-serif text-3xl text-white mt-1">SEO &amp; Indexing</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Structured Schema.org microdata, OpenGraph social cards, and sitemap generation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* OpenGraph Social Preview */}
        <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#d1a86e]" />
            <h2 className="font-serif text-lg text-white">OpenGraph Card Preview</h2>
          </div>

          <div className="rounded-xl overflow-hidden border border-[#262833] bg-[#0d0e12]">
            <div className="relative aspect-[1.91/1] bg-black/40">
              <Image
                src="https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490"
                alt="Kazuha Digital Artwork"
                fill
                sizes="500px"
                className="object-cover"
              />
            </div>
            <div className="p-4 space-y-1">
              <span className="text-[10px] text-zinc-500 uppercase tracking-wider block font-mono">
                latelier-lumineux.art
              </span>
              <h3 className="text-sm font-serif text-white font-medium">
                Solitude in Ultramarine (2025) – Elena Vance
              </h3>
              <p className="text-xs text-zinc-400 line-clamp-2">
                Original oil and pulverized lapis lazuli on Belgian linen. 140 × 100 cm. Inquire for acquisition or view in your space via WebAR.
              </p>
            </div>
          </div>
        </div>

        {/* JSON-LD Structured Data */}
        <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-[#d1a86e]" />
            <h2 className="font-serif text-lg text-white">Schema.org JSON-LD</h2>
          </div>

          <pre className="p-4 bg-[#0d0e12] border border-[#262833] rounded-xl text-[11px] font-mono text-emerald-300/90 overflow-x-auto">
            {JSON.stringify(jsonLdExample, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
