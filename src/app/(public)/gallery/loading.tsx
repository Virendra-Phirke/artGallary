import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function GalleryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-12">
      {/* Header Plaque Skeleton */}
      <div className="max-w-2xl space-y-4">
        <Skeleton className="h-3 w-36 bg-[#d1a86e]/20" />
        <Skeleton className="h-10 w-3/4 sm:w-96 bg-[#1f212b]" />
        <Skeleton className="h-4 w-full bg-[#181a22]" />
        <Skeleton className="h-4 w-5/6 bg-[#181a22]" />
      </div>

      {/* Filter Toolbar Skeleton */}
      <Card className="p-5 space-y-4 bg-[#14151a] border-[#262833]">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <Skeleton className="h-10 w-full sm:w-80 bg-[#1e2029]" />
          <Skeleton className="h-10 w-44 bg-[#1e2029]" />
        </div>
        <div className="pt-3 border-t border-[#1f212b] flex items-center gap-2 overflow-hidden">
          <Skeleton className="h-4 w-16 bg-[#1e2029] shrink-0" />
          <Skeleton className="h-7 w-20 rounded-full bg-[#1e2029] shrink-0" />
          <Skeleton className="h-7 w-28 rounded-full bg-[#1e2029] shrink-0" />
          <Skeleton className="h-7 w-32 rounded-full bg-[#1e2029] shrink-0" />
          <Skeleton className="h-7 w-24 rounded-full bg-[#1e2029] shrink-0" />
        </div>
      </Card>

      {/* 6-Card Artwork Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[...Array(6)].map((_, i) => (
          <Card
            key={i}
            className="flex flex-col overflow-hidden bg-[#14151a] border-[#262833]"
          >
            {/* Image Placeholder with Aspect Ratio */}
            <div className="relative aspect-[4/3] bg-[#16171d] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-[#262833]/30 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
              <div className="absolute top-3 left-3">
                <Skeleton className="h-5 w-16 rounded-md bg-[#1f212b]" />
              </div>
            </div>

            {/* Content Body Placeholder */}
            <div className="p-5 space-y-3">
              <div className="flex items-baseline justify-between gap-2">
                <Skeleton className="h-5 w-3/5 bg-[#1f212b]" />
                <Skeleton className="h-5 w-20 bg-[#d1a86e]/20" />
              </div>
              <Skeleton className="h-3 w-4/5 bg-[#181a22]" />
              <div className="pt-2 border-t border-[#1c1d25] flex items-center justify-between">
                <Skeleton className="h-3 w-24 bg-[#181a22]" />
                <Skeleton className="h-3 w-12 bg-[#181a22]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
