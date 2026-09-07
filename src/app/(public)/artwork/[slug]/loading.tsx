import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function ArtworkLoading() {
  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-10">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-3 w-16 bg-[#1f212b]" />
        <span className="text-zinc-600">/</span>
        <Skeleton className="h-3 w-28 bg-[#1f212b]" />
        <span className="text-zinc-600">/</span>
        <Skeleton className="h-3 w-36 bg-[#1f212b]" />
      </div>

      {/* Main Grid: 7 cols Canvas + 5 cols Provenance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
        {/* Left Column: Canvas Preview Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-[#14151a] border border-[#262833] shadow-2xl">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-[#262833]/30 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
            <div className="absolute top-4 left-4">
              <Skeleton className="h-6 w-20 rounded-md bg-[#1f212b]" />
            </div>
          </div>

          {/* Thumbnail strip skeleton */}
          <div className="flex items-center gap-3">
            <Skeleton className="w-20 h-16 rounded-xl bg-[#1e2029]" />
            <Skeleton className="w-20 h-16 rounded-xl bg-[#1e2029]" />
            <Skeleton className="w-20 h-16 rounded-xl bg-[#1e2029]" />
          </div>

          {/* Guarantee card skeleton */}
          <Card className="p-4 bg-[#14151a] border-[#262833] flex items-center justify-between">
            <Skeleton className="h-4 w-72 bg-[#1e2029]" />
            <Skeleton className="h-7 w-20 bg-[#1e2029]" />
          </Card>
        </div>

        {/* Right Column: Provenance and Spec Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-3 w-32 bg-[#d1a86e]/20" />
            <Skeleton className="h-10 w-4/5 bg-[#1f212b]" />
            <Skeleton className="h-6 w-32 bg-[#d1a86e]/30" />
          </div>

          <div className="space-y-2 border-y border-[#1f212b] py-6">
            <Skeleton className="h-4 w-full bg-[#181a22]" />
            <Skeleton className="h-4 w-11/12 bg-[#181a22]" />
            <Skeleton className="h-4 w-4/5 bg-[#181a22]" />
          </div>

          {/* Spec table rows skeleton */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 bg-[#181a22]" />
              <Skeleton className="h-4 w-28 bg-[#1f212b]" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 bg-[#181a22]" />
              <Skeleton className="h-4 w-24 bg-[#1f212b]" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 bg-[#181a22]" />
              <Skeleton className="h-4 w-24 bg-[#1f212b]" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-3 w-16 bg-[#181a22]" />
              <Skeleton className="h-4 w-20 bg-[#1f212b]" />
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3 pt-4">
            <Skeleton className="h-12 w-full rounded-full bg-[#d1a86e]/30" />
            <Skeleton className="h-12 w-full rounded-full bg-[#1e2029]" />
          </div>
        </div>
      </div>
    </div>
  );
}
