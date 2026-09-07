import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function CollectionDetailLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-16">
      {/* Back Link Skeleton */}
      <Skeleton className="h-4 w-36 bg-[#1f212b]" />

      {/* Collection Header Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-7 space-y-5">
          <Skeleton className="h-3 w-32 bg-[#d1a86e]/20" />
          <Skeleton className="h-10 w-3/4 bg-[#1f212b]" />
          <div className="space-y-2">
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

      {/* Works Grid Skeleton */}
      <div className="border-t border-[#1c1d25] pt-12 space-y-8">
        <Skeleton className="h-7 w-48 bg-[#1f212b]" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="bg-[#14151a] border-[#262833] overflow-hidden">
              <div className="relative aspect-[4/3] bg-[#16171d]">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#262833]/30 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
              </div>
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/5 bg-[#1f212b]" />
                <Skeleton className="h-3 w-2/3 bg-[#181a22]" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
