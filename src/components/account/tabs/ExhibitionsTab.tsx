"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { CollectorPaginationBar } from "@/components/account/shared/CollectorPaginationBar";
import { useCollector } from "@/components/account/context/CollectorContext";

const EXHIBITIONS_PAGE_SIZE_OPTIONS = [2, 3, 6, 9];

export function ExhibitionsTab() {
  const { exhibitions } = useCollector();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(3);

  const totalPages = Math.max(1, Math.ceil(exhibitions.length / pageSize));
  const paginatedExhibitions = useMemo(() => {
    return exhibitions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [exhibitions, currentPage, pageSize]);

  const startItem = exhibitions.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, exhibitions.length);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="border-b border-[#262833] pb-6">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
          Retrospectives &amp; Showcases
        </span>
        <h2 className="font-serif text-3xl text-white mt-1">
          Curated Exhibitions
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Chronology of museum installations, solo gallery shows, and private vernissages.
        </p>
      </div>

      <div className="space-y-6">
        {paginatedExhibitions.map((exh) => (
          <div
            key={exh.id}
            className="group bg-[#14151a] border border-[#262833] hover:border-[#d1a86e]/40 rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center shadow-xl hover:shadow-2xl hover:shadow-[#d1a86e]/5 transition-all duration-300"
          >
            {exh.coverImageUrl && (
              <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#262833] bg-[#0d0e12]">
                <ProgressiveImage
                  src={exh.coverImageUrl}
                  alt={exh.title}
                  fill
                  optimizeWidth={700}
                  optimizeQuality={85}
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <Badge variant={exh.status === "current" ? "success" : "gold"} className="gap-1.5 shadow-lg">
                    {exh.status === "current" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                    {exh.status === "current" ? "Currently Open" : "Upcoming Vernissage"}
                  </Badge>
                </div>
              </div>
            )}

            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-semibold">
                  {exh.subtitle || "Solo Retrospective"}
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium group-hover:text-[#d1a86e] transition-colors">
                  {exh.title}
                </h3>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs">
                {exh.location && (
                  <div className="flex items-center gap-2 text-zinc-300">
                    <MapPin className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                    <span>{exh.location}</span>
                  </div>
                )}

                {exh.startDate && (
                  <div className="flex items-center gap-2 text-zinc-400 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                    <span>
                      {new Date(exh.startDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                      {exh.endDate && ` — ${new Date(exh.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed">
                {exh.description || exh.curatorNote}
              </p>

              <div className="pt-3 flex flex-wrap items-center gap-3">
                <Button
                  asChild
                  className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-6 shadow-md shadow-[#d1a86e]/15 cursor-pointer"
                >
                  <Link href={`/exhibitions/${exh.slug}`}>
                    <span>View Exhibition Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </Link>
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="rounded-full border-[#262833] bg-[#181920] hover:bg-[#22242e] text-zinc-300 hover:text-white text-xs uppercase tracking-wider cursor-pointer"
                >
                  <Link href={`/contact?subject=VIP%20Vernissage%20Pass%20-%20${encodeURIComponent(exh.title)}`}>
                    <span>Request VIP Vernissage Pass</span>
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
        totalItems={exhibitions.length}
        startItem={startItem}
        endItem={endItem}
        itemName="exhibitions"
        pageSize={pageSize}
        pageSizeOptions={EXHIBITIONS_PAGE_SIZE_OPTIONS}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
      />
    </div>
  );
}
