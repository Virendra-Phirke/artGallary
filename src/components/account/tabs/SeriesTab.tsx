"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { CollectorPaginationBar } from "@/components/account/shared/CollectorPaginationBar";
import { useCollector } from "@/components/account/context/CollectorContext";

const COLLECTIONS_PAGE_SIZE_OPTIONS = [3, 6, 9, 12];

export function SeriesTab() {
  const { collections } = useCollector();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  const totalPages = Math.max(1, Math.ceil(collections.length / pageSize));
  const paginatedCollections = useMemo(() => {
    return collections.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [collections, currentPage, pageSize]);

  const startItem = collections.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, collections.length);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-[#121319] rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/40 space-y-2">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
          Curatorial Cycles
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-white">
          Elena Vance Artwork Series
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-light leading-relaxed">
          Elena Vance organizes her inquiries into multi-year cycles exploring mineral glazes and raw Belgian linen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {paginatedCollections.map((col) => (
          <div
            key={col.id}
            className="group bg-[#121319] hover:bg-[#161722] rounded-3xl overflow-hidden flex flex-col justify-between transition-all duration-500 shadow-xl shadow-black/40 hover:shadow-2xl"
          >
            {col.coverImageUrl && (
              <div className="relative aspect-[16/10] w-full bg-[#0d0e12] overflow-hidden shadow-inner">
                <ProgressiveImage
                  src={col.coverImageUrl}
                  alt={col.title}
                  fill
                  optimizeWidth={800}
                  optimizeQuality={85}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#121319] via-transparent to-transparent" />
                <div className="absolute top-4 left-4">
                  <span className="px-3 py-1 rounded-full bg-[#0d0e12]/85 backdrop-blur-md text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-mono font-semibold">
                    Cycle Suite
                  </span>
                </div>
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <h3 className="font-serif text-2xl text-white font-medium group-hover:text-[#d1a86e] transition-colors">
                  {col.title}
                </h3>

                <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed line-clamp-3 italic font-serif">
                  &ldquo;{col.curatorialStatement || col.description}&rdquo;
                </p>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-mono">
                  {col.artworkSlugs?.length || 1} Documented Canvases
                </span>

                <Button
                  asChild
                  className="h-10 px-5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow-md shadow-[#d1a86e]/15 cursor-pointer transition-all active:scale-[0.98]"
                >
                  <Link href={`/collections/${col.slug}`} className="flex items-center gap-1.5">
                    <span>Explore Series</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Standardized Collector Pagination Bar */}
      <CollectorPaginationBar
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={collections.length}
        startItem={startItem}
        endItem={endItem}
        itemName="series"
        pageSize={pageSize}
        pageSizeOptions={COLLECTIONS_PAGE_SIZE_OPTIONS}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
