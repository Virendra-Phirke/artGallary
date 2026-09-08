import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminArtworksLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Plaque */}
      <div className="bg-[#121319] p-6 sm:p-8 rounded-3xl shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32 bg-[#d1a86e]/20" />
          <Skeleton className="h-8 w-48 bg-[#1f212b]" />
          <Skeleton className="h-3 w-80 bg-[#181a22]" />
        </div>
        <Skeleton className="h-10 w-32 rounded-xl bg-[#d1a86e]/30" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="bg-[#121319] rounded-2xl p-4 sm:p-5 shadow-xl shadow-black/40 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <Skeleton className="h-10 w-full md:w-80 rounded-xl bg-[#1a1b26]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 rounded-full bg-[#1a1b26]" />
          <Skeleton className="h-8 w-20 rounded-full bg-[#1a1b26]" />
          <Skeleton className="h-8 w-16 rounded-full bg-[#1a1b26]" />
          <Skeleton className="h-8 w-16 rounded-full bg-[#1a1b26]" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-[#121319] rounded-3xl shadow-xl shadow-black/40 overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-4 w-40 bg-[#1a1b26]" />
          <Skeleton className="h-4 w-20 bg-[#1a1b26]" />
        </div>
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 rounded-2xl bg-[#1a1b26] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-10 rounded-xl bg-[#121319] shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 bg-[#1f212b]" />
                  <Skeleton className="h-3 w-20 bg-[#121319]" />
                </div>
              </div>
              <Skeleton className="h-4 w-28 bg-[#121319] hidden sm:block" />
              <Skeleton className="h-4 w-20 bg-[#121319] hidden md:block" />
              <Skeleton className="h-4 w-16 bg-[#d1a86e]/30" />
              <Skeleton className="h-6 w-20 rounded-full bg-[#121319]" />
              <Skeleton className="h-8 w-16 rounded-xl bg-[#121319]" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
