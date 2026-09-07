import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminArtworksLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header Plaque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32 bg-[#d1a86e]/20" />
          <Skeleton className="h-8 w-48 bg-[#1f212b]" />
          <Skeleton className="h-3 w-80 bg-[#181a22]" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg bg-[#d1a86e]/30" />
      </div>

      {/* Filter and Search Bar Skeleton */}
      <div className="bg-[#14151a] border border-[#262833] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <Skeleton className="h-9 w-full md:w-80 bg-[#1e2029]" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16 bg-[#1e2029]" />
          <Skeleton className="h-8 w-20 bg-[#1e2029]" />
          <Skeleton className="h-8 w-16 bg-[#1e2029]" />
          <Skeleton className="h-8 w-16 bg-[#1e2029]" />
        </div>
      </div>

      {/* Table Skeleton */}
      <Card className="bg-[#14151a] border-[#262833] overflow-hidden p-0">
        <div className="p-4 border-b border-[#1f212b] flex items-center justify-between">
          <Skeleton className="h-4 w-40 bg-[#1e2029]" />
          <Skeleton className="h-4 w-20 bg-[#1e2029]" />
        </div>
        <div className="divide-y divide-[#1f212b]">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-12 h-10 rounded-lg bg-[#1e2029] shrink-0" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-36 bg-[#1f212b]" />
                  <Skeleton className="h-3 w-20 bg-[#181a22]" />
                </div>
              </div>
              <Skeleton className="h-4 w-28 bg-[#181a22] hidden sm:block" />
              <Skeleton className="h-4 w-20 bg-[#181a22] hidden md:block" />
              <Skeleton className="h-4 w-16 bg-[#d1a86e]/30" />
              <Skeleton className="h-6 w-20 rounded-md bg-[#1e2029]" />
              <Skeleton className="h-8 w-16 rounded-md bg-[#1e2029]" />
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
