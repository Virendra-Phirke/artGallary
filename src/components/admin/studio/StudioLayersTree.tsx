"use client";

import React, { useState } from "react";
import { MockHomepageSection } from "@/db/mockData";
import { useStudioSelection, StudioSelectedElement, StudioElementType } from "./StudioSelectionManager";
import {
  Layers,
  ChevronDown,
  ChevronRight,
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  Eye,
  EyeOff,
  Search,
  ArrowUp,
  ArrowDown,
  GripVertical,
} from "lucide-react";

interface StudioLayersTreeProps {
  sections: MockHomepageSection[];
  activePage: string;
  onMoveSection?: (index: number, direction: "up" | "down") => void;
  onReorderSections?: (fromIndex: number, toIndex: number) => void;
  onToggleSection?: (id: string) => void;
}

export function StudioLayersTree({
  sections,
  activePage,
  onMoveSection,
  onReorderSections,
  onToggleSection,
}: StudioLayersTreeProps) {
  const { selectedElement, selectElement } = useStudioSelection();
  const [search, setSearch] = useState("");
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  const toggleCollapse = (id: string) => {
    setCollapsedSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getSectionElements = (sec: MockHomepageSection) => {
    const items: Array<{
      id: string;
      label: string;
      type: StudioElementType;
      fieldKey: string;
    }> = [
      {
        id: `sec:${sec.id}:subtitle`,
        label: sec.subtitle || "Eyebrow / Subtitle",
        type: "eyebrow",
        fieldKey: "subtitle",
      },
      {
        id: `sec:${sec.id}:title`,
        label: sec.title || "Section Heading",
        type: "heading",
        fieldKey: "title",
      },
      {
        id: `sec:${sec.id}:description`,
        label: "Description Copy",
        type: "paragraph",
        fieldKey: "description",
      },
    ];

    if (sec.sectionKey === "artist_story") {
      items.push({
        id: `sec:${sec.id}:quote`,
        label: "Philosophy Quote",
        type: "heading" as const,
        fieldKey: "quote",
      });
    }

    if (sec.contentJson?.ctaText || sec.sectionKey === "hero" || sec.sectionKey === "contact_cta") {
      items.push({
        id: `sec:${sec.id}:cta`,
        label: `CTA: ${sec.contentJson?.ctaText || "Button"}`,
        type: "button" as const,
        fieldKey: "ctaText",
      });
    }

    if (sec.sectionKey === "hero" || sec.sectionKey === "latest_collection" || sec.sectionKey === "featured_exhibition" || sec.sectionKey === "artist_story") {
      items.push({
        id: `sec:${sec.id}:image`,
        label: "Featured Asset / Image",
        type: "image" as const,
        fieldKey: "imageUrl",
      });
    }

    return items;
  };

  const sortedSections = [...sections].sort((a, b) => a.displayOrder - b.displayOrder);

  return (
    <div className="h-full bg-[#111218] border-r border-[#1f212b] overflow-hidden text-xs text-white flex flex-col">
      {/* Header */}
      <div className="p-3.5 border-b border-[#20222a] flex items-center justify-between shrink-0 bg-[#14151c]">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-[#d1a86e]" />
          <span className="font-serif text-sm font-medium">Layers Navigator</span>
        </div>
        <span className="text-[10px] font-mono text-zinc-500 uppercase">
          {sortedSections.length} Sections
        </span>
      </div>

      {/* Filter / Search */}
      <div className="p-2.5 border-b border-[#1c1d25] shrink-0">
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Filter layers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#181922] border border-[#272937] rounded-lg pl-8 pr-2.5 py-1 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d1a86e]"
          />
        </div>
      </div>

      {/* Tree Content */}
      <div className="p-2 space-y-1 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-700">
        {sortedSections.map((sec, idx) => {
          const isCollapsed = collapsedSections[sec.id];
          const isSectionSelected = selectedElement?.id === `sec:${sec.id}`;
          const elements = getSectionElements(sec);

          const matchesSearch =
            !search ||
            sec.title.toLowerCase().includes(search.toLowerCase()) ||
            sec.sectionKey.toLowerCase().includes(search.toLowerCase()) ||
            elements.some((el) => el.label.toLowerCase().includes(search.toLowerCase()));

          if (!matchesSearch) return null;

          const isDragging = draggedIdx === idx;
          const isDragOver = dragOverIdx === idx && draggedIdx !== idx;

          return (
            <div
              key={sec.id}
              draggable={!!onReorderSections}
              onDragStart={(e) => {
                setDraggedIdx(idx);
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", `${idx}`);
              }}
              onDragOver={(e) => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                if (dragOverIdx !== idx) setDragOverIdx(idx);
              }}
              onDragEnter={(e) => {
                e.preventDefault();
                setDragOverIdx(idx);
              }}
              onDragLeave={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                  setDragOverIdx((curr) => (curr === idx ? null : curr));
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                if (draggedIdx !== null && draggedIdx !== idx && onReorderSections) {
                  onReorderSections(draggedIdx, idx);
                }
                setDraggedIdx(null);
                setDragOverIdx(null);
              }}
              onDragEnd={() => {
                setDraggedIdx(null);
                setDragOverIdx(null);
              }}
              className={`group/layer rounded-xl border transition-all duration-150 overflow-hidden ${
                isDragging
                  ? "opacity-30 scale-[0.98] border-dashed border-[#d1a86e] bg-[#1a1b26]"
                  : isDragOver
                  ? "border-[#d1a86e] bg-[#d1a86e]/15 ring-2 ring-[#d1a86e]/70 shadow-lg shadow-[#d1a86e]/20"
                  : "border-white/5 bg-[#161722]/60 hover:border-[#d1a86e]/30"
              }`}
            >
              {/* Section Root Node */}
              <div
                className={`p-2 flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                  isSectionSelected
                    ? "bg-[#d1a86e]/20 text-[#d1a86e]"
                    : "hover:bg-[#1f202e] text-white"
                }`}
                onClick={() => {
                  selectElement({
                    id: `sec:${sec.id}`,
                    type: "section",
                    label: sec.title || sec.sectionKey,
                    path: [
                      { id: `page:${activePage}`, label: activePage.toUpperCase(), type: "section" },
                      { id: `sec:${sec.id}`, label: sec.title || sec.sectionKey, type: "section" },
                    ],
                    sectionId: sec.id,
                    sectionKey: sec.sectionKey,
                  });
                }}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {onReorderSections && (
                    <div
                      className="text-zinc-600 group-hover/layer:text-[#d1a86e] transition-colors p-0.5 cursor-grab active:cursor-grabbing hover:bg-white/5 rounded shrink-0"
                      title="Grab to drag & reorder"
                    >
                      <GripVertical className="w-3 h-3" />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleCollapse(sec.id);
                    }}
                    className="p-0.5 text-zinc-400 hover:text-white"
                  >
                    {isCollapsed ? (
                      <ChevronRight className="w-3 h-3" />
                    ) : (
                      <ChevronDown className="w-3 h-3" />
                    )}
                  </button>
                  <span className="font-mono text-[10px] text-zinc-500">
                    0{idx + 1}
                  </span>
                  <span className="font-medium truncate text-xs">
                    {sec.title || sec.sectionKey}
                  </span>
                </div>

                <div className="flex items-center gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                  {onMoveSection && (
                    <>
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => onMoveSection(idx, "up")}
                        className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Up"
                      >
                        <ArrowUp className="w-2.5 h-2.5" />
                      </button>
                      <button
                        type="button"
                        disabled={idx === sortedSections.length - 1}
                        onClick={() => onMoveSection(idx, "down")}
                        className="p-1 text-zinc-500 hover:text-white disabled:opacity-20 cursor-pointer"
                        title="Move Down"
                      >
                        <ArrowDown className="w-2.5 h-2.5" />
                      </button>
                    </>
                  )}
                  {onToggleSection && (
                    <button
                      type="button"
                      onClick={() => onToggleSection(sec.id)}
                      className={`p-1 cursor-pointer ${
                        sec.isEnabled ? "text-emerald-400" : "text-zinc-600"
                      }`}
                      title="Toggle Visibility"
                    >
                      {sec.isEnabled ? (
                        <Eye className="w-2.5 h-2.5" />
                      ) : (
                        <EyeOff className="w-2.5 h-2.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Child Elements */}
              {!isCollapsed && (
                <div className="pl-6 pr-2 py-1 space-y-0.5 border-t border-white/5 bg-[#101117]/80">
                  {elements.map((el) => {
                    const isElSelected = selectedElement?.id === el.id;
                    return (
                      <div
                        key={el.id}
                        onClick={() => {
                          selectElement({
                            id: el.id,
                            type: el.type,
                            label: el.label,
                            path: [
                              { id: `page:${activePage}`, label: activePage.toUpperCase(), type: "section" },
                              { id: `sec:${sec.id}`, label: sec.title || sec.sectionKey, type: "section" },
                              { id: el.id, label: el.label, type: el.type },
                            ],
                            sectionId: sec.id,
                            sectionKey: sec.sectionKey,
                            fieldKey: el.fieldKey,
                          });
                        }}
                        className={`px-2 py-1 rounded-md flex items-center gap-2 cursor-pointer transition-colors text-[11px] ${
                          isElSelected
                            ? "bg-[#d1a86e]/20 text-[#d1a86e] font-semibold"
                            : "text-zinc-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        {el.type === "image" ? (
                          <ImageIcon className="w-3 h-3 shrink-0" />
                        ) : el.type === "button" ? (
                          <LinkIcon className="w-3 h-3 shrink-0" />
                        ) : (
                          <Type className="w-3 h-3 shrink-0" />
                        )}
                        <span className="truncate">{el.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
