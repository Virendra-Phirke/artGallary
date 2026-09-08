"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import {
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Ruler,
  Check,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, formatDimensions, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";

interface ArtworkQuickViewModalProps {
  artwork: MockArtwork | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleCart?: (artwork: MockArtwork) => void;
  isInCart?: boolean;
  onToggleSave?: (artwork: MockArtwork) => void;
  isSaved?: boolean;
  onContactClick?: (artwork: MockArtwork) => void;
}

export function ArtworkQuickViewModal({
  artwork,
  isOpen,
  onClose,
  onToggleCart,
  isInCart = false,
  onToggleSave,
  isSaved = false,
  onContactClick,
}: ArtworkQuickViewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    setSelectedImageIndex(0);
  }, [artwork?.id]);

  if (!isOpen || !artwork || !mounted) return null;

  const allImages = [
    artwork.coverImageUrl,
    ...(artwork.additionalImages || []),
  ].filter(Boolean);

  const currentImage = allImages[selectedImageIndex] || artwork.coverImageUrl;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${artwork.title}`}
      className="fixed inset-0 z-[110] flex items-center justify-center p-3.5 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-in fade-in duration-200 pointer-events-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-[#121319] rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-[#f4f4f6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Controls: Like / Save & Close */}
        <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
          {onToggleSave && (
            <button
              onClick={() => onToggleSave(artwork)}
              aria-label={isSaved ? "Remove from saved" : "Save artwork"}
              className={cn(
                "p-2.5 rounded-full backdrop-blur-md transition-all focus-visible:outline-none cursor-pointer shadow-md",
                isSaved
                  ? "bg-[#d1a86e] text-[#0d0e12]"
                  : "bg-[#1c1d28] hover:bg-[#252736] text-zinc-400 hover:text-white"
              )}
              title={isSaved ? "Saved to Liked Works" : "Save to Liked Works"}
            >
              <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
            </button>
          )}

          <button
            onClick={onClose}
            aria-label="Close artwork preview"
            className="p-2.5 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-400 hover:text-white transition-colors focus-visible:outline-none cursor-pointer shadow-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Left Column: Artwork Image & Gallery Thumbnails */}
        <div className="md:w-7/12 bg-[#090a0f] p-6 sm:p-8 flex flex-col justify-center items-center relative">
          <div className="relative w-full aspect-[4/3] sm:aspect-[1/1] max-h-[50vh] md:max-h-[560px] flex items-center justify-center rounded-2xl overflow-hidden shadow-2xl bg-[#0d0e12]">
            <ProgressiveImage
              src={currentImage}
              alt={artwork.altText || artwork.title}
              fill
              optimizeWidth={1200}
              optimizeQuality={90}
              sizes="(max-width: 768px) 100vw, 55vw"
              className="object-contain p-2"
            />
          </div>

          {/* Additional Image Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-2 mt-4 overflow-x-auto max-w-full pb-1">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImageIndex(i)}
                  className={`relative w-14 h-14 rounded-xl overflow-hidden transition-all shrink-0 cursor-pointer ${
                    selectedImageIndex === i
                      ? "ring-2 ring-[#d1a86e] scale-105"
                      : "opacity-60 hover:opacity-100 bg-[#161720]"
                  }`}
                  aria-label={`View image view ${i + 1}`}
                >
                  <img
                    src={img}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 flex items-center gap-4 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5 font-mono">
              <Ruler className="w-3.5 h-3.5 text-[#d1a86e]" />
              {formatDimensions(artwork.widthCm, artwork.heightCm)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-mono">
              <Layers className="w-3.5 h-3.5 text-[#d1a86e]" />
              {artwork.year} Original
            </span>
          </div>
        </div>

        {/* Right Column: Curatorial Details & Quick Actions */}
        <div className="md:w-5/12 p-6 sm:p-8 flex flex-col justify-between overflow-y-auto max-h-[50vh] md:max-h-full space-y-6">
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                {artwork.collectionName || "Original Masterwork"}
              </span>
              <Badge
                variant={
                  artwork.status === "published"
                    ? "success"
                    : artwork.status === "reserved"
                    ? "warning"
                    : "secondary"
                }
                className="border-0 text-[10px] uppercase font-mono"
              >
                {artwork.status === "published"
                  ? "Available for Acquisition"
                  : artwork.status}
              </Badge>
            </div>

            {/* Title & Price */}
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl text-white font-medium leading-tight">
                {artwork.title}
              </h2>
              <p className="text-xs text-zinc-400 mt-1 font-light">
                {artwork.medium}
              </p>
            </div>

            <div className="pt-2 flex items-baseline justify-between">
              <span className="text-xs text-zinc-400 uppercase tracking-wider">
                Studio Acquisition Price
              </span>
              <span className="font-serif text-xl sm:text-2xl text-[#d1a86e] font-medium">
                {formatCurrency(artwork.price, artwork.currency)}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed line-clamp-4 font-light">
              {artwork.description}
            </p>

            {/* Curatorial Provenance Checklist */}
            <div className="bg-[#1a1b26] rounded-2xl p-4 space-y-2.5 text-xs text-zinc-300 shadow-inner">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#d1a86e] shrink-0" />
                <span>Signed Certificate of Authenticity by Vishal Patil</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#d1a86e] shrink-0" />
                <span>Custom climate-insulated archival wooden crate</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#d1a86e] shrink-0" />
                <span>Global insured white-glove courier dispatch</span>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="pt-4 space-y-2.5">
            {onToggleCart && (
              <Button
                type="button"
                onClick={() => onToggleCart(artwork)}
                className={cn(
                  "w-full rounded-full text-xs tracking-wider uppercase font-semibold transition-all shadow-md py-2.5 cursor-pointer",
                  isInCart
                    ? "bg-[#252838] text-[#d1a86e]"
                    : "bg-[#1c1d28] hover:bg-[#252736] text-white"
                )}
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-2 text-[#d1a86e]" />
                <span>
                  {isInCart
                    ? "In Acquisition Dossier (Click to Remove)"
                    : "+ Add to Acquisition Dossier"}
                </span>
              </Button>
            )}

            <Button
              asChild
              size="lg"
              className="w-full rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs tracking-[0.18em] uppercase shadow-md shadow-[#d1a86e]/15 cursor-pointer"
            >
              <Link
                href={`/ar/${artwork.slug}`}
                className="flex items-center justify-center gap-2"
                onClick={onClose}
              >
                <Sparkles className="w-4 h-4" />
                <span>View in Your Space (AR)</span>
              </Link>
            </Button>

            <div className="grid grid-cols-2 gap-2.5">
              <Button
                asChild
                className="rounded-full bg-[#1c1d28] hover:bg-[#252736] text-white text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                <Link
                  href={`/artwork/${artwork.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5"
                >
                  <span>Provenance</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>

              <Button
                type="button"
                onClick={() => {
                  if (onContactClick) {
                    onContactClick(artwork);
                  } else {
                    onClose();
                    window.location.href = `/contact?artwork=${artwork.slug}`;
                  }
                }}
                className="rounded-full bg-[#1c1d28] hover:bg-[#252736] text-[#d1a86e] hover:text-white text-xs uppercase tracking-wider shadow-sm cursor-pointer"
              >
                <span className="flex items-center justify-center gap-1.5">
                  <span>Inquire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
