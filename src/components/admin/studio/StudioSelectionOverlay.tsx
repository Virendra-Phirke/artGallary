"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useStudioSelection } from "./StudioSelectionManager";
import {
  Type,
  Image as ImageIcon,
  MousePointer,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  X,
  Layers,
  Sparkles,
} from "lucide-react";

interface StudioSelectionOverlayProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onMoveSection?: (sectionId: string, direction: "up" | "down") => void;
  onToggleSection?: (sectionId: string) => void;
  onOpenMediaPicker?: (sectionId: string) => void;
}

interface BoxCoords {
  top: number;
  left: number;
  width: number;
  height: number;
}

export function StudioSelectionOverlay({
  containerRef,
  onMoveSection,
  onToggleSection,
  onOpenMediaPicker,
}: StudioSelectionOverlayProps) {
  const {
    mode,
    selectedElement,
    hoveredElement,
    clearSelection,
    selectElement,
  } = useStudioSelection();

  const [selectedBox, setSelectedBox] = useState<BoxCoords | null>(null);
  const [hoveredBox, setHoveredBox] = useState<BoxCoords | null>(null);

  const updateCoordinates = useCallback(() => {
    if (!containerRef.current || mode === "preview") {
      setSelectedBox(null);
      setHoveredBox(null);
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const scrollTop = containerRef.current.scrollTop;
    const scrollLeft = containerRef.current.scrollLeft;

    // Update selected box
    if (selectedElement) {
      const el = containerRef.current.querySelector(
        `[data-studio-id="${CSS.escape(selectedElement.id)}"]`
      );
      if (el) {
        const r = el.getBoundingClientRect();
        setSelectedBox({
          top: r.top - containerRect.top + scrollTop,
          left: r.left - containerRect.left + scrollLeft,
          width: r.width,
          height: r.height,
        });
      } else {
        setSelectedBox(null);
      }
    } else {
      setSelectedBox(null);
    }

    // Update hovered box
    if (hoveredElement && hoveredElement.id !== selectedElement?.id) {
      const el = containerRef.current.querySelector(
        `[data-studio-id="${CSS.escape(hoveredElement.id)}"]`
      );
      if (el) {
        const r = el.getBoundingClientRect();
        setHoveredBox({
          top: r.top - containerRect.top + scrollTop,
          left: r.left - containerRect.left + scrollLeft,
          width: r.width,
          height: r.height,
        });
      } else {
        setHoveredBox(null);
      }
    } else {
      setHoveredBox(null);
    }
  }, [containerRef, mode, selectedElement, hoveredElement]);

  useEffect(() => {
    updateCoordinates();

    const container = containerRef.current;
    if (!container) return;

    const handleScrollOrResize = () => {
      updateCoordinates();
    };

    container.addEventListener("scroll", handleScrollOrResize);
    window.addEventListener("resize", handleScrollOrResize);

    // Mutation observer to detect DOM changes inside preview
    const observer = new MutationObserver(updateCoordinates);
    observer.observe(container, { childList: true, subtree: true, attributes: true });

    return () => {
      container.removeEventListener("scroll", handleScrollOrResize);
      window.removeEventListener("resize", handleScrollOrResize);
      observer.disconnect();
    };
  }, [containerRef, updateCoordinates]);

  if (mode === "preview") return null;

  return (
    <div className="absolute inset-0 pointer-events-none z-30 overflow-visible">
      {/* 1. HOVERED ELEMENT OUTLINE */}
      {hoveredBox && hoveredElement && (
        <div
          style={{
            top: hoveredBox.top,
            left: hoveredBox.left,
            width: hoveredBox.width,
            height: hoveredBox.height,
          }}
          className="absolute border border-dashed border-[#d1a86e]/70 bg-[#d1a86e]/5 transition-all duration-75 pointer-events-none rounded"
        >
          <div className="absolute -top-5 left-0 px-1.5 py-0.5 rounded bg-[#101116] border border-[#d1a86e]/40 text-[#d1a86e] text-[9px] font-mono tracking-wider whitespace-nowrap shadow-sm">
            {hoveredElement.type.toUpperCase()} · {hoveredElement.label}
          </div>
        </div>
      )}

      {/* 2. SELECTED ELEMENT OUTLINE & CONTROLS */}
      {selectedBox && selectedElement && (
        <div
          style={{
            top: selectedBox.top,
            left: selectedBox.left,
            width: selectedBox.width,
            height: selectedBox.height,
          }}
          className="absolute border-2 border-[#d1a86e] bg-[#d1a86e]/10 shadow-[0_0_15px_rgba(209,168,110,0.2)] transition-all duration-100 rounded"
        >
          {/* Corner resize/selection pips (Figma style) */}
          <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#d1a86e] border border-[#0d0e12] rounded-xs" />
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#d1a86e] border border-[#0d0e12] rounded-xs" />
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#d1a86e] border border-[#0d0e12] rounded-xs" />
          <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#d1a86e] border border-[#0d0e12] rounded-xs" />

          {/* Floating Label & Quick Action Toolbar */}
          <div className="absolute -top-9 left-0 flex items-center gap-1 pointer-events-auto z-40">
            {/* Element Tag */}
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#0d0e12] border border-[#d1a86e] text-[#d1a86e] text-[9px] font-mono tracking-wider font-semibold shadow-md whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e]" />
              <span>{selectedElement.type.toUpperCase()}: {selectedElement.label}</span>
            </span>

            {/* Floating Quick Action Buttons */}
            <div className="flex items-center gap-0.5 bg-[#14151c] border border-[#2c2f3d] p-0.5 rounded-full shadow-lg">
              {/* Select Parent Section shortcut if applicable */}
              {selectedElement.path && selectedElement.path.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    const parent = selectedElement.path[selectedElement.path.length - 2];
                    if (parent) {
                      selectElement({
                        id: parent.id,
                        label: parent.label,
                        type: parent.type,
                        path: selectedElement.path.slice(0, -1),
                        sectionId: selectedElement.sectionId,
                        sectionKey: selectedElement.sectionKey,
                      });
                    }
                  }}
                  className="px-1.5 py-0.5 text-[9px] text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Select Parent Section"
                >
                  <Layers className="w-2.5 h-2.5" />
                  <span>Parent</span>
                </button>
              )}

              {/* Section Quick Actions */}
              {selectedElement.type === "section" && selectedElement.sectionId && (
                <>
                  {onMoveSection && (
                    <>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveSection(selectedElement.sectionId!, "up");
                        }}
                        className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Move Section Up"
                      >
                        <ArrowUp className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onMoveSection(selectedElement.sectionId!, "down");
                        }}
                        className="p-1 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Move Section Down"
                      >
                        <ArrowDown className="w-2.5 h-2.5" />
                      </button>
                    </>
                  )}
                  {onToggleSection && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSection(selectedElement.sectionId!);
                      }}
                      className="p-1 text-zinc-400 hover:text-[#d1a86e] rounded-full hover:bg-zinc-800 transition-colors cursor-pointer"
                      title="Toggle Section Visibility"
                    >
                      <Eye className="w-2.5 h-2.5" />
                    </button>
                  )}
                </>
              )}

              {/* Image Quick Actions */}
              {selectedElement.type === "image" && selectedElement.sectionId && onOpenMediaPicker && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onOpenMediaPicker(selectedElement.sectionId!);
                  }}
                  className="px-2 py-0.5 text-[9px] text-[#d1a86e] hover:text-[#e2c18d] rounded-full hover:bg-[#d1a86e]/10 transition-colors flex items-center gap-1 cursor-pointer font-medium"
                >
                  <ImageIcon className="w-2.5 h-2.5" />
                  <span>Replace Asset</span>
                </button>
              )}

              {/* Close / Deselect */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  clearSelection();
                }}
                className="p-1 text-zinc-500 hover:text-white rounded-full hover:bg-zinc-800 transition-colors cursor-pointer ml-0.5"
                title="Deselect"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
