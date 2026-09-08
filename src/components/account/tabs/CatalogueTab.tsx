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
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      {/* Top Filter & Search Bar */}
      <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl shadow-black/40 space-y-4 sm:space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] sm:text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
                Catalogue Filter &amp; Search
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e]" />
              <span className="text-[9px] sm:text-[10px] text-zinc-400 font-mono">
                {processedArtworks.length} of {artworks.length} Match
              </span>
            </div>
            <h2 className="font-serif text-xl sm:text-3xl text-white mt-0.5">
              Private Curated Collection
            </h2>
          </div>

          <div className="flex flex-row items-center gap-2 sm:gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-72">
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-500 absolute left-3 sm:left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search paintings..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 sm:h-10 bg-[#1c1d28] rounded-full pl-8 sm:pl-10 pr-8 text-xs text-white placeholder:text-zinc-500 focus:outline-none transition-colors shadow-inner"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-0.5 cursor-pointer"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="relative shrink-0">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-9 sm:h-10 appearance-none bg-[#1c1d28] rounded-full px-3 sm:px-4 pr-8 text-[11px] sm:text-xs text-zinc-200 focus:outline-none cursor-pointer font-mono shadow-sm"
              >
                <option value="featured">Curatorial</option>
                <option value="price-desc">Price: High &darr;</option>
                <option value="price-asc">Price: Low &uarr;</option>
                <option value="year-desc">Year: New</option>
              </select>
              <ArrowUpDown className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-zinc-500 absolute right-2.5 sm:right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pt-1">
          {[
            { id: "all", label: "All Works", count: counts.all },
            { id: "available", label: "Available", count: counts.available },
            { id: "monumental", label: "Monumental", count: counts.monumental },
            { id: "mineral", label: "Mineral", count: counts.mineral },
            { id: "saved", label: "Shortlist", count: counts.saved },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id as any)}
              className={`inline-flex items-center gap-1.5 h-7 sm:h-9 px-2.5 sm:px-4 rounded-full text-[10px] sm:text-xs transition-all uppercase tracking-wider font-medium cursor-pointer shadow-sm ${
                category === cat.id
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-md shadow-[#d1a86e]/20"
                  : "bg-[#1c1d28] text-zinc-400 hover:text-white hover:bg-[#252736]"
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[9px] sm:text-[10px] font-mono px-1 sm:px-1.5 py-0.2 rounded-full ${
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
        <div className="bg-[#181925] rounded-2xl sm:rounded-3xl p-4 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 shadow-xl shadow-black/40">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-[#2d1215] flex items-center justify-center text-rose-400 shrink-0 shadow-inner">
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-rose-400" />
            </div>
            <div>
              <h3 className="font-serif text-sm sm:text-lg text-white font-medium">
                Private Shortlist ({savedArtworkIds.length} Liked Works)
              </h3>
              <p className="text-[11px] sm:text-xs text-zinc-400">
                Transfer directly into your Acquisition Dossier to inquire.
              </p>
            </div>
          </div>

          {savedArtworkIds.length > 0 && (
            <Button
              onClick={addAllLikedToCart}
              className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-[10px] sm:text-xs tracking-wider uppercase px-4 sm:px-5 h-8 sm:h-10 shadow-md shadow-[#d1a86e]/15 flex items-center gap-2 cursor-pointer shrink-0 transition-all active:scale-[0.98]"
            >
              <ShoppingBag className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>Add All to Dossier</span>
            </Button>
          )}
        </div>
      )}

      {/* Artworks Grid */}
      {processedArtworks.length === 0 ? (
        <div className="p-8 sm:p-16 text-center bg-[#121319] rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-xl shadow-black/40">
          {category === "saved" ? (
            <>
              <Heart className="w-8 h-8 sm:w-10 sm:h-10 text-rose-500/40 mx-auto" />
              <h3 className="font-serif text-xl sm:text-2xl text-white">Your shortlist is currently empty</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Click the heart icon on any artwork while exploring the catalogue to save paintings to your personal shortlist.
              </p>
              <Button
                onClick={() => setCategory("all")}
                className="mt-2 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-5 sm:px-6 h-9 sm:h-10 cursor-pointer shadow-md shadow-[#d1a86e]/15"
              >
                Explore Catalogue
              </Button>
            </>
          ) : (
            <>
              <Palette className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-600 mx-auto" />
              <h3 className="font-serif text-xl sm:text-2xl text-white">No matching paintings found</h3>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed">
                Try adjusting your search keywords or resetting the category filter.
              </p>
              <Button
                onClick={() => {
                  setSearch("");
                  setCategory("all");
                }}
                className="mt-2 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-xs uppercase tracking-wider px-5 sm:px-6 h-9 sm:h-10 cursor-pointer shadow-md"
              >
                Reset All Filters
              </Button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-6">
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
