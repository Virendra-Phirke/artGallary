import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="space-y-8 w-full animate-pulse">
      {/* Header Block Skeleton */}
      <div className="bg-[#121319] p-6 sm:p-8 rounded-3xl shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32 bg-[#d1a86e]/20" />
          <Skeleton className="h-8 w-48 bg-[#1f212b]" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-xl bg-[#1a1b26]" />
          <Skeleton className="h-9 w-24 rounded-xl bg-[#1a1b26]" />
        </div>
      </div>

      {/* Metrics Row: 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-3">
            <Skeleton className="h-3 w-24 bg-[#1f212b]" />
            <Skeleton className="h-8 w-16 bg-[#d1a86e]/30" />
            <Skeleton className="h-3 w-32 bg-[#1a1b26]" />
          </div>
        ))}
      </div>

      {/* Attention / Audit Panel Skeleton */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-4">
        <div className="flex items-center justify-between pb-2">
          <Skeleton className="h-6 w-52 bg-[#1f212b]" />
          <Skeleton className="h-4 w-28 bg-[#1a1b26]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-20 rounded-2xl bg-[#1a1b26]" />
          <Skeleton className="h-20 rounded-2xl bg-[#1a1b26]" />
          <Skeleton className="h-20 rounded-2xl bg-[#1a1b26]" />
          <Skeleton className="h-20 rounded-2xl bg-[#1a1b26]" />
        </div>
      </div>

      {/* Two Column Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-4">
          <Skeleton className="h-6 w-36 bg-[#1f212b]" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-2xl bg-[#1a1b26]" />
            ))}
          </div>
        </div>

        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-4">
          <Skeleton className="h-6 w-28 bg-[#1f212b]" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-xl bg-[#1a1b26]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
