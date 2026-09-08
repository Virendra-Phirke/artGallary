"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Heart, ShoppingBag, Palette, X, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArtworkCard } from "@/components/account/shared/ArtworkCard";
import { CollectorPaginationBar } from "@/components/account/shared/CollectorPaginationBar";
import { useCollector } from "@/components/account/context/CollectorContext";

const GALLERY_PAGE_SIZE_OPTIONS = [6, 12, 18, 24];

export function CatalogueTab() {
  const {
    artworks,
    savedArtworkIds,
    addAllLikedToCart,
  } = useCollector();

  // Search, Filter & Sort State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "available" | "monumental" | "mineral" | "saved">("all");
  const [sortBy, setSortBy] = useState<"featured" | "price-desc" | "price-asc" | "year-desc">("featured");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Category counts
  const counts = useMemo(() => {
    return {
      all: artworks.length,
      available: artworks.filter((a) => a.status === "published").length,
      monumental: artworks.filter((a) => (a.widthCm && a.widthCm >= 100) || (a.heightCm && a.heightCm >= 100)).length,
      mineral: artworks.filter((a) => {
        const m = (a.medium || "").toLowerCase();
        const d = (a.description || "").toLowerCase();
        return m.includes("lapis") || m.includes("mineral") || d.includes("lapis") || d.includes("mineral");
      }).length,
      saved: savedArtworkIds.length,
    };
  }, [artworks, savedArtworkIds]);

  // Filter and sort artworks
  const processedArtworks = useMemo(() => {
    let result = artworks.filter((art) => {
      const matchesSearch =
        !search ||
        art.title.toLowerCase().includes(search.toLowerCase()) ||
        (art.medium && art.medium.toLowerCase().includes(search.toLowerCase())) ||
        (art.collectionName && art.collectionName.toLowerCase().includes(search.toLowerCase()));

      if (!matchesSearch) return false;

      if (category === "available") return art.status === "published";
      if (category === "monumental") {
        return (art.widthCm && art.widthCm >= 100) || (art.heightCm && art.heightCm >= 100);
      }
      if (category === "mineral") {
        const m = (art.medium || "").toLowerCase();
        const d = (art.description || "").toLowerCase();
        return m.includes("lapis") || m.includes("mineral") || d.includes("lapis") || d.includes("mineral");
      }
      if (category === "saved") {
        return savedArtworkIds.includes(art.id);
      }
      return true;
    });

    if (sortBy === "price-desc") {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (sortBy === "price-asc") {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (sortBy === "year-desc") {
      result.sort((a, b) => (b.year || 0) - (a.year || 0));
    } else {
      result.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    }

    return result;
  }, [artworks, search, category, savedArtworkIds, sortBy]);

  // Reset page upon filter / search / sort changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, sortBy, pageSize]);

  const totalPages = Math.max(1, Math.ceil(processedArtworks.length / pageSize));
  const paginatedArtworks = useMemo(() => {
    return processedArtworks.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [processedArtworks, currentPage, pageSize]);

  const startItem = processedArtworks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, processedArtworks.length);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Filter & Search Bar */}
      <div className="bg-[#121319] rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/40 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
                Catalogue Filter &amp; Search
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e]" />
              <span className="text-[10px] text-zinc-400 font-mono">
                {processedArtworks.length} of {artworks.length} Artworks Match
              </span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl text-white mt-1">
              Private Curated Collection
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search title, medium, series..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 bg-[#1c1d28] rounded-full pl-10 pr-9 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-colors shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full sm:w-auto h-10 appearance-none bg-[#1c1d28] rounded-full px-4 pr-9 text-xs text-zinc-200 focus:outline-none cursor-pointer font-mono shadow-sm"
              >
                <option value="featured">Curatorial Sequence</option>
                <option value="price-desc">Valuation: High to Low</option>
                <option value="price-asc">Valuation: Low to High</option>
                <option value="year-desc">Year: Newest Originals</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-zinc-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          {[
            { id: "all", label: "All Works", count: counts.all },
            { id: "available", label: "Available for Acquisition", count: counts.available },
            { id: "monumental", label: "Monumental Canvases", count: counts.monumental },
            { id: "mineral", label: "Mineral & Lapis Series", count: counts.mineral },
            { id: "saved", label: "Saved Wishlist", count: counts.saved },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as any)}
              className={`inline-flex items-center gap-2 h-9 px-4 rounded-full text-xs transition-all uppercase tracking-wider font-medium cursor-pointer shadow-sm ${
                category === cat.id
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-md shadow-[#d1a86e]/20"
                  : "bg-[#1c1d28] text-zinc-400 hover:text-white hover:bg-[#252736]"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                  category === cat.id
                    ? "bg-[#0d0e12] text-[#d1a86e]"
                    : "bg-[#121319] text-zinc-400"
                }`}
              >
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Shortlist Action Bar when viewing Saved works */}
      {category === "saved" && (
        <div className="bg-[#181925] rounded-3xl p-6 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-black/40">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#2d1215] flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
              <Heart className="w-5 h-5 fill-rose-400" />
            </div>
            <div>
              <h3 className="font-serif text-lg text-white font-medium">
                Private Shortlist ({savedArtworkIds.length} Liked Paintings)
              </h3>
              <p className="text-xs text-zinc-400">
                Shortlisted pieces can be transferred directly into your Acquisition Dossier to formulate a consolidated inquiry.
              </p>
            </div>
          </div>

          {savedArtworkIds.length > 0 && (
            <Button
              onClick={addAllLikedToCart}
              className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs tracking-wider uppercase px-5 h-10 shadow-md shadow-[#d1a86e]/15 flex items-center gap-2 cursor-pointer shrink-0 transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add All to Acquisition Dossier</span>
            </Button>
          )}
        </div>
      )}

      {/* Artworks Grid */}
      {processedArtworks.length === 0 ? (
        <div className="p-16 text-center bg-[#121319] rounded-3xl space-y-4 shadow-xl shadow-black/40">
          {category === "saved" ? (
            <>
              <Heart className="w-10 h-10 text-rose-500/40 mx-auto" />
              <h3 className="font-serif text-2xl text-white">Your shortlist is currently empty</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Click the heart icon on any artwork while exploring the catalogue to save paintings to your personal shortlist.
              </p>
              <Button
                onClick={() => setCategory("all")}
                className="mt-2 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-6 h-10 cursor-pointer shadow-md shadow-[#d1a86e]/15"
              >
                Explore Catalogue
              </Button>
            </>
          ) : (
            <>
              <Palette className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="font-serif text-2xl text-white">No matching paintings found</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Try adjusting your search keywords or resetting the category filter.
              </p>
              <Button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
                className="mt-2 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-xs uppercase tracking-wider px-6 h-10 cursor-pointer shadow-md"
              >
                Reset All Filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5 sm:gap-6">
          {paginatedArtworks.map((art) => (
            <ArtworkCard key={art.id} artwork={art} />
          ))}
        </div>
      )}

      {/* Standardized Collector Pagination Bar */}
      <CollectorPaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={processedArtworks.length}
        startItem={startItem}
        endItem={endItem}
        itemName="artworks"
        pageSize={pageSize}
        pageSizeOptions={GALLERY_PAGE_SIZE_OPTIONS}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
