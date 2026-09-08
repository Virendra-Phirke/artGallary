"use client";

import React from "react";
import { InteractiveRoomPreviewer } from "@/components/public/InteractiveRoomPreviewer";
import { useCollector } from "@/components/account/context/CollectorContext";

export function SpatialStudioTab() {
  const { artworks } = useCollector();

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="border-b border-[#262833] pb-6">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
          Collector AR Studio
        </span>
        <h2 className="font-serif text-3xl text-white mt-1">
          In-Room Wall Simulator &amp; Spatial WebAR
        </h2>
        <p className="text-xs text-zinc-400 mt-1">
          Test any painting calibrated to its exact centimeter dimensions against your living room or gallery wall.
        </p>
      </div>

      <div className="rounded-3xl border border-[#262833] bg-[#0d0e12] overflow-hidden shadow-2xl p-4 sm:p-6">
        <InteractiveRoomPreviewer artworks={artworks} />
      </div>
    </div>
  );
}
