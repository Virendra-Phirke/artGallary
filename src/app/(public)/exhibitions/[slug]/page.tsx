import React from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getExhibitionBySlug, getArtworks } from "@/db/repository";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { MapPin, Calendar, ArrowLeft, Eye, Sparkles } from "lucide-react";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import type { Metadata } from "next";

interface ExhibitionSlugProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ExhibitionSlugProps): Promise<Metadata> {
  const { slug } = await params;
  const exh = await getExhibitionBySlug(slug);

  if (!exh) return { title: "Exhibition Not Found | L'Atelier Lumineux" };

  return {
    title: `${exh.title} | Elena Vance Exhibition`,
    description: exh.description,
  };
}

export const revalidate = 3600; // Cache ISR for 1 hour with instant write-invalidation

export default async function ExhibitionDetailPage({ params }: ExhibitionSlugProps) {
  const { slug } = await params;
  const exh = await getExhibitionBySlug(slug);

  if (!exh) notFound();

  const allArtworks = await getArtworks();
  const exhibitedArtworks = allArtworks.filter((a) =>
    exh.artworkSlugs.includes(a.slug)
  );

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-16">
      {/* Back Link */}
      <Link
        href="/exhibitions"
        className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-zinc-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to All Exhibitions</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full font-medium ${
                exh.status === "current"
                  ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800/80"
                  : "bg-amber-950/90 text-amber-300 border border-amber-800/80"
              }`}
            >
              {exh.status}
            </span>
            <span className="text-xs text-zinc-400">
              {new Date(exh.startDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              —{" "}
              {new Date(exh.endDate).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl text-white">
            {exh.title}
          </h1>
          <p className="text-sm text-[#d1a86e] font-medium">{exh.subtitle}</p>

          <div className="flex items-center gap-2 text-xs text-zinc-300">
            <MapPin className="w-4 h-4 text-[#d1a86e]" />
            <span>{exh.location}</span>
          </div>

          <p className="text-base text-[#a6aabf] leading-relaxed pt-2">
            {exh.curatorNote || exh.description}
          </p>
        </div>

        <div className="lg:col-span-5">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#262833] shadow-2xl">
            <ProgressiveImage
              src={exh.coverImageUrl}
              alt={exh.title}
              fill
              optimizeWidth={1000}
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Featured Artwork Catalog in Exhibition */}
      <div className="border-t border-[#1c1d25] pt-12 space-y-8">
        <h2 className="font-serif text-2xl text-white">
          Canvases on Display ({exhibitedArtworks.length})
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {exhibitedArtworks.map((art) => (
            <div
              key={art.id}
              className="group flex flex-col bg-[#14151a] border border-[#262833] rounded-xl overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-black/40">
                <ProgressiveImage
                  src={art.coverImageUrl}
                  alt={art.altText}
                  fill
                  optimizeWidth={800}
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
