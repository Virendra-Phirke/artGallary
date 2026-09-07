"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Loader2, Sparkles } from "lucide-react";
import type { ArStudioViewerProps } from "./ArStudioViewer";

const ArStudioViewer = dynamic(
  () => import("./ArStudioViewer").then((mod) => mod.ArStudioViewer),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 z-50 bg-[#0d0e12] flex flex-col items-center justify-center gap-4 text-zinc-400">
        <div className="w-16 h-16 rounded-2xl bg-[#14151a] border border-[#d1a86e]/30 flex items-center justify-center relative shadow-2xl">
          <Sparkles className="w-7 h-7 text-[#d1a86e] animate-pulse" />
          <Loader2 className="w-12 h-12 text-[#d1a86e]/40 animate-spin absolute" />
        </div>
        <div className="text-center space-y-1">
          <p className="font-serif text-lg text-white font-medium">Initializing Spatial AR Engine</p>
          <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">Calibrating WebXR & Virtual Wall</p>
        </div>
      </div>
    ),
  }
);

export function ArClientContainer({ artwork }: ArStudioViewerProps) {
  return <ArStudioViewer artwork={artwork} />;
}
