"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Sparkles,
  Mail,
  Share2,
  ShieldCheck,
  Package,
  CheckCircle,
  ArrowRight,
  ChevronLeft,
  Award,
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { InquiryModal } from "./InquiryModal";
import { ShareModal } from "./ShareModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ProgressiveImage } from "@/components/ui/progressive-image";

interface ArtworkDetailClientProps {
  artwork: MockArtwork;
  relatedArtworks: MockArtwork[];
}

export function ArtworkDetailClient({
  artwork,
  relatedArtworks,
}: ArtworkDetailClientProps) {
  const searchParams = useSearchParams();
  const [selectedImage, setSelectedImage] = useState<string>(artwork.coverImageUrl);
  const [inquiryOpen, setInquiryOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  // Auto-open inquiry modal if redirected after authentication
  useEffect(() => {
    if (searchParams.get("inquire") === "open") {
      setInquiryOpen(true);
    }
  }, [searchParams]);

  const allImages = [
    artwork.coverImageUrl,
    ...(artwork.additionalImages || []),
  ];

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Top Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-zinc-500 uppercase tracking-widest overflow-x-auto pb-1 scrollbar-none">
        <Link href="/gallery" className="hover:text-zinc-300 transition-colors shrink-0">
          Gallery
        </Link>
        <span>/</span>
        {artwork.collectionSlug && (
          <>
            <Link
              href={`/collections/${artwork.collectionSlug}`}
              className="hover:text-zinc-300 transition-colors shrink-0"
            >
              {artwork.collectionName || "Collection"}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-zinc-300 truncate">{artwork.title}</span>
      </div>

      {/* Main Artwork Grid Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-10 lg:gap-16 items-start">
        {/* Left Column: High-Res Imagery & Thumbnails (7 Cols) */}
        <div className="lg:col-span-7 space-y-3 sm:space-y-4">
          <div className="relative aspect-[4/3] rounded-xl sm:rounded-2xl overflow-hidden bg-[#14151a] shadow-2xl">
            <ProgressiveImage
              src={selectedImage}
              alt={artwork.altText || artwork.title}
              fill
              priority
              optimizeWidth={1600}
              optimizeQuality={85}
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />

            {/* Availability Badge */}
            <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-10">
              <Badge
                variant={
                  artwork.status === "published"
                    ? "success"
                    : artwork.status === "reserved"
                    ? "warning"
                    : "secondary"
                }
                className="text-[10px] sm:text-[11px] tracking-wider uppercase backdrop-blur-md border-0"
              >
                {artwork.status}
              </Badge>
            </div>
          </div>

          {/* Multiple Image Gallery Thumbnails (Touch-Friendly Scroll) */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto pb-1 scrollbar-none">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-16 h-12 sm:w-20 sm:h-16 rounded-lg sm:rounded-xl overflow-hidden transition-all shrink-0 ${
                    selectedImage === img
                      ? "ring-2 ring-[#d1a86e] scale-105"
                      : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <ProgressiveImage
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    optimizeWidth={200}
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Authenticity Certificate Card with Share Button */}
          <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-[#14151a] flex items-center justify-between gap-3 text-xs text-[#8e92a4] shadow-md">
            <div className="flex items-center gap-2 min-w-0">
              <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d1a86e] shrink-0" />
              <span className="truncate text-[11px] sm:text-xs">Signed certificate included with acquisition.</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="h-7 sm:h-8 px-2 sm:px-2.5 text-zinc-400 hover:text-white shrink-0 gap-1 text-[11px] sm:text-xs rounded-full bg-[#1c1d27]"
            >
              <Share2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>Share</span>
            </Button>
          </div>
        </div>

        {/* Right Column: Curatorial Dossier & CTAs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6 md:space-y-8">
          <div>
            <span className="text-[10px] sm:text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
              {artwork.collectionName || "Original Canvas"}
            </span>
            <h1 className="font-serif text-2xl sm:text-4xl text-white mt-1 leading-tight">
              {artwork.title}
            </h1>
            <p className="font-serif text-xl sm:text-3xl text-[#d1a86e] mt-2 sm:mt-3">
              {formatCurrency(artwork.price, artwork.currency)}
            </p>
          </div>

          {/* Primary Action CTAs - 2 Columns on mobile */}
          <div className="grid grid-cols-2 sm:flex sm:flex-col gap-2 sm:gap-3 pt-1">
            {/* 1. Primary AR CTA */}
            <Button
              asChild
              className="h-10 sm:h-12 text-[11px] sm:text-xs font-semibold uppercase tracking-wider sm:tracking-[0.2em] shadow-xl shadow-[#d1a86e]/15 px-3 rounded-full"
            >
              <Link href={`/ar/${artwork.slug}`} className="flex items-center justify-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 shrink-0 text-[#0d0e12]" />
                <span className="truncate">View in AR</span>
              </Link>
            </Button>

            {/* 2. Inquire CTA */}
            <Button
              variant="secondary"
              onClick={() => setInquiryOpen(true)}
              className="h-10 sm:h-12 text-[11px] sm:text-xs uppercase tracking-wider sm:tracking-[0.2em] font-medium px-3 rounded-full bg-[#1c1d28] hover:bg-[#252736]"
            >
              <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4 mr-1 shrink-0 text-zinc-400" />
              <span className="truncate">Inquire</span>
            </Button>
          </div>

          {/* Technical Specifications Table */}
          <div className="p-3.5 sm:p-5 rounded-xl sm:rounded-2xl bg-[#14151a] space-y-2.5 text-xs shadow-md">
            <div className="flex justify-between py-1 text-zinc-300">
              <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Year</span>
              <span className="text-white font-medium">{artwork.year}</span>
            </div>
            <div className="flex justify-between py-1 text-zinc-300">
              <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Medium</span>
              <span className="text-white font-medium text-right max-w-xs">{artwork.medium}</span>
            </div>
            <div className="flex justify-between py-1 text-zinc-300">
              <span className="text-zinc-500 uppercase tracking-wider text-[11px]">Dimensions</span>
              <span className="text-white font-medium font-mono">
                {formatDimensions(artwork.widthCm, artwork.heightCm, artwork.depthCm)}
              </span>
            </div>
            <div className="flex justify-between py-1 text-zinc-300">
              <span className="text-zinc-500 uppercase tracking-wider text-[11px]">AR Showroom</span>
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>1:1 Scale Calibrated</span>
              </span>
            </div>
          </div>

          {/* Institutional Provenance & Authentication Ledger */}
          <div className="p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#14151a] border border-[#232532] space-y-3 shadow-md">
            <div className="flex items-center justify-between pb-2.5 border-b border-[#20222f]">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-[#d1a86e]" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-white font-medium">
                  Institutional Provenance &amp; Ledger
                </span>
              </div>
              <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-[#1e202d] text-[#d1a86e] uppercase">
                Official Record
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500 text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e]" />
                  ADAGP France Registration
                </span>
                <span className="font-mono text-zinc-300 font-medium text-[11px]">
                  #EV-2026-8891
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500 text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e]" />
                  Catalogue Raisonné
                </span>
                <span className="font-mono text-zinc-300 font-medium text-[11px]">
                  CR-{artwork.year || 2026}-{(artwork.displayOrder || 1).toString().padStart(3, "0")}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500 text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e]" />
                  Certificate of Authenticity
                </span>
                <span className="text-zinc-300 text-[11px]">
                  Arches Vélin 300g • Embossed Dry Seal
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-zinc-500 text-[11px] flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Primary Market Status
                </span>
                <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                  Direct Atelier Provenance
                </span>
              </div>
            </div>
          </div>

          {/* Curatorial Essay */}
          <div className="space-y-2 pt-1">
            <h2 className="text-[10px] sm:text-xs uppercase tracking-[0.25em] text-zinc-400 font-semibold">
              Curatorial Note
            </h2>
            <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed">
              {artwork.longDescription || artwork.description}
            </p>
          </div>

          {/* Shipping & Handling Card */}
          <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#14151a] space-y-1.5 text-xs text-zinc-400 shadow-md">
            <div className="flex items-center gap-2 text-zinc-200 font-medium">
              <Package className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#d1a86e]" />
              <span>White-Glove International Logistics</span>
            </div>
            <p className="leading-relaxed text-[10px] sm:text-[11px]">
              Custom reinforced museum crating. Worldwide insured transit by specialized fine art couriers (Paris, London, New York, Zurich, Tokyo).
            </p>
          </div>
        </div>
      </div>

      {/* Related Artworks from Same Series */}
      {relatedArtworks.length > 0 && (
        <div className="pt-10 sm:pt-14 md:pt-16 space-y-4 sm:space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-white">
              Related from this Series
            </h2>
            <Link
              href="/gallery"
              className="text-[10px] sm:text-xs uppercase tracking-widest text-[#d1a86e] hover:underline"
            >
              View All
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-6 md:gap-8">
            {relatedArtworks.map((rel) => (
              <div
                key={rel.id}
                className="group flex flex-col overflow-hidden bg-[#121319] hover:bg-[#161722] rounded-xl sm:rounded-2xl shadow-md transition-all duration-300"
              >
                <Link href={`/artwork/${rel.slug}`} className="block">
                  <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                    <ProgressiveImage
                      src={rel.coverImageUrl}
                      alt={rel.altText || rel.title}
                      fill
                      optimizeWidth={800}
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-2.5 sm:p-4 space-y-0.5 sm:space-y-1">
                    <h3 className="font-serif text-xs sm:text-base text-white group-hover:text-[#d1a86e] transition-colors truncate">
                      {rel.title}
                    </h3>
                    <p className="text-[10px] sm:text-xs text-zinc-400 font-mono truncate">
                      {formatDimensions(rel.widthCm, rel.heightCm)}
                    </p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <InquiryModal
        artwork={{
          id: artwork.id,
          slug: artwork.slug,
          title: artwork.title,
          medium: artwork.medium,
          year: artwork.year,
          widthCm: artwork.widthCm,
          heightCm: artwork.heightCm,
          price: artwork.price,
          currency: artwork.currency,
          coverImageUrl: artwork.coverImageUrl,
        }}
        isOpen={inquiryOpen}
        onClose={() => setInquiryOpen(false)}
      />

      <ShareModal
        title={artwork.title}
        url={typeof window !== "undefined" ? window.location.href : ""}
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
