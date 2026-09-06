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
  Layers,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { MockArtwork } from "@/db/mockData";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { InquiryModal } from "./InquiryModal";
import { ShareModal } from "./ShareModal";

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
    <div className="space-y-24">
      {/* Top Breadcrumbs */}
      <div className="flex items-center space-x-2 text-xs text-zinc-500 uppercase tracking-widest">
        <Link href="/gallery" className="hover:text-zinc-300 transition-colors">
          Gallery
        </Link>
        <span>/</span>
        {artwork.collectionSlug && (
          <>
            <Link
              href={`/collections/${artwork.collectionSlug}`}
              className="hover:text-zinc-300 transition-colors"
            >
              {artwork.collectionName || "Collection"}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-zinc-300">{artwork.title}</span>
      </div>

      {/* Main Artwork Grid Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start">
        {/* Left Column: High-Res Imagery & Zoom */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#14151a] border border-[#262833] shadow-2xl">
            <Image
              src={selectedImage}
              alt={artwork.altText}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-cover"
            />

            {/* Availability Badge */}
            <div className="absolute top-4 left-4">
              <span
                className={`text-xs tracking-widest uppercase px-3 py-1 rounded-full font-medium ${
                  artwork.status === "published"
                    ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800/80"
                    : artwork.status === "reserved"
                    ? "bg-amber-950/90 text-amber-300 border border-amber-800/80"
                    : "bg-zinc-900/90 text-zinc-400 border border-zinc-700/80"
                }`}
              >
                {artwork.status}
              </span>
            </div>
          </div>

          {/* Multiple Image Gallery Thumbnails */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-16 rounded-md overflow-hidden border transition-all ${
                    selectedImage === img
                      ? "border-[#d1a86e] scale-105"
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

          {/* Secondary Quick Provenance Note */}
          <div className="p-4 bg-[#14151a] border border-[#262833] rounded-lg flex items-center justify-between text-xs text-[#8e92a4]">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#d1a86e]" />
              <span>Signed certificate of authenticity included with acquisition.</span>
            </div>
            <button
              onClick={() => setShareOpen(true)}
              className="flex items-center gap-1 text-zinc-400 hover:text-white transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share</span>
            </button>
          </div>
        </div>

        {/* Right Column: Curatorial Dossier & CTAs */}
        <div className="lg:col-span-5 space-y-8">
          <div>
            <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
              {artwork.collectionName || "Original Canvas"}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl text-white mt-1">
              {artwork.title}
            </h1>
            <p className="font-serif text-2xl text-[#d1a86e] mt-3">
              {formatCurrency(artwork.price, artwork.currency)}
            </p>
          </div>

          {/* Primary Action CTAs */}
          <div className="space-y-3 pt-2">
            {/* 1. Primary AR CTA */}
            <Link
              href={`/ar/${artwork.slug}`}
              className="w-full flex items-center justify-center gap-2.5 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] py-4 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] transition-all shadow-xl shadow-[#d1a86e]/15"
            >
              <Sparkles className="w-4 h-4" />
              <span>View in Your Space</span>
            </Link>

            {/* 2. Inquire CTA */}
            <button
              onClick={() => setInquiryOpen(true)}
              className="w-full flex items-center justify-center gap-2.5 bg-[#18191e] hover:bg-[#22232a] border border-[#262833] text-white py-4 rounded-xl text-xs font-medium uppercase tracking-[0.2em] transition-colors"
            >
              <Mail className="w-4 h-4 text-zinc-400" />
              <span>Inquire about Acquisition</span>
            </button>
          </div>

          {/* Technical Specifications Table */}
          <div className="border-t border-[#1f212b] pt-6 space-y-3.5 text-xs">
            <div className="flex justify-between py-1 border-b border-[#18191e]">
              <span className="text-zinc-500 uppercase tracking-wider">Year</span>
              <span className="text-white font-medium">{artwork.year}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#18191e]">
              <span className="text-zinc-500 uppercase tracking-wider">Medium</span>
              <span className="text-white font-medium text-right max-w-xs">{artwork.medium}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#18191e]">
              <span className="text-zinc-500 uppercase tracking-wider">Dimensions</span>
              <span className="text-white font-medium">
                {formatDimensions(artwork.widthCm, artwork.heightCm, artwork.depthCm)}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-[#18191e]">
              <span className="text-zinc-500 uppercase tracking-wider">AR Capability</span>
              <span className="text-emerald-400 flex items-center gap-1 font-medium">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>Calibrated 1:1 Scale Reticle</span>
              </span>
            </div>
          </div>

          {/* Curatorial Essay */}
          <div className="space-y-4 pt-2">
            <h2 className="text-xs uppercase tracking-[0.25em] text-zinc-400 font-semibold">
              Curatorial Note
            </h2>
            <p className="text-sm text-[#a6aabf] leading-relaxed">
              {artwork.longDescription || artwork.description}
            </p>
          </div>

          {/* Shipping & Handling */}
          <div className="p-4 bg-[#14151a] border border-[#262833] rounded-lg space-y-2 text-xs text-zinc-400">
            <div className="flex items-center gap-2 text-zinc-200 font-medium">
              <Package className="w-4 h-4 text-[#d1a86e]" />
              <span>White-Glove International Logistics</span>
            </div>
            <p className="leading-relaxed">
              Custom reinforced museum crating. Worldwide insured transit by specialized fine art couriers (Paris, London, New York, Zurich, Tokyo).
            </p>
          </div>
        </div>
      </div>

      {/* Related Artworks from Same Collection */}
      {relatedArtworks.length > 0 && (
        <div className="border-t border-[#1c1d25] pt-16">
          <div className="flex items-baseline justify-between mb-8">
            <h2 className="font-serif text-2xl text-white">
              Related from this Series
            </h2>
            <Link
              href="/gallery"
              className="text-xs uppercase tracking-widest text-[#d1a86e] hover:underline"
            >
              View All Works
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {relatedArtworks.map((rel) => (
              <Link
                key={rel.id}
                href={`/artwork/${rel.slug}`}
                className="group block bg-[#14151a] border border-[#262833] rounded-xl overflow-hidden hover:border-[#383b4b] transition-all"
              >
                <div className="relative aspect-[4/3] bg-black/40">
                  <Image
                    src={rel.coverImageUrl}
                    alt={rel.altText}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-serif text-base text-white group-hover:text-[#d1a86e] transition-colors">
                    {rel.title}
                  </h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    {formatDimensions(rel.widthCm, rel.heightCm)}
                  </p>
                </div>
              </Link>
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
