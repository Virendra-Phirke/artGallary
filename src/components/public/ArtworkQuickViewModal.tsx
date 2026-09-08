"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  Ruler,
  Check,
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";

interface ArtworkQuickViewModalProps {
  artwork: MockArtwork | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ArtworkQuickViewModal({
  artwork,
  isOpen,
  onClose,
}: ArtworkQuickViewModalProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

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

  if (!isOpen || !artwork) return null;

  const allImages = [
    artwork.coverImageUrl,
    ...(artwork.additionalImages || []),
  ].filter(Boolean);

  const currentImage = allImages[selectedImageIndex] || artwork.coverImageUrl;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Quick view: ${artwork.title}`}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[92vh] bg-[#14151a] border border-[#262833] rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row text-[#f4f4f6]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close artwork preview"
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-[#0d0e12]/80 hover:bg-[#22232a] border border-[#262833] text-zinc-400 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d1a86e]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Artwork Image & Gallery Thumbnails */}
        <div className="md:w-7/12 bg-[#0a0b0d] p-6 sm:p-8 flex flex-col justify-center items-center relative border-b md:border-b-0 md:border-r border-[#1c1d25]">
          <div className="relative w-full aspect-[4/3] sm:aspect-[1/1] max-h-[50vh] md:max-h-[560px] flex items-center justify-center rounded-lg overflow-hidden border border-[#262833]/70 shadow-2xl bg-[#101116]">
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
                  className={`relative w-14 h-14 rounded-md overflow-hidden border transition-all shrink-0 ${
                    selectedImageIndex === i
                      ? "border-[#d1a86e] ring-2 ring-[#d1a86e]/30 scale-105"
                      : "border-[#262833] opacity-60 hover:opacity-100"
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
            <span className="flex items-center gap-1.5">
              <Ruler className="w-3.5 h-3.5 text-[#d1a86e]" />
              {formatDimensions(artwork.widthCm, artwork.heightCm)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
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

            <div className="pt-2 border-t border-[#1c1d25] flex items-baseline justify-between">
              <span className="text-xs text-zinc-400 uppercase tracking-wider">
                Studio Acquisition Price
              </span>
              <span className="font-serif text-xl sm:text-2xl text-[#d1a86e] font-medium">
                {formatCurrency(artwork.price, artwork.currency)}
              </span>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed line-clamp-4">
              {artwork.description}
            </p>

            {/* Curatorial Provenance Checklist */}
            <div className="bg-[#18191e] border border-[#262833] rounded-xl p-4 space-y-2.5 text-xs text-zinc-300">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-[#d1a86e] shrink-0" />
                <span>Signed Certificate of Authenticity by Elena Vance</span>
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
          <div className="pt-4 border-t border-[#1c1d25] space-y-3">
            <Button
              asChild
              size="lg"
              className="w-full rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs tracking-[0.18em] uppercase shadow-lg shadow-[#d1a86e]/15"
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
                variant="outline"
                className="rounded-full border-[#262833] bg-[#18191e] hover:bg-[#22232a] text-white text-xs uppercase tracking-wider"
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
                asChild
                variant="outline"
                className="rounded-full border-[#262833] bg-[#18191e] hover:bg-[#22232a] text-[#d1a86e] hover:text-white text-xs uppercase tracking-wider"
              >
                <Link
                  href={`/contact?artwork=${artwork.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-1.5"
                >
                  <span>Inquire</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
