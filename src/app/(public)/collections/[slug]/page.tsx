import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCollectionBySlug, getArtworks } from "@/db/repository";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { Sparkles, Eye, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";

interface CollectionSlugProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: CollectionSlugProps): Promise<Metadata> {
  const { slug } = await params;
  const col = await getCollectionBySlug(slug);

  if (!col) return { title: "Collection Not Found | L'Atelier Lumineux" };

  return {
    title: `${col.title} | Curated Series by Elena Vance`,
    description: col.description,
  };
}

export default async function CollectionDetailPage({ params }: CollectionSlugProps) {
  const { slug } = await params;
  const col = await getCollectionBySlug(slug);

  if (!col) notFound();

  const allArtworks = await getArtworks();
  const artworks = allArtworks.filter(
    (a) => a.collectionSlug === col.slug || col.artworkSlugs.includes(a.slug)
  );

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-16">
      {/* Back Link */}
      <Link
        href="/collections"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Collections</span>
      </Link>

      {/* Collection Header */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
            Curated Series
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl text-white">
            {col.title}
          </h1>
          <p className="text-base text-[#a6aabf] leading-relaxed">
            {col.curatorialStatement}
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#262833] shadow-2xl">
            <Image
              src={col.coverImageUrl}
              alt={col.title}
              fill
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Series Artworks Grid */}
      <div className="border-t border-[#1c1d25] pt-12 space-y-8">
        <h2 className="font-serif text-2xl text-white">
          Works in this Series ({artworks.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {artworks.map((art) => (
            <div
              key={art.id}
              className="group flex flex-col bg-[#14151a] border border-[#262833] rounded-xl overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-black/40">
                <Image
                  src={art.coverImageUrl}
                  alt={art.altText}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                  <Link
                    href={`/artwork/${art.slug}`}
                    className="p-3 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors shadow-lg"
                    title="Examine Details"
                  >
                    <Eye className="w-4 h-4" />
                  </Link>
                  <Link
                    href={`/ar/${art.slug}`}
                    className="p-3 bg-[#d1a86e] text-black rounded-full hover:bg-[#e2c18d] transition-colors shadow-lg"
                    title="View in Your Space (AR)"
                  >
                    <Sparkles className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <div className="flex items-baseline justify-between">
                  <Link
                    href={`/artwork/${art.slug}`}
                    className="font-serif text-lg text-white hover:text-[#d1a86e] transition-colors"
                  >
                    {art.title}
                  </Link>
                  <span className="text-xs text-[#d1a86e] font-medium">
                    {formatCurrency(art.price, art.currency)}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">{art.medium}</p>
                <p className="text-[11px] text-zinc-500">
                  {formatDimensions(art.widthCm, art.heightCm)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
