import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function CollectionsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-16">
      {/* Header Plaque Skeleton */}
      <div className="max-w-2xl space-y-3">
        <Skeleton className="h-3 w-36 bg-[#d1a86e]/20" />
        <Skeleton className="h-10 w-3/4 sm:w-80 bg-[#1f212b]" />
        <Skeleton className="h-4 w-full bg-[#181a22]" />
        <Skeleton className="h-4 w-5/6 bg-[#181a22]" />
      </div>

      {/* 3 Alternating Collection Series Skeletons */}
      <div className="space-y-12 sm:space-y-16">
        {[...Array(3)].map((_, idx) => (
          <Card
            key={idx}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center p-5 sm:p-8 md:p-10 rounded-2xl bg-[#14151a] border-[#262833] overflow-hidden"
          >
            <div className={`lg:col-span-6 ${idx % 2 === 1 ? "lg:order-2" : ""}`}>
              <div className="relative aspect-[16/10] rounded-xl overflow-hidden bg-[#16171d] border border-[#262833]">
                <div className="w-full h-full bg-gradient-to-r from-transparent via-[#262833]/30 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
              </div>
            </div>

            <div
              className={`lg:col-span-6 space-y-5 ${
                idx % 2 === 1 ? "lg:order-1" : ""
              }`}
            >
              <Skeleton className="h-3 w-28 bg-[#d1a86e]/20" />
              <Skeleton className="h-8 w-2/3 bg-[#1f212b]" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full bg-[#181a22]" />
                <Skeleton className="h-4 w-11/12 bg-[#181a22]" />
                <Skeleton className="h-4 w-4/5 bg-[#181a22]" />
              </div>
              <div className="pt-2">
                <Skeleton className="h-10 w-48 rounded-lg bg-[#1e2029]" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
