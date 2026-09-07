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
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { InquiryModal } from "./InquiryModal";
import { ShareModal } from "./ShareModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: High-Res Imagery & Thumbnails (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#14151a] border border-[#262833] shadow-2xl">
            <Image
              src={selectedImage}
              alt={artwork.altText || artwork.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />

            {/* Availability Badge */}
            <div className="absolute top-4 left-4 z-10">
              <Badge
                variant={
                  artwork.status === "published"
                    ? "success"
                    : artwork.status === "reserved"
                    ? "warning"
                    : "secondary"
                }
                className="text-[11px] tracking-wider uppercase backdrop-blur-md"
              >
                {artwork.status}
              </Badge>
            </div>
          </div>

          {/* Multiple Image Gallery Thumbnails (Touch-Friendly Scroll) */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-16 rounded-xl overflow-hidden border transition-all shrink-0 ${
                    selectedImage === img
                      ? "border-[#d1a86e] ring-2 ring-[#d1a86e]/30 scale-105"
                      : "border-[#262833] opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Authenticity Certificate Card with Share Button */}
          <Card className="p-4 bg-[#14151a] flex items-center justify-between gap-3 text-xs text-[#8e92a4]">
            <div className="flex items-center gap-2.5 min-w-0">
              <ShieldCheck className="w-4 h-4 text-[#d1a86e] shrink-0" />
              <span className="truncate">Signed certificate of authenticity included with acquisition.</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShareOpen(true)}
              className="h-8 px-2.5 text-zinc-400 hover:text-white shrink-0 gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </Button>
          </Card>
        </div>

        {/* Right Column: Curatorial Dossier & CTAs (5 Cols) */}
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          <div>
            <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
              {artwork.collectionName || "Original Canvas"}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-white mt-1 leading-tight">
              {artwork.title}
            </h1>
            <p className="font-serif text-2xl md:text-3xl text-[#d1a86e] mt-3">
              {formatCurrency(artwork.price, artwork.currency)}
            </p>
          </div>

          {/* Primary Action CTAs using shadcn Buttons */}
          <div className="space-y-3 pt-1">
            {/* 1. Primary AR CTA */}
            <Button
              asChild
              className="w-full h-12 text-xs font-semibold uppercase tracking-[0.2em] shadow-xl shadow-[#d1a86e]/15"
            >
              <Link href={`/ar/${artwork.slug}`}>
                <Sparkles className="w-4 h-4 mr-2" />
                <span>View in Your Space</span>
              </Link>
            </Button>

            {/* 2. Inquire CTA */}
            <Button
              variant="secondary"
              onClick={() => setInquiryOpen(true)}
              className="w-full h-12 text-xs uppercase tracking-[0.2em] font-medium"
            >
              <Mail className="w-4 h-4 mr-2 text-zinc-400" />
              <span>Inquire about Acquisition</span>
            </Button>
          </div>

          {/* Technical Specifications Table */}
          <div className="border-t border-[#1f212b] pt-5 space-y-3 text-xs">
            <div className="flex justify-between py-1.5 border-b border-[#18191e]">
              <span className="text-zinc-500 uppercase tracking-wider">Year</span>
              <span className="text-white font-medium">{artwork.year}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#18191e]">
              <span className="text-zinc-500 uppercase tracking-wider">Medium</span>
              <span className="text-white font-medium text-right max-w-xs">{artwork.medium}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#18191e]">
              <span className="text-zinc-500 uppercase tracking-wider">Dimensions</span>
              <span className="text-white font-medium font-mono">
                {formatDimensions(artwork.widthCm, artwork.heightCm, artwork.depthCm)}
              </span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-[#18191e]">
              <span className="text-zinc-500 uppercase tracking-wider">AR Showroom</span>
              <span className="text-emerald-400 flex items-center gap-1.5 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>True 1:1 Scale Calibrated</span>
              </span>
            </div>
          </div>

          {/* Curatorial Essay */}
          <div className="space-y-3 pt-2">
            <h2 className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-semibold">
              Curatorial Note
            </h2>
            <p className="text-sm text-[#a6aabf] leading-relaxed">
              {artwork.longDescription || artwork.description}
            </p>
          </div>

          {/* Shipping & Handling Card */}
          <Card className="p-4 bg-[#14151a] space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-200 font-medium">
              <Package className="w-4 h-4 text-[#d1a86e]" />
              <span>White-Glove International Logistics</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              Custom reinforced museum crating. Worldwide insured transit by specialized fine art couriers (Paris, London, New York, Zurich, Tokyo).
            </p>
          </Card>
        </div>
      </div>

      {/* Related Artworks from Same Series */}
      {relatedArtworks.length > 0 && (
        <div className="border-t border-[#1c1d25] pt-14 md:pt-16 space-y-6">
          <div className="flex items-baseline justify-between">
            <h2 className="font-serif text-2xl md:text-3xl text-white">
              Related from this Series
            </h2>
            <Link
              href="/gallery"
              className="text-xs uppercase tracking-widest text-[#d1a86e] hover:underline"
            >
              View All Works
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
            {relatedArtworks.map((rel) => (
              <Card
                key={rel.id}
                className="group flex flex-col overflow-hidden hover:border-[#383b4b] transition-all bg-[#14151a]"
              >
                <Link href={`/artwork/${rel.slug}`} className="block">
                  <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                    <Image
                      src={rel.coverImageUrl}
                      alt={rel.altText || rel.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-4 space-y-1">
                    <h3 className="font-serif text-base text-white group-hover:text-[#d1a86e] transition-colors truncate">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-zinc-400 font-mono">
                      {formatDimensions(rel.widthCm, rel.heightCm)}
                    </p>
                  </div>
                </Link>
              </Card>
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
