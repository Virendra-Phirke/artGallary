"use client";

import React from "react";
import Link from "next/link";
import { Heart, Eye, Sparkles, ShoppingBag, Check } from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, cn } from "@/lib/utils";
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
        "group relative bg-[#121319] hover:bg-[#161722] rounded-xl sm:rounded-2xl overflow-hidden p-2 sm:p-3.5 space-y-2 sm:space-y-3 shadow-lg shadow-black/40 hover:shadow-xl transition-all duration-300 flex flex-col justify-between",
        className
      )}
    >
      <div>
        {/* Pure Artwork Canvas - Completely Clean without Overlays */}
        <div
          onClick={() => setInspectArtwork(artwork)}
          className="relative aspect-[4/3] rounded-lg sm:rounded-xl overflow-hidden bg-[#0a0b0e] shadow-inner cursor-pointer"
        >
          <ProgressiveImage
            src={artwork.coverImageUrl}
            alt={artwork.title}
            fill
            optimizeWidth={650}
            optimizeQuality={85}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Subtle Hover Overlay with Inspect & AR Shortcuts */}
          <div className="absolute inset-0 bg-black/45 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 sm:gap-2.5">
            <div
              className="w-8 h-8 sm:w-9 sm:h-9 bg-white hover:bg-zinc-100 text-[#0d0e12] rounded-full flex items-center justify-center shadow-xl transform group-hover:scale-100 scale-90 transition-all duration-200 active:scale-95"
              title="Inspect 4K Details"
              aria-label="Inspect artwork"
            >
              <Eye className="w-3.5 h-3.5" />
            </div>

            <Link
              href={`/ar/${artwork.slug}`}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 sm:w-9 sm:h-9 bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] rounded-full flex items-center justify-center shadow-xl shadow-[#d1a86e]/30 transform group-hover:scale-100 scale-90 transition-all duration-200 active:scale-95"
              title="View in Your Space (1:1 WebAR)"
              aria-label="View in AR"
            >
              <Sparkles className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* Clean Metadata: Title & Price Only */}
        <div className="pt-1.5 sm:pt-2 px-0.5">
          <div className="flex items-baseline justify-between gap-1.5">
            <h4
              onClick={() => setInspectArtwork(artwork)}
              className="font-serif text-xs sm:text-sm text-white group-hover:text-[#d1a86e] transition-colors truncate cursor-pointer font-medium"
              title={artwork.title}
            >
              {artwork.title}
            </h4>
            {artwork.price && (
              <span className="text-[10px] sm:text-xs font-mono text-[#d1a86e] font-semibold shrink-0">
                {formatCurrency(artwork.price, artwork.currency)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Clean Bottom Actions: + Add Dossier & Heart Toggle */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <button
          onClick={() => toggleCartArtwork(artwork.id)}
          className={cn(
            "flex-1 h-7 sm:h-7.5 px-2 sm:px-3 rounded-full text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-[0.98] shadow-sm",
            isInCart
              ? "bg-[#252838] text-[#d1a86e] border border-[#d1a86e]/30"
              : "bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white"
          )}
        >
          {isInCart ? (
            <>
              <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#d1a86e] shrink-0" />
              <span className="truncate">In Dossier</span>
            </>
          ) : (
            <>
              <ShoppingBag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#d1a86e] shrink-0" />
              <span className="truncate">+ Add</span>
            </>
          )}
        </button>

        <button
          onClick={() => toggleSaveArtwork(artwork.id)}
          className={cn(
            "w-7 h-7 sm:w-7.5 sm:h-7.5 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-sm",
            isSaved
              ? "bg-[#d1a86e] text-[#0d0e12]"
              : "bg-[#1c1d28] hover:bg-[#252736] text-zinc-400 hover:text-rose-400"
          )}
          title={isSaved ? "Shortlisted in Private Portfolio" : "Save to Shortlist"}
          aria-label="Bookmark artwork"
        >
          <Heart
            className={cn(
              "w-3 h-3",
              isSaved ? "fill-[#0d0e12] text-[#0d0e12]" : "text-current"
            )}
          />
        </button>
      </div>
    </div>
  );
}
