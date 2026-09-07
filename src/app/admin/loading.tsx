import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export default function AdminLoading() {
  return (
    <div className="space-y-10 max-w-7xl animate-pulse">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div className="space-y-2">
          <Skeleton className="h-3 w-32 bg-[#d1a86e]/20" />
          <Skeleton className="h-8 w-48 bg-[#1f212b]" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-28 rounded-lg bg-[#1e2029]" />
          <Skeleton className="h-9 w-24 rounded-lg bg-[#1e2029]" />
        </div>
      </div>

      {/* Metrics Row: 4 cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-5 space-y-3 bg-[#14151a] border-[#262833]">
            <Skeleton className="h-3 w-24 bg-[#1f212b]" />
            <Skeleton className="h-8 w-16 bg-[#d1a86e]/30" />
            <Skeleton className="h-3 w-32 bg-[#181a22]" />
          </Card>
        ))}
      </div>

      {/* Attention / Audit Panel Skeleton */}
      <Card className="p-6 space-y-4 bg-[#14151a] border-[#262833]">
        <div className="flex items-center justify-between border-b border-[#1f212b] pb-4">
          <Skeleton className="h-6 w-52 bg-[#1f212b]" />
          <Skeleton className="h-4 w-28 bg-[#181a22]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-20 rounded-xl bg-[#1e2029]" />
          <Skeleton className="h-20 rounded-xl bg-[#1e2029]" />
          <Skeleton className="h-20 rounded-xl bg-[#1e2029]" />
        </div>
      </Card>

      {/* Two Column Layout Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <Card className="lg:col-span-7 p-6 space-y-4 bg-[#14151a] border-[#262833]">
          <Skeleton className="h-6 w-36 bg-[#1f212b]" />
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-xl bg-[#1e2029]" />
            ))}
          </div>
        </Card>

        <Card className="lg:col-span-5 p-6 space-y-4 bg-[#14151a] border-[#262833]">
          <Skeleton className="h-6 w-28 bg-[#1f212b]" />
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-12 rounded-lg bg-[#1e2029]" />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
