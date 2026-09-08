"use client";

import React, { createContext, useContext, useState, useCallback, useMemo } from "react";

export type StudioElementType =
  | "heading"
  | "paragraph"
  | "eyebrow"
  | "button"
  | "image"
  | "section"
  | "badge"
  | "navbar"
  | "banner"
  | "grid";

export type StudioInteractionMode = "select" | "edit" | "preview";

export interface StudioPathItem {
  id: string;
  label: string;
  type: StudioElementType;
}

export interface StudioSelectedElement {
  id: string; // Unique identifier: e.g. "sec:hero:title"
  type: StudioElementType;
  label: string; // e.g. "Hero Title"
  path: StudioPathItem[];
  sectionId?: string; // ID of the section if part of homepage
  sectionKey?: string; // e.g. "hero", "latest_collection"
  fieldKey?: string; // e.g. "title", "subtitle", "description", "ctaText", "imageUrl"
  rect?: DOMRect | null;
  meta?: Record<string, any>;
}

interface StudioSelectionContextType {
  mode: StudioInteractionMode;
  setMode: (mode: StudioInteractionMode) => void;
  selectedElement: StudioSelectedElement | null;
  hoveredElement: StudioSelectedElement | null;
  selectElement: (element: StudioSelectedElement | null) => void;
  hoverElement: (element: StudioSelectedElement | null) => void;
  clearSelection: () => void;
  activeTool: "select" | "layers" | "sections" | "assets" | "settings";
  setActiveTool: (tool: "select" | "layers" | "sections" | "assets" | "settings") => void;
}

const StudioSelectionContext = createContext<StudioSelectionContextType | undefined>(undefined);

export function StudioSelectionProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<StudioInteractionMode>("select");
  const [selectedElement, setSelectedElement] = useState<StudioSelectedElement | null>(null);
  const [hoveredElement, setHoveredElement] = useState<StudioSelectedElement | null>(null);
  const [activeTool, setActiveTool] = useState<"select" | "layers" | "sections" | "assets" | "settings">("select");

  const selectElement = useCallback((element: StudioSelectedElement | null) => {
    setSelectedElement(element);
  }, []);

  const hoverElement = useCallback((element: StudioSelectedElement | null) => {
    setHoveredElement(element);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedElement(null);
    setHoveredElement(null);
  }, []);

  const value = useMemo(
    () => ({
      mode,
      setMode,
      selectedElement,
      hoveredElement,
      selectElement,
      hoverElement,
      clearSelection,
      activeTool,
      setActiveTool,
    }),
    [mode, selectedElement, hoveredElement, selectElement, hoverElement, clearSelection, activeTool]
  );

  return (
    <StudioSelectionContext.Provider value={value}>
      {children}
    </StudioSelectionContext.Provider>
  );
}

export function useStudioSelection() {
  const context = useContext(StudioSelectionContext);
  if (!context) {
    throw new Error("useStudioSelection must be used within a StudioSelectionProvider");
  }
  return context;
}
