"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, Sparkles, SlidersHorizontal, Eye, X } from "lucide-react";
import { MockArtwork, MockCollection } from "@/db/mockData";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";

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

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedCollection !== "all" || selectedStatus !== "all";

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCollection("all");
    setSelectedStatus("all");
    setSortBy("featured");
  };

  return (
    <div className="space-y-8 md:space-y-10">
      {/* Search & Filter Toolbar with shadcn Card */}
      <Card className="p-4 sm:p-5 md:p-6 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 justify-between">
          {/* Search Input using shadcn Input */}
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              type="text"
              placeholder="Search by title, medium, pigment..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 text-xs bg-[#1a1c23] border-[#262833] focus-visible:ring-[#d1a86e]"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Sort & Quick Counter */}
          <div className="flex items-center justify-between sm:justify-end gap-3">
            <span className="text-xs text-zinc-500 font-mono sm:hidden">
              {filteredArtworks.length} works
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[11px] uppercase tracking-wider text-zinc-500 hidden md:inline">
                Sort:
              </span>
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-zinc-300 focus:border-[#d1a86e] focus:outline-none cursor-pointer h-10"
              >
                <option value="featured">Curated Order</option>
                <option value="newest">Year (Newest)</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="price-asc">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {/* Collection Series Filter Pills (Scrollable on Mobile, Wrapped on Tablet+) */}
        <div className="pt-3 border-t border-[#1f212b] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-nowrap md:flex-wrap">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 shrink-0 flex items-center gap-1 mr-1">
              <SlidersHorizontal className="w-3 h-3" />
              <span>Series:</span>
            </span>

            <Button
              size="sm"
              variant={selectedCollection === "all" ? "default" : "secondary"}
              onClick={() => setSelectedCollection("all")}
              className={`h-7 px-3 text-[11px] rounded-full shrink-0 font-medium ${
                selectedCollection === "all"
                  ? "bg-[#d1a86e] text-black font-semibold"
                  : "text-zinc-400"
              }`}
            >
              All Works ({initialArtworks.length})
            </Button>

            {collections.map((col) => {
              const isSelected = selectedCollection === col.slug;
              return (
                <Button
                  key={col.slug}
                  size="sm"
                  variant={isSelected ? "default" : "secondary"}
                  onClick={() => setSelectedCollection(col.slug)}
                  className={`h-7 px-3 text-[11px] rounded-full shrink-0 font-medium ${
                    isSelected
                      ? "bg-[#d1a86e] text-black font-semibold"
                      : "text-zinc-400"
                  }`}
                >
                  {col.title}
                </Button>
              );
            })}
          </div>

          {/* Status Filter Pills */}
          <div className="flex items-center gap-1.5 shrink-0 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 mr-1 hidden lg:inline">
              Status:
            </span>
            {["all", "published", "reserved", "sold"].map((st) => (
              <Button
                key={st}
                variant={selectedStatus === st ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setSelectedStatus(st)}
                className={`h-7 px-2.5 text-[10px] uppercase tracking-wider rounded-md font-medium shrink-0 ${
                  selectedStatus === st
                    ? "bg-[#262833] text-[#d1a86e] font-semibold border border-[#d1a86e]/30"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {st}
              </Button>
            ))}

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-7 px-2 text-[10px] uppercase tracking-wider text-red-400 hover:text-red-300 shrink-0 ml-1"
                title="Reset all filters"
              >
                Reset
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Artworks Grid */}
      {filteredArtworks.length === 0 ? (
        <Card className="py-20 px-6 text-center space-y-4">
          <p className="text-zinc-400 font-serif text-xl">
            No artworks match your selected criteria.
          </p>
          <p className="text-xs text-zinc-500 max-w-sm mx-auto">
            Try adjusting your search terms or clearing active filters to browse the full studio collection.
          </p>
          <Button
            onClick={clearFilters}
            variant="outline"
            size="sm"
            className="text-xs uppercase tracking-wider text-[#d1a86e]"
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredArtworks.map((art, index) => (
            <Card
              key={art.id}
              className="group flex flex-col overflow-hidden hover:border-[#383b4b] transition-all bg-[#14151a]"
            >
              {/* Image Frame */}
              <div className="relative aspect-[4/3] bg-black/40 overflow-hidden">
                <ProgressiveImage
                  src={art.coverImageUrl}
                  alt={art.altText || art.title}
                  fill
                  priority={index < 3}
                  optimizeWidth={700}
                  optimizeQuality={80}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />

                {/* Status Badge */}
                <div className="absolute top-3 left-3 z-10">
                  <Badge
                    variant={
                      art.status === "published"
                        ? "success"
                        : art.status === "reserved"
                        ? "warning"
                        : "secondary"
                    }
                    className="text-[10px] tracking-wider uppercase backdrop-blur-md"
                  >
                    {art.status}
                  </Badge>
                </div>

                {/* Hover Quick Actions (Desktop) / Persistent Quick Links */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                  <Button asChild size="icon" className="rounded-full bg-white text-black hover:bg-zinc-200 shadow-xl">
                    <Link href={`/artwork/${art.slug}`} title="Examine Details">
                      <Eye className="w-4 h-4" />
                    </Link>
                  </Button>
                  {art.arConfig?.isArEnabled && (
                    <Button asChild size="icon" className="rounded-full bg-[#d1a86e] text-black hover:bg-[#e2c18d] shadow-xl">
                      <Link href={`/ar/${art.slug}`} title="View in Your Space (AR)">
                        <Sparkles className="w-4 h-4" />
                      </Link>
                    </Button>
                  )}
                </div>
              </div>

              {/* Information Body */}
              <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <Link
                      href={`/artwork/${art.slug}`}
                      className="font-serif text-lg sm:text-xl text-white hover:text-[#d1a86e] transition-colors leading-snug"
                    >
                      {art.title}
                    </Link>
                    <span className="text-sm font-semibold text-[#d1a86e] shrink-0">
                      {formatCurrency(art.price, art.currency)}
                    </span>
                  </div>

                  <p className="text-xs text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                    {art.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-[#1f212b] flex items-center justify-between text-xs text-zinc-500">
                  <span className="text-[11px] font-mono">
                    {formatDimensions(art.widthCm, art.heightCm)}
                  </span>
                  <Link
                    href={`/ar/${art.slug}`}
                    className="flex items-center gap-1 text-[#d1a86e] hover:underline uppercase text-[10px] tracking-wider font-semibold"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>View in AR</span>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
