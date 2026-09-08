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
        "group relative bg-[#13141a] border border-[#242633] rounded-3xl overflow-hidden p-4 space-y-4 hover:border-[#d1a86e]/50 hover:shadow-2xl hover:shadow-[#d1a86e]/5 transition-all duration-300 flex flex-col justify-between",
        className
      )}
    >
      <div>
        <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#0a0b0e]">
          <ProgressiveImage
            src={artwork.coverImageUrl}
            alt={artwork.title}
            fill
            optimizeWidth={650}
            optimizeQuality={85}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />

          {/* Top Floating Badges */}
          <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5">
            <Badge
              variant={
                artwork.status === "published"
                  ? "success"
                  : artwork.status === "reserved"
                  ? "warning"
                  : "secondary"
              }
              className="backdrop-blur-md bg-black/70 border border-white/10 text-[10px] uppercase font-mono tracking-wider px-2 py-0.5"
            >
              {artwork.status === "published" ? "Available" : artwork.status}
            </Badge>

            {artwork.collectionName && (
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full backdrop-blur-md bg-black/60 border border-white/10 text-[9px] text-zinc-300 font-medium truncate max-w-[110px]">
                {artwork.collectionName}
              </span>
            )}
          </div>

          {/* Bookmark / Like Button */}
          <button
            onClick={() => toggleSaveArtwork(artwork.id)}
            className={cn(
              "absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md border transition-all cursor-pointer shadow-lg",
              isSaved
                ? "bg-[#d1a86e] text-[#0d0e12] border-[#d1a86e] shadow-[#d1a86e]/30 scale-105"
                : "bg-black/60 text-zinc-400 hover:text-white border-white/10 hover:bg-black/80"
            )}
            title={isSaved ? "Shortlisted in Private Portfolio" : "Save to Private Shortlist"}
            aria-label="Bookmark artwork"
          >
            <Heart className={cn("w-3.5 h-3.5", isSaved ? "fill-[#0d0e12] text-[#0d0e12]" : "text-zinc-300")} />
          </button>

          {/* Hover Overlay with Inspect & AR Buttons */}
          <div className="absolute inset-0 bg-black/65 backdrop-blur-[3px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            <button
              onClick={() => setInspectArtwork(artwork)}
              className="w-11 h-11 bg-white hover:bg-zinc-100 text-[#0d0e12] rounded-full flex items-center justify-center shadow-xl cursor-pointer transform group-hover:scale-100 scale-90 transition-all duration-200 active:scale-95"
              title="Inspect 4K Details"
              aria-label="Inspect artwork"
            >
              <Eye className="w-4 h-4" />
            </button>

            <Link
              href={`/ar/${artwork.slug}`}
              className="w-11 h-11 bg-gradient-to-r from-[#d1a86e] to-[#b98e54] hover:brightness-110 text-[#0d0e12] rounded-full flex items-center justify-center shadow-xl shadow-[#d1a86e]/30 transform group-hover:scale-100 scale-90 transition-all duration-200 active:scale-95"
              title="View in Your Space (1:1 WebAR)"
              aria-label="View in AR"
            >
              <Sparkles className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Artwork Meta */}
        <div className="space-y-2 pt-3.5 px-0.5">
          <div className="flex items-baseline justify-between gap-2">
            <h4 className="font-serif text-lg text-white group-hover:text-[#d1a86e] transition-colors line-clamp-1">
              {artwork.title}
            </h4>
            {artwork.price && (
              <span className="text-sm font-mono text-[#d1a86e] font-semibold shrink-0">
                {formatCurrency(artwork.price, artwork.currency)}
              </span>
            )}
          </div>

          <p className="text-xs text-zinc-400 line-clamp-1 font-light">{artwork.medium}</p>

          <div className="pt-2.5 border-t border-[#1e202b] flex items-center justify-between text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5 font-mono text-zinc-400">
              <Ruler className="w-3 h-3 text-[#d1a86e]" />
              {formatDimensions(artwork.widthCm, artwork.heightCm)}
            </span>

            <button
              onClick={() => setInspectArtwork(artwork)}
              className="text-[#d1a86e] hover:text-[#e2c18d] uppercase tracking-wider text-[11px] font-semibold cursor-pointer transition-colors"
            >
              Examine &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Add to Acquisition Dossier Button */}
      <button
        onClick={() => toggleCartArtwork(artwork.id)}
        className={cn(
          "w-full h-10 px-4 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-2 border cursor-pointer active:scale-[0.98]",
          isInCart
            ? "bg-[#1f2230] text-[#d1a86e] border-[#d1a86e]/60 shadow-md shadow-[#d1a86e]/10"
            : "bg-[#161720] hover:bg-[#1d1f2b] text-zinc-300 hover:text-white border-[#282a38] hover:border-[#d1a86e]/40"
        )}
      >
        {isInCart ? (
          <>
            <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>In Acquisition Dossier</span>
          </>
        ) : (
          <>
            <ShoppingBag className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>+ Add to Dossier</span>
          </>
        )}
      </button>
    </div>
  );
}
