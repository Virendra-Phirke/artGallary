import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCollections } from "@/db/repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Curated Series & Collections | Elena Vance",
  description:
    "Explore the distinct thematic series of paintings by Elena Vance, including Chromatic Solitude and Ephemeral Terrains.",
};

export const revalidate = 60; // Cache ISR for 60 seconds

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";

export default async function CollectionsPage() {
  const collections = await getCollections();

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-16">
      <div className="max-w-2xl space-y-3">
        <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
          Thematic Bodies of Work
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-white">
          Curated Series
        </h1>
        <p className="text-sm text-[#a6aabf] leading-relaxed">
          Elena Vance groups her artistic inquiries into multi-year cycles. Each series represents a focused exploration of specific pigments, geological binders, and spatial tensions.
        </p>
      </div>

      <div className="space-y-12 sm:space-y-16">
        {collections.map((col, idx) => (
          <Card
            key={col.id}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center p-5 sm:p-8 md:p-10 rounded-2xl bg-[#14151a] border border-[#262833] overflow-hidden"
          >
            <div className={`lg:col-span-6 ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-black/40 border border-[#262833]">
                <ProgressiveImage
                  src={col.coverImageUrl}
                  alt={col.title}
                  fill
                  optimizeWidth={1000}
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div className={`lg:col-span-6 space-y-5 ${idx % 2 === 1 ? "lg:order-1" : ""}`}>
              <span className="text-[11px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                Series No. 0{idx + 1}
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl text-white">{col.title}</h2>
              <p className="text-sm text-[#a6aabf] leading-relaxed">
                {col.curatorialStatement}
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" className="border-[#d1a86e]/40 hover:bg-[#d1a86e]/10 text-[#d1a86e] hover:text-[#e2c18d] text-xs uppercase tracking-[0.2em] font-semibold">
                  <Link
                    href={`/collections/${col.slug}`}
                    className="inline-flex items-center gap-2"
                  >
                    <span>Explore Series Artworks</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
