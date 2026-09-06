"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, X, Sparkles, ExternalLink, Check, RefreshCw } from "lucide-react";
import { UnsplashArtImage } from "@/lib/unsplash";

interface UnsplashPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (image: UnsplashArtImage) => void;
}

const CATEGORIES = [
  "Contemporary Art",
  "Oil Painting",
  "Abstract",
  "Minimalist Art",
  "Impasto Texture",
  "Modern Sculpture",
];

export function UnsplashPickerModal({
  isOpen,
  onClose,
  onSelect,
}: UnsplashPickerModalProps) {
  const [images, setImages] = useState<UnsplashArtImage[]>([]);
  const [searchQuery, setSearchQuery] = useState("Contemporary Art");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchImages = async (query: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/unsplash?q=${encodeURIComponent(query)}&count=12`);
      const data = await res.json();
      if (data.success && Array.isArray(data.images)) {
        setImages(data.images);
      }
    } catch (err) {
      console.error("Failed to load Unsplash art:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchImages(searchQuery);
    }
  }, [isOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchImages(searchQuery);
  };

  const handleCategoryClick = (cat: string) => {
    setSearchQuery(cat);
    fetchImages(cat);
  };

  const handleSelectImage = (img: UnsplashArtImage) => {
    setSelectedId(img.id);
    onSelect(img);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#14151a] border border-[#262833] w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-[#262833] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#d1a86e]/10 border border-[#d1a86e]/20 flex items-center justify-center text-[#d1a86e]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-white font-medium">
                Unsplash Contemporary Art Library
              </h2>
              <p className="text-xs text-zinc-400">
                Select high-resolution curated photography &amp; paintings for temporary artwork display.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Categories Bar */}
        <div className="p-4 border-b border-[#262833] bg-[#0e0f13] space-y-3">
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contemporary art, oil paintings, abstract..."
                className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d1a86e] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-[#262833] hover:bg-[#323544] text-xs text-white font-medium rounded-lg transition-colors flex items-center gap-1.5"
            >
              {isLoading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Search"}
            </button>
          </form>

          {/* Quick Categories */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryClick(cat)}
                className={`px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap transition-colors ${
                  searchQuery === cat
                    ? "bg-[#d1a86e] text-black font-semibold"
                    : "bg-[#1a1c23] text-zinc-400 hover:text-white border border-[#262833]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Image Grid */}
        <div className="p-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-zinc-500 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-[#d1a86e]" />
              <span>Fetching fine art from Unsplash...</span>
            </div>
          ) : images.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-zinc-500 text-xs">
              No artworks found for &quot;{searchQuery}&quot;. Try a different search term.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => {
                const isSelected = selectedId === img.id;
                return (
                  <div
                    key={img.id}
                    onClick={() => handleSelectImage(img)}
                    className={`group relative rounded-xl overflow-hidden bg-black/40 border cursor-pointer transition-all hover:scale-[1.02] ${
                      isSelected
                        ? "border-[#d1a86e] ring-2 ring-[#d1a86e]/30"
                        : "border-[#262833] hover:border-zinc-500"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full">
                      <Image
                        src={img.thumbUrl}
                        alt={img.altText}
                        fill
                        sizes="250px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-2.5">
                        <span className="text-[11px] text-white font-medium line-clamp-1">
                          {img.title}
                        </span>
                        <span className="text-[10px] text-zinc-400">
                          by {img.author}
                        </span>
                      </div>
                    </div>

                    {isSelected && (
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#d1a86e] text-black flex items-center justify-center shadow-lg">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#262833] bg-[#0e0f13] flex items-center justify-between text-xs text-zinc-500">
          <span>Photos provided via Unsplash API with verified dimensions and artist attribution.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-[#262833] hover:bg-white/5 text-zinc-300"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
