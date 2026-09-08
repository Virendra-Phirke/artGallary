"use client";

import React from "react";
import Link from "next/link";
import { Heart, Eye, Sparkles, ShoppingBag, Ruler } from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, formatDimensions, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { useCollector } from "@/components/account/context/CollectorContext";

export interface ArtworkCardProps {
  artwork: MockArtwork;
  className?: string;
}

export function ArtworkCard({ artwork, className = "" }: ArtworkCardProps) {
  const {
    cartArtworkIds,
    toggleCartArtwork,
    isArtworkSaved,
    toggleSaveArtwork,
    setInspectArtwork,
  } = useCollector();

  const isSaved = isArtworkSaved(artwork.id);
  const isInCart = cartArtworkIds.includes(artwork.id);

  return (
    <div
      className={cn(
        "group bg-[#14151a] border border-[#262833] rounded-2xl overflow-hidden p-4 space-y-4 hover:border-[#d1a86e]/40 transition-all duration-300 shadow-xl flex flex-col justify-between",
        className
      )}
    >
      <div>
        <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0d0e12]">
          <ProgressiveImage
            src={artwork.coverImageUrl}
            alt={artwork.title}
            fill
            optimizeWidth={650}
            optimizeQuality={85}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />

          {/* Status Badge */}
          <div className="absolute top-3 left-3 z-10">
            <Badge
              variant={
                artwork.status === "published"
                  ? "success"
                  : artwork.status === "reserved"
                  ? "warning"
                  : "secondary"
              }
              className="backdrop-blur-md bg-black/60 border border-white/10"
            >
              {artwork.status === "published" ? "Available" : artwork.status}
            </Badge>
          </div>

          {/* Save / Bookmark Button */}
          <button
            onClick={() => toggleSaveArtwork(artwork.id)}
            className={cn(
              "absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer",
              isSaved
                ? "bg-[#d1a86e] text-[#0d0e12] border-[#d1a86e]"
                : "bg-black/60 text-zinc-400 hover:text-white border-white/10"
            )}
            title={isSaved ? "Remove from Saved Shortlist" : "Save to Private Portfolio"}
            aria-label="Bookmark artwork"
          >
            <Heart className={cn("w-3.5 h-3.5", isSaved && "fill-[#0d0e12]")} />
          </button>

          {/* Hover Overlay Buttons */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
            <button
              onClick={() => setInspectArtwork(artwork)}
              className="p-3 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors shadow-lg cursor-pointer"
              title="Inspect Details"
              aria-label="Inspect artwork"
            >
              <Eye className="w-4 h-4" />
            </button>

            <Link
              href={`/ar/${artwork.slug}`}
              className="p-3 bg-[#d1a86e] text-[#0d0e12] rounded-full hover:bg-[#e2c18d] transition-colors shadow-lg"
              title="View in Your Space (AR)"
              aria-label="View in AR"
            >
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>

        <div className="space-y-1.5 pt-3">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="font-serif text-lg text-white group-hover:text-[#d1a86e] transition-colors line-clamp-1">
              {artwork.title}
            </h4>
            {artwork.price && (
              <span className="text-sm font-mono text-[#d1a86e] shrink-0">
                {formatCurrency(artwork.price, artwork.currency)}
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 line-clamp-1">{artwork.medium}</p>

          <div className="pt-2 border-t border-[#1c1d25] flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1">
              <Ruler className="w-3 h-3 text-[#d1a86e]" />
              {formatDimensions(artwork.widthCm, artwork.heightCm)}
            </span>

            <button
              onClick={() => setInspectArtwork(artwork)}
              className="text-[#d1a86e] hover:underline uppercase tracking-wider text-[10px] cursor-pointer"
            >
              Details &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Add to Acquisition Dossier Button */}
      <button
        onClick={() => toggleCartArtwork(artwork.id)}
        className={cn(
          "w-full py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all mt-3 border cursor-pointer",
          isInCart
            ? "bg-[#1f2230] text-[#d1a86e] border-[#d1a86e]/60 shadow-sm"
            : "bg-[#181920] hover:bg-[#20222d] text-zinc-300 hover:text-white border-[#262833] hover:border-[#d1a86e]/30"
        )}
      >
        <ShoppingBag className="w-3.5 h-3.5 text-[#d1a86e]" />
        <span>
          {isInCart ? "In Dossier" : "+ Add to Acquisition Dossier"}
        </span>
      </button>
    </div>
  );
}
