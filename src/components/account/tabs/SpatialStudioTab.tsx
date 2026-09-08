"use client";

import React from "react";
import { InteractiveRoomPreviewer } from "@/components/public/InteractiveRoomPreviewer";
import { useCollector } from "@/components/account/context/CollectorContext";

export function SpatialStudioTab() {
  const { artworks } = useCollector();

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl shadow-black/40 space-y-1.5 sm:space-y-2">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
          Collector AR Studio
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl text-white">
          In-Room Wall Simulator &amp; Spatial WebAR
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl font-light leading-relaxed">
          Test any painting calibrated to its exact centimeter dimensions against your living room or gallery wall.
        </p>
      </div>

      <div className="rounded-2xl sm:rounded-3xl bg-[#121319] overflow-hidden shadow-xl shadow-black/40 p-1.5 sm:p-6">
        <InteractiveRoomPreviewer artworks={artworks} />
      </div>
    </div>
  );
}
