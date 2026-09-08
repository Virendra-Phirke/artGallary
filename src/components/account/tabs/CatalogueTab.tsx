"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Search, Heart, ShoppingBag, Palette } from "lucide-react";
import { Card } from "@/components/ui/card";
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

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<"all" | "available" | "monumental" | "mineral" | "saved">("all");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Filter artworks
  const filteredArtworks = useMemo(() => {
    return artworks.filter((art) => {
      const matchesSearch =
        !search ||
        art.title.toLowerCase().includes(search.toLowerCase()) ||
        (art.medium && art.medium.toLowerCase().includes(search.toLowerCase()));

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
  }, [artworks, search, category, savedArtworkIds]);

  // Reset page upon filter / search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, category, pageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredArtworks.length / pageSize));
  const paginatedArtworks = useMemo(() => {
    return filteredArtworks.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [filteredArtworks, currentPage, pageSize]);

  const startItem = filteredArtworks.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, filteredArtworks.length);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Header & Search Bar */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#262833] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
            Private Viewing Room
          </span>
          <h2 className="font-serif text-3xl text-white mt-1">
            Studio Artwork Catalog
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Browse original works with true dimensions, provenance notes, and 1:1 WebAR preview.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by title or medium..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#14151a] border border-[#262833] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d1a86e]/70"
          />
        </div>
      </div>

      {/* Filter Category Pills */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: "all", label: "All Works" },
          { id: "available", label: "Available for Acquisition" },
          { id: "monumental", label: "Monumental Canvases" },
          { id: "mineral", label: "Mineral & Lapis Series" },
          { id: "saved", label: `Saved Wishlist (${savedArtworkIds.length})` },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id as any)}
            className={`px-4 py-1.5 rounded-full text-xs transition-all uppercase tracking-wider font-medium cursor-pointer ${
              category === cat.id
                ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-md shadow-[#d1a86e]/20"
                : "bg-[#14151a] text-zinc-400 hover:text-white border border-[#262833]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Shortlist Action Bar */}
      {category === "saved" && (
        <div className="bg-[#15161f] border border-[#2b2e3c] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <Heart className="w-4 h-4 fill-rose-400" />
            </div>
            <div>
              <h3 className="font-serif text-base text-white">
                Private Shortlist ({savedArtworkIds.length} Liked Paintings)
              </h3>
              <p className="text-xs text-zinc-400">
                Paintings you have shortlisted. Add them to your Acquisition Dossier to inquire in a single consolidated submission.
              </p>
            </div>
          </div>

          {savedArtworkIds.length > 0 && (
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <Button
                onClick={addAllLikedToCart}
                className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs tracking-wider uppercase px-4 h-9 shadow-md shadow-[#d1a86e]/15 flex items-center gap-1.5 cursor-pointer"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Add All to Acquisition Dossier</span>
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Artworks Grid */}
      {filteredArtworks.length === 0 ? (
        <Card className="p-12 text-center bg-[#14151a]/50 border-[#262833] rounded-2xl space-y-3">
          {category === "saved" ? (
            <>
              <Heart className="w-8 h-8 text-rose-500/50 mx-auto" />
              <p className="font-serif text-lg text-white">Your shortlist is currently empty</p>
              <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                Click the heart icon on any artwork while exploring the catalogue to save paintings to your personal portfolio.
              </p>
              <Button
                onClick={() => setCategory("all")}
                className="mt-2 rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-5 cursor-pointer"
              >
                Explore Catalogue
              </Button>
            </>
          ) : (
            <>
              <Palette className="w-8 h-8 text-zinc-600 mx-auto" />
              <p className="font-serif text-lg text-white">No matching paintings found</p>
              <p className="text-xs text-zinc-500">
                Try adjusting your search query or filter selection.
              </p>
            </>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
          {paginatedArtworks.map((art) => (
            <ArtworkCard key={art.id} artwork={art} />
          ))}
        </div>
      )}

      {/* Standardized Collector Pagination Bar */}
      <CollectorPaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredArtworks.length}
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
