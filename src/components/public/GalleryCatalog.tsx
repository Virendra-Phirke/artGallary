"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Search, Sparkles, SlidersHorizontal, Eye, X } from "lucide-react";
import { MockArtwork, MockCollection } from "@/db/mockData";
import { formatCurrency, formatDimensions, cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { ArtworkGridSkeleton } from "@/components/public/ArtworkGridSkeleton";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

export interface PaginationMeta {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface GalleryCatalogProps {
  initialArtworks: MockArtwork[];
  initialPagination?: PaginationMeta;
  collections: MockCollection[];
}

const PAGE_SIZE_OPTIONS = [10, 20, 50, 100];

function getPaginationRange(current: number, total: number) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export function GalleryCatalog({
  initialArtworks,
  initialPagination,
  collections,
}: GalleryCatalogProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const isFirstMount = useRef(true);

  // Core Data & Pagination State
  const [artworks, setArtworks] = useState<MockArtwork[]>(initialArtworks);
  const [pagination, setPagination] = useState<PaginationMeta>(
    initialPagination || {
      page: 1,
      limit: 10,
      totalCount: initialArtworks.length,
      totalPages: Math.max(1, Math.ceil(initialArtworks.length / 10)),
      hasNextPage: false,
      hasPrevPage: false,
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCollection, setSelectedCollection] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState<"featured" | "newest" | "price-asc" | "price-desc">("featured");

  // Server-side fetching helper with DB relaxation
  const fetchArtworks = useCallback(
    async (
      targetPage: number,
      targetLimit: number,
      search: string,
      collection: string,
      status: string,
      sort: string
    ) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("page", String(targetPage));
        params.set("limit", String(targetLimit));
        if (search.trim()) params.set("search", search.trim());
        if (collection !== "all") params.set("collection", collection);
        if (status !== "all") params.set("status", status);
        if (sort !== "featured") params.set("sort", sort);

        // Update URL cleanly without full page refresh
        if (typeof window !== "undefined") {
          const newUrl = `${window.location.pathname}?${params.toString()}`;
          window.history.replaceState({ path: newUrl }, "", newUrl);
        }

        const res = await fetch(`/api/artworks?${params.toString()}`);
        const data = await res.json();
        if (data.success) {
          setArtworks(data.artworks);
          setPagination(data.pagination);
        }
      } catch (err) {
        console.error("Failed to fetch artworks:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Debounced search & filter watcher
  useEffect(() => {
    // Skip initial mount because server already supplied initialArtworks
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const timer = setTimeout(() => {
      fetchArtworks(1, pagination.limit, searchQuery, selectedCollection, selectedStatus, sortBy);
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCollection, selectedStatus, sortBy, pagination.limit, fetchArtworks]);

  const handlePageChange = (newPage: number) => {
    if (newPage === pagination.page || newPage < 1 || newPage > pagination.totalPages || isLoading) {
      return;
    }
    fetchArtworks(newPage, pagination.limit, searchQuery, selectedCollection, selectedStatus, sortBy);
    if (containerRef.current) {
      const top = containerRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top, behavior: "smooth" });
    }
  };

  const handlePageSizeChange = (newLimit: number) => {
    if (newLimit === pagination.limit || isLoading) return;
    fetchArtworks(1, newLimit, searchQuery, selectedCollection, selectedStatus, sortBy);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCollection("all");
    setSelectedStatus("all");
    setSortBy("featured");
    fetchArtworks(1, pagination.limit, "", "all", "all", "featured");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" || selectedCollection !== "all" || selectedStatus !== "all";

  const startItem = pagination.totalCount === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1;
  const endItem = Math.min(pagination.page * pagination.limit, pagination.totalCount);
  const paginationRange = getPaginationRange(pagination.page, pagination.totalPages);

  return (
    <div ref={containerRef} className="space-y-8 md:space-y-10">
      {/* Search & Filter Toolbar */}
      <Card className="p-4 sm:p-5 md:p-6 space-y-4 shadow-xl bg-[#121318] border-[#22242f]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 justify-between">
          {/* Search Input */}
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
              {pagination.totalCount} works
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

        {/* Collection Series Filter Pills */}
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
              All Series
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

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 shrink-0">
            {["all", "published", "reserved", "sold"].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setSelectedStatus(status)}
                className={`text-[11px] px-2.5 py-1 rounded-md capitalize transition-colors cursor-pointer ${
                  selectedStatus === status
                    ? "bg-[#252836] text-[#d1a86e] font-medium"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Top Results Summary Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-400 border-b border-[#1c1e28] pb-3">
        <div className="font-mono">
          Showing <span className="text-white font-semibold">{startItem}–{endItem}</span> of{" "}
          <span className="text-[#d1a86e] font-semibold">{pagination.totalCount}</span> masterworks
          {hasActiveFilters && (
            <span className="text-zinc-500 ml-2">
              (Filtered results •{" "}
              <button
                onClick={clearFilters}
                className="text-[#d1a86e] hover:underline cursor-pointer"
              >
                Reset
              </button>
              )
            </span>
          )}
        </div>

        {/* Page Size Selector */}
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider">Per Page:</span>
          <div className="flex items-center rounded-md border border-[#262833] bg-[#14151a] p-0.5">
            {PAGE_SIZE_OPTIONS.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => handlePageSizeChange(size)}
                disabled={isLoading}
                className={cn(
                  "px-2.5 py-0.5 text-xs font-mono rounded transition-colors cursor-pointer",
                  pagination.limit === size
                    ? "bg-[#d1a86e] text-black font-semibold shadow-sm"
                    : "text-zinc-400 hover:text-white"
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Catalog View / Skeletons */}
      {isLoading ? (
        <ArtworkGridSkeleton count={pagination.limit} />
      ) : artworks.length === 0 ? (
        <Card className="p-12 text-center space-y-4 bg-[#14151a] border-[#22242f]">
          <div className="w-12 h-12 rounded-full bg-[#1e202b] text-zinc-500 mx-auto flex items-center justify-center">
            <Search className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg text-white font-medium">No Masterworks Found</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              No paintings match your current search query or filter criteria in the studio catalogue.
            </p>
          </div>
          <Button
            onClick={clearFilters}
            variant="outline"
            size="sm"
            className="text-xs uppercase tracking-wider text-[#d1a86e] border-[#d1a86e]/30 hover:bg-[#d1a86e]/10"
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in-50 duration-300">
          {artworks.map((art, index) => (
            <Card
              key={art.id}
              className="group flex flex-col overflow-hidden hover:border-[#383b4b] transition-all bg-[#14151a] border-[#22242f] shadow-xl"
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

                {/* Hover Quick Actions */}
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

      {/* Bottom Shadcn Pagination & Page Size Toolbar */}
      {pagination.totalPages > 1 && (
        <div className="pt-6 border-t border-[#1f212b] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-xs text-zinc-500 font-mono order-2 md:order-1">
            Page <span className="text-white font-medium">{pagination.page}</span> of{" "}
            <span className="text-white font-medium">{pagination.totalPages}</span>
          </div>

          <div className="order-1 md:order-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className={
                      !pagination.hasPrevPage || isLoading
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {paginationRange.map((item, idx) => (
                  <PaginationItem key={idx}>
                    {item === "..." ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        isActive={item === pagination.page}
                        onClick={() => handlePageChange(Number(item))}
                        disabled={isLoading}
                        className="cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className={
                      !pagination.hasNextPage || isLoading
                        ? "pointer-events-none opacity-40"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>

          <div className="flex items-center gap-2 order-3">
            <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider">Per Page:</span>
            <div className="flex items-center rounded-md border border-[#262833] bg-[#14151a] p-0.5">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handlePageSizeChange(size)}
                  disabled={isLoading}
                  className={cn(
                    "px-2.5 py-0.5 text-xs font-mono rounded transition-colors cursor-pointer",
                    pagination.limit === size
                      ? "bg-[#d1a86e] text-black font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-white"
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
