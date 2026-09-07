import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ExhibitionDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-16">
      {/* Back Link Skeleton */}
      <Skeleton className="h-4 w-40 bg-[#1f212b]" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-3">
            <Skeleton className="h-5 w-20 rounded-md bg-[#1f212b]" />
            <Skeleton className="h-4 w-36 bg-[#181a22]" />
          </div>

          <Skeleton className="h-10 w-3/4 bg-[#1f212b]" />
          <Skeleton className="h-4 w-1/3 bg-[#d1a86e]/20" />

          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded-full bg-[#181a22]" />
            <Skeleton className="h-4 w-32 bg-[#181a22]" />
          </div>

          <div className="space-y-2 pt-2">
            <Skeleton className="h-4 w-full bg-[#181a22]" />
            <Skeleton className="h-4 w-11/12 bg-[#181a22]" />
            <Skeleton className="h-4 w-4/5 bg-[#181a22]" />
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#16171d] border border-[#262833]">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-[#262833]/30 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
}
