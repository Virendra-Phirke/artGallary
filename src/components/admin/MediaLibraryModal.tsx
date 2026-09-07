"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, X, Image as ImageIcon, Check, Loader2 } from "lucide-react";

export interface MediaItem {
  id: string;
  fileName: string;
  fileUrl: string;
  dimensions?: string;
  byteSize?: string;
  uploadedAt?: string;
  provider?: string;
}

interface MediaLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
}

export function MediaLibraryModal({
  isOpen,
  onClose,
  onSelect,
}: MediaLibraryModalProps) {
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchMedia = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.success && Array.isArray(data.media)) {
        setMediaList(data.media);
      }
    } catch (err) {
      console.error("Failed to load media assets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchMedia();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredMedia = mediaList.filter((m) =>
    m.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (item: MediaItem) => {
    setSelectedId(item.id);
    onSelect(item);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-[#121317] border border-[#262833] rounded-2xl w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Header */}
        <div className="p-6 border-b border-[#1f212b] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d1a86e]/10 border border-[#d1a86e]/30 flex items-center justify-center text-[#d1a86e]">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-white font-medium">
                Gallery Media Library
              </h2>
              <p className="text-xs text-zinc-400">
                Choose from previously uploaded and optimized master artwork assets
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-[#1f212b] bg-[#17181f]">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search uploaded files by name..."
              className="w-full bg-[#0e0f13] border border-[#262833] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#d1a86e] focus:outline-none"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
          {isLoading ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-zinc-500">
              <Loader2 className="w-6 h-6 animate-spin text-[#d1a86e]" />
              <span className="text-xs">Loading media repository...</span>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-2 text-zinc-500">
              <ImageIcon className="w-8 h-8 opacity-40" />
              <p className="text-xs">No media assets found matching query.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {filteredMedia.map((item) => {
                const isSelected = selectedId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => handleSelect(item)}
                    className={`group relative flex flex-col text-left rounded-xl overflow-hidden border transition-all duration-200 ${
                      isSelected
                        ? "border-[#d1a86e] ring-2 ring-[#d1a86e]/30 scale-[0.98]"
                        : "border-[#262833] hover:border-zinc-500 bg-[#17181f]"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full bg-black/50 overflow-hidden">
                      <Image
                        src={item.fileUrl}
                        alt={item.fileName}
                        fill
                        sizes="200px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#d1a86e]/30 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full bg-[#d1a86e] text-black flex items-center justify-center shadow-lg">
                            <Check className="w-5 h-5 stroke-[2.5]" />
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-2.5 space-y-1">
                      <p className="text-xs font-medium text-white truncate group-hover:text-[#d1a86e] transition-colors">
                        {item.fileName}
                      </p>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                        <span>{item.dimensions || "—"}</span>
                        <span>{item.byteSize || ""}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#1f212b] bg-[#14151a] flex justify-between items-center text-xs text-zinc-500">
          <span>Total {filteredMedia.length} assets</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-neutral-800 text-white hover:bg-neutral-700 transition-colors text-xs font-medium"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
