"use client";

import React from "react";
import {
  X,
  RotateCcw,
  Sparkles,
  Layers,
  Eye,
  Check,
  Maximize2,
} from "lucide-react";
import { FrameStyle } from "../engine/artworkMesh";
import { formatDimensions } from "@/lib/utils";

interface ArControlsOverlayProps {
  artworkTitle: string;
  widthCm: number;
  heightCm: number;
  scale: number;
  isPlaced: boolean;
  isScanning: boolean;
  surfaceDetected: boolean;
  frameStyle: FrameStyle;
  frameEnabled: boolean;
  onExit: () => void;
  onReset: () => void;
  onFrameChange: (style: FrameStyle, enabled: boolean) => void;
  onSwitchTo3DRoom: () => void;
}

export function ArControlsOverlay({
  artworkTitle,
  widthCm,
  heightCm,
  scale,
  isPlaced,
  isScanning,
  surfaceDetected,
  frameStyle,
  frameEnabled,
  onExit,
  onReset,
  onFrameChange,
  onSwitchTo3DRoom,
}: ArControlsOverlayProps) {
  const currentWidthCm = (widthCm * scale).toFixed(1);
  const currentHeightCm = (heightCm * scale).toFixed(1);
  const scalePercent = Math.round(scale * 100);

  return (
    <div className="fixed inset-0 z-40 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none">
      {/* 1. TOP BAR */}
      <div className="flex items-center justify-between gap-3 pointer-events-auto">
        <button
          onClick={onExit}
          className="flex items-center gap-1.5 bg-black/70 backdrop-blur-md border border-white/15 text-white px-4 py-2 rounded-full text-xs font-medium uppercase tracking-wider hover:bg-black/90 transition-all shadow-lg"
        >
          <X className="w-4 h-4" />
          <span>Exit AR</span>
        </button>

        {/* Current Dimension & Scale Badge */}
        <div className="bg-black/70 backdrop-blur-md border border-white/15 px-4 py-1.5 rounded-full text-center shadow-lg">
          <span className="text-[11px] font-serif text-white font-medium block">
            {artworkTitle}
          </span>
          <span className="text-[9px] uppercase tracking-widest text-[#d1a86e] font-mono block">
            {scalePercent}% • {currentWidthCm} × {currentHeightCm} cm
          </span>
        </div>

        {/* Switch to 3D Room */}
        <button
          onClick={onSwitchTo3DRoom}
          className="p-2.5 bg-black/70 backdrop-blur-md border border-white/15 text-zinc-300 hover:text-white rounded-full transition-colors shadow-lg"
          title="Switch to 3D Room Studio"
        >
          <Eye className="w-4 h-4 text-[#d1a86e]" />
        </button>
      </div>

      {/* 2. SCANNING & SURFACE DETECTION GUIDANCE OVERLAY */}
      {!isPlaced && (
        <div className="my-auto mx-auto text-center space-y-3 pointer-events-none max-w-xs">
          <div className="w-16 h-16 mx-auto rounded-full border-2 border-dashed border-[#d1a86e] animate-spin flex items-center justify-center bg-black/40 backdrop-blur-md">
            <Sparkles className="w-6 h-6 text-[#d1a86e]" />
          </div>

          <div className="bg-black/75 backdrop-blur-md border border-white/20 rounded-2xl px-5 py-3 shadow-2xl space-y-1">
            <p className="text-xs font-medium text-white">
              {surfaceDetected
                ? "Wall Surface Found!"
                : "Looking for Wall Surface..."}
            </p>
            <p className="text-[11px] text-[#d1a86e] font-semibold">
              {surfaceDetected
                ? "Tap anywhere on screen to place artwork"
                : "Move your phone slowly across the room"}
            </p>
          </div>
        </div>
      )}

      {/* 3. BOTTOM CONTROLS WHEN ARTWORK IS PLACED */}
      {isPlaced && (
        <div className="space-y-3 pointer-events-auto max-w-lg mx-auto w-full">
          {/* Interaction Instruction Pill */}
          <div className="flex items-center justify-center gap-3 text-[11px] text-zinc-300 bg-black/75 backdrop-blur-md border border-white/15 py-1.5 px-4 rounded-full w-fit mx-auto shadow-lg">
            <span>👆 One finger to drag</span>
            <span>•</span>
            <span>🤏 Two fingers to resize</span>
          </div>

          {/* Controls Bar */}
          <div className="bg-[#14151a]/90 backdrop-blur-md border border-[#262833] p-2 rounded-2xl flex items-center justify-between gap-2 shadow-2xl">
            {/* Reset to 1:1 Scale */}
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-[#1a1c23] border border-[#262833] transition-colors"
              title="Reset to 100% 1:1 Physical Scale"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span className="hidden sm:inline">1:1 Scale</span>
            </button>

            {/* Frame Styles Selector */}
            <div className="flex items-center gap-1 overflow-x-auto py-1">
              {[
                { id: "none", label: "Frameless" },
                { id: "minimal_black", label: "Black" },
                { id: "classic_gold", label: "Gold" },
                { id: "natural_wood", label: "Wood" },
                { id: "white_gallery", label: "White" },
              ].map((f) => {
                const isCurrent = frameEnabled && frameStyle === f.id;
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      if (f.id === "none") {
                        onFrameChange("none", false);
                      } else {
                        onFrameChange(f.id as FrameStyle, true);
                      }
                    }}
                    className={`text-[10px] px-2.5 py-1 rounded-lg transition-all ${
                      isCurrent || (!frameEnabled && f.id === "none")
                        ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-md"
                        : "text-zinc-400 hover:text-white hover:bg-[#1a1c23]"
                    }`}
                  >
                    {f.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
