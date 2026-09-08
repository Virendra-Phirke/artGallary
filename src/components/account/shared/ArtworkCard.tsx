"use client";

import React from "react";
import Link from "next/link";
import { Heart, Eye, Sparkles, ShoppingBag, Ruler, Check } from "lucide-react";
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
        "group relative bg-[#121319] hover:bg-[#161722] rounded-2xl sm:rounded-3xl overflow-hidden p-2.5 sm:p-5 space-y-2.5 sm:space-y-4 shadow-xl shadow-black/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between",
        className
      )}
    >
      <div>
        <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-[#0a0b0e] shadow-inner">
          <ProgressiveImage
            src={artwork.coverImageUrl}
            alt={artwork.title}
            fill
            optimizeWidth={650}
            optimizeQuality={85}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Top Floating Badges */}
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 flex items-center gap-1">
            <Badge
              variant={
                artwork.status === "published"
                  ? "success"
                  : artwork.status === "reserved"
                  ? "warning"
                  : "secondary"
              }
              className="backdrop-blur-md bg-black/80 border-0 text-[8px] sm:text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full"
            >
              {artwork.status === "published" ? "Available" : artwork.status}
            </Badge>

            {artwork.collectionName && (
              <span className="hidden sm:inline-block px-2.5 py-0.5 rounded-full backdrop-blur-md bg-black/70 text-[9px] text-zinc-300 font-medium truncate max-w-[110px]">
                {artwork.collectionName}
              </span>
            )}
          </div>

          {/* Bookmark / Like Button */}
          <button
            onClick={() => toggleSaveArtwork(artwork.id)}
            className={cn(
              "absolute top-2 right-2 sm:top-3 sm:right-3 z-10 p-1.5 sm:p-2 rounded-full backdrop-blur-md transition-all cursor-pointer shadow-md",
              isSaved
                ? "bg-[#d1a86e] text-[#0d0e12] scale-105"
                : "bg-black/70 text-zinc-300 hover:text-white hover:bg-black/90"
            )}
            title={isSaved ? "Shortlisted in Private Portfolio" : "Save to Private Shortlist"}
            aria-label="Bookmark artwork"
          >
            <Heart className={cn("w-3 sm:w-3.5 h-3 sm:h-3.5", isSaved ? "fill-[#0d0e12] text-[#0d0e12]" : "text-zinc-300")} />
          </button>

          {/* Hover Overlay with Inspect & AR Buttons */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 sm:gap-3">
            <button
              onClick={() => setInspectArtwork(artwork)}
              className="w-9 h-9 sm:w-11 sm:h-11 bg-white hover:bg-zinc-100 text-[#0d0e12] rounded-full flex items-center justify-center shadow-xl cursor-pointer transform group-hover:scale-100 scale-90 transition-all duration-200 active:scale-95"
              title="Inspect 4K Details"
              aria-label="Inspect artwork"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <Link
              href={`/ar/${artwork.slug}`}
              className="w-9 h-9 sm:w-11 sm:h-11 bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] rounded-full flex items-center justify-center shadow-xl shadow-[#d1a86e]/30 transform group-hover:scale-100 scale-90 transition-all duration-200 active:scale-95"
              title="View in Your Space (1:1 WebAR)"
              aria-label="View in AR"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Link>
          </div>
        </div>

        {/* Artwork Meta */}
        <div className="space-y-1 sm:space-y-2 pt-2 sm:pt-3.5 px-0.5">
          <div className="flex items-baseline justify-between gap-1.5">
            <h4 className="font-serif text-xs sm:text-lg text-white group-hover:text-[#d1a86e] transition-colors line-clamp-1">
              {artwork.title}
            </h4>
            {artwork.price && (
              <span className="text-[10px] sm:text-sm font-mono text-[#d1a86e] font-semibold shrink-0">
                {formatCurrency(artwork.price, artwork.currency)}
              </span>
            )}
          </div>

          <p className="text-[10px] sm:text-xs text-zinc-400 line-clamp-1 font-light">{artwork.medium}</p>

          <div className="pt-1.5 sm:pt-2.5 flex items-center justify-between text-[9px] sm:text-[11px] text-zinc-400">
            <span className="flex items-center gap-1 font-mono text-zinc-400 truncate">
              <Ruler className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#d1a86e] shrink-0" />
              <span className="truncate">{formatDimensions(artwork.widthCm, artwork.heightCm)}</span>
            </span>

            <button
              onClick={() => setInspectArtwork(artwork)}
              className="text-[#d1a86e] hover:text-[#e2c18d] uppercase tracking-wider text-[9px] sm:text-[11px] font-semibold cursor-pointer transition-colors shrink-0 ml-1"
            >
              View &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Add to Acquisition Dossier Button */}
      <button
        onClick={() => toggleCartArtwork(artwork.id)}
        className={cn(
          "w-full h-8 sm:h-10 px-2 sm:px-4 rounded-full text-[10px] sm:text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 sm:gap-2 transition-all mt-1.5 sm:mt-2 cursor-pointer active:scale-[0.98] shadow-md",
          isInCart
            ? "bg-[#252838] text-[#d1a86e]"
            : "bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white"
        )}
      >
        {isInCart ? (
          <>
            <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d1a86e] shrink-0" />
            <span className="truncate">In Dossier</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#d1a86e] shrink-0" />
            <span className="truncate">+ Add</span>
          </>
        )}
      </button>
    </div>
  );
}
