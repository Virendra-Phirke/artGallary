"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Sparkles, SlidersHorizontal, Eye } from "lucide-react";
import { MockArtwork, MockCollection } from "@/db/mockData";
import { formatCurrency, formatDimensions } from "@/lib/utils";

interface GalleryCatalogProps {
  initialArtworks: MockArtwork[];
  collections: MockCollection[];
}

export function GalleryCatalog({ initialArtworks, collections }: GalleryCatalogProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "newest" | "price-asc" | "price-desc">("featured");

  const filteredArtworks = useMemo(() => {
    return initialArtworks
      .filter((art) => {
        // Status filter
        if (selectedStatus !== "all" && art.status !== selectedStatus) return false;

        // Collection filter
        if (selectedCollection !== "all" && art.collectionSlug !== selectedCollection)
          return false;

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = art.title.toLowerCase().includes(q);
          const matchMedium = art.medium.toLowerCase().includes(q);
          const matchDesc = art.description.toLowerCase().includes(q);
          if (!matchTitle && !matchMedium && !matchDesc) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return b.year - a.year;
        if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
        return a.displayOrder - b.displayOrder;
      });
  }, [initialArtworks, searchQuery, selectedCollection, selectedStatus, sortBy]);

  return (
    <div className="space-y-10">
      {/* Search & Filter Toolbar */}
      <div className="bg-[#14151a] border border-[#262833] rounded-xl p-4 md:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              placeholder="Search by title, medium, or pigment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:border-[#d1a86e] focus:outline-none"
            />
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-3">
            <span className="text-[11px] uppercase tracking-wider text-zinc-500 hidden sm:inline">
              Sort:
            </span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-zinc-300 focus:border-[#d1a86e] focus:outline-none cursor-pointer"
            >
              <option value="featured">Curated Order</option>
              <option value="newest">Year (Newest)</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="price-asc">Price: Low to High</option>
            </select>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#1f212b]">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 mr-2 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            <span>Series:</span>
          </span>

          <button
            onClick={() => setSelectedCollection("all")}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              selectedCollection === "all"
                ? "bg-[#d1a86e] text-[#0d0e12] border-[#d1a86e] font-semibold"
                : "bg-[#1a1c23] text-zinc-400 border-[#262833] hover:text-white"
            }`}
          >
            All Works ({initialArtworks.length})
          </button>

          {collections.map((col) => (
            <button
              key={col.slug}
              onClick={() => setSelectedCollection(col.slug)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                selectedCollection === col.slug
                  ? "bg-[#d1a86e] text-[#0d0e12] border-[#d1a86e] font-semibold"
                  : "bg-[#1a1c23] text-zinc-400 border-[#262833] hover:text-white"
              }`}
            >
              {col.title}
            </button>
          ))}

          <span className="text-[10px] uppercase tracking-widest text-zinc-500 ml-auto mr-1 hidden lg:inline">
            Status:
          </span>
          <div className="flex items-center gap-1.5 ml-auto">
            {["all", "published", "reserved", "sold"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`text-[11px] uppercase tracking-wider px-2.5 py-1 rounded-md transition-colors ${
                  selectedStatus === st
                    ? "bg-[#262833] text-[#d1a86e] font-medium"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Artworks Grid */}
      {filteredArtworks.length === 0 ? (
        <div className="py-24 text-center space-y-4 bg-[#14151a]/40 border border-[#262833] rounded-xl">
          <p className="text-zinc-400 font-serif text-xl">
            No artworks match your selected filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCollection("all");
              setSelectedStatus("all");
            }}
            className="text-xs uppercase tracking-widest text-[#d1a86e] hover:underline"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {filteredArtworks.map((art) => (
            <div
              key={art.id}
              className="group flex flex-col bg-[#14151a] border border-[#262833] rounded-xl overflow-hidden hover:border-[#383b4b] transition-all"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                <Image
                  src={art.coverImageUrl}
                  alt={art.altText}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Status Tag */}
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`text-[10px] tracking-widest uppercase px-2.5 py-1 rounded-full font-medium ${
                      art.status === "published"
                        ? "bg-emerald-950/90 text-emerald-300 border border-emerald-800/70"
                        : art.status === "reserved"
                        ? "bg-amber-950/90 text-amber-300 border border-amber-800/70"
                        : "bg-zinc-900/90 text-zinc-400 border border-zinc-700/70"
                    }`}
                  >
                    {art.status}
                  </span>
                </div>

                {/* Hover Quick Actions */}
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

              {/* Information Body */}
              <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/artwork/${art.slug}`}
                      className="font-serif text-xl text-white hover:text-[#d1a86e] transition-colors leading-snug"
                    >
                      {art.title}
                    </Link>
                    <span className="text-sm font-semibold text-[#d1a86e] shrink-0">
                      {formatCurrency(art.price, art.currency)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                    {art.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1f212b] flex items-center justify-between text-xs text-zinc-500">
                  <span>{formatDimensions(art.widthCm, art.heightCm)}</span>
                  <Link
                    href={`/ar/${art.slug}`}
                    className="flex items-center gap-1 text-[#d1a86e] hover:underline uppercase text-[10px] tracking-wider font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>View in AR</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
