import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

interface ArtworkGridSkeletonProps {
  count?: number;
}

export function ArtworkGridSkeleton({ count = 10 }: ArtworkGridSkeletonProps) {
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div
      role="status"
      aria-label="Loading artworks catalogue..."
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 animate-in fade-in-50 duration-300"
    >
      {items.map((i) => (
        <Card
          key={i}
          className="flex flex-col overflow-hidden bg-[#14151a] border-[#22242f] shadow-lg"
        >
          {/* Canvas Image Aspect Frame Skeleton */}
          <div className="relative aspect-[4/3] bg-[#0e0f14] overflow-hidden">
            <Skeleton className="w-full h-full rounded-none bg-[#1a1b24]/90" />
            {/* Badge Placeholder */}
            <div className="absolute top-3 left-3">
              <Skeleton className="h-5 w-16 rounded-full bg-[#2a2c3a]" />
            </div>
          </div>

          {/* Card Body Skeleton */}
          <div className="p-5 flex flex-col flex-1 justify-between space-y-4">
            <div className="space-y-2.5">
              <div className="flex items-start justify-between gap-3">
                <Skeleton className="h-6 w-3/5 rounded bg-[#252735]" />
                <Skeleton className="h-5 w-16 rounded bg-[#252735]" />
              </div>
              <Skeleton className="h-3.5 w-full rounded bg-[#1e202c]" />
              <Skeleton className="h-3.5 w-4/5 rounded bg-[#1e202c]" />
            </div>

            {/* Bottom Meta & AR link placeholder */}
            <div className="pt-3 border-t border-[#1f212b] flex items-center justify-between">
              <Skeleton className="h-3.5 w-20 rounded bg-[#1e202c]" />
              <Skeleton className="h-4 w-24 rounded-full bg-[#2a2c3a]" />
            </div>
          </div>
        </Card>
      ))}
      <span className="sr-only">Loading artworks...</span>
    </div>
  );
}
