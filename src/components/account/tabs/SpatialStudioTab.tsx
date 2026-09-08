"use client";

import React from "react";
import { InteractiveRoomPreviewer } from "@/components/public/InteractiveRoomPreviewer";
import { useCollector } from "@/components/account/context/CollectorContext";

export function SpatialStudioTab() {
  const { artworks } = useCollector();

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      <div className="rounded-2xl sm:rounded-3xl bg-[#121319] overflow-hidden shadow-xl shadow-black/40 p-1.5 sm:p-6">
        <InteractiveRoomPreviewer artworks={artworks} />
      </div>
    </div>
  );
}
