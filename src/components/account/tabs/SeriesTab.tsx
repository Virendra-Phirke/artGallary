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
      <div className="border-b border-[#262833] pb-6">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
          Curatorial Cycles
        </span>
        <h2 className="font-serif text-3xl text-white mt-1">
          Elena Vance Artwork Series
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Elena Vance organizes her inquiries into multi-year cycles exploring mineral glazes and raw Belgian linen.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {paginatedCollections.map((col) => (
          <div
            key={col.id}
            className="bg-[#14151a] border border-[#262833] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between hover:border-[#d1a86e]/30 transition-all duration-300"
          >
            {col.coverImageUrl && (
              <div className="relative aspect-[16/9] w-full bg-[#0d0e12]">
                <ProgressiveImage
                  src={col.coverImageUrl}
                  alt={col.title}
                  fill
                  optimizeWidth={800}
                  optimizeQuality={85}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14151a] via-transparent to-transparent" />
              </div>
            )}

            <div className="p-6 sm:p-8 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-semibold">
                  Featured Series
                </span>
                <h3 className="font-serif text-2xl text-white font-medium">
                  {col.title}
                </h3>
              </div>

              <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed line-clamp-3">
                {col.curatorialStatement || col.description}
              </p>

              <div className="pt-2 flex items-center justify-between border-t border-[#1c1d25]">
                <span className="text-xs text-zinc-500 font-mono">
                  {col.artworkSlugs?.length || 1} Documented Canvases
                </span>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-[#262833] bg-[#181920] hover:bg-[#22242e] text-[#d1a86e] hover:text-white text-xs uppercase tracking-wider"
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
