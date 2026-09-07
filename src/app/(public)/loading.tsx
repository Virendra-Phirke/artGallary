import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function PublicLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-12">
      {/* Top Banner Plaque */}
      <div className="max-w-xl space-y-4">
        <Skeleton className="h-3 w-32 bg-[#d1a86e]/20" />
        <Skeleton className="h-10 w-3/4 sm:w-96 bg-[#1f212b]" />
        <Skeleton className="h-4 w-full bg-[#181a22]" />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden bg-[#14151a] border border-[#262833] space-y-4 p-4"
          >
            <div className="relative aspect-[4/3] rounded-xl bg-[#16171d] overflow-hidden">
              <div className="w-full h-full bg-gradient-to-r from-transparent via-[#262833]/30 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-5 w-2/3 bg-[#1f212b]" />
              <Skeleton className="h-4 w-full bg-[#181a22]" />
              <Skeleton className="h-4 w-1/3 bg-[#d1a86e]/20" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
