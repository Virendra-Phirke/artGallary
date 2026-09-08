"use client";

import React from "react";
import Image from "next/image";
import { useStudioSelection, StudioSelectedElement } from "./StudioSelectionManager";
import {
  MockHomepageSection,
  SiteSettingsData,
} from "@/db/mockData";
import {
  Type,
  Image as ImageIcon,
  Link as LinkIcon,
  Layers,
  ChevronRight,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Upload,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Sliders,
  Check,
  X,
  Compass,
  FileText,
  Keyboard,
  Maximize2,
} from "lucide-react";

interface StudioInspectorProps {
  sections: MockHomepageSection[];
  siteSettings: SiteSettingsData;
  activePage: string;
  onUpdateSectionText: (id: string, field: "title" | "subtitle", val: string) => void;
  onUpdateSectionContent: (id: string, field: string, val: string) => void;
  onUpdateSiteSetting: <K extends keyof SiteSettingsData>(key: K, val: SiteSettingsData[K]) => void;
  onUpdateGalleryConfig: (field: string, val: any) => void;
  onUpdateCollectionsConfig: (field: string, val: any) => void;
  onUpdateExhibitionsConfig: (field: string, val: any) => void;
  onUpdateAboutConfig: (field: string, val: any) => void;
  onUpdateContactConfig: (field: string, val: any) => void;
  onOpenMediaPicker: (targetId: string) => void;
  onMoveSection?: (index: number, dir: "up" | "down") => void;
  onToggleSection?: (id: string) => void;
  onClose?: () => void;
}

export function StudioInspector({
  sections,
  siteSettings,
  activePage,
  onUpdateSectionText,
  onUpdateSectionContent,
  onUpdateSiteSetting,
  onUpdateGalleryConfig,
  onUpdateCollectionsConfig,
  onUpdateExhibitionsConfig,
  onUpdateAboutConfig,
  onUpdateContactConfig,
  onOpenMediaPicker,
  onMoveSection,
  onToggleSection,
  onClose,
}: StudioInspectorProps) {
  const { selectedElement, clearSelection, selectElement } = useStudioSelection();

  // Find target section if this element belongs to one
  const currentSection = selectedElement?.sectionId
    ? sections.find((s) => s.id === selectedElement.sectionId)
    : null;

  const sectionIndex = currentSection
    ? sections.findIndex((s) => s.id === currentSection.id)
    : -1;

  // Helper to extract current value for element
  const getElementValue = (): string => {
    if (!selectedElement) return "";
    const { sectionId, fieldKey, id } = selectedElement;

    if (currentSection && fieldKey) {
      if (fieldKey === "title") return currentSection.title || "";
      if (fieldKey === "subtitle") return currentSection.subtitle || "";
      return currentSection.contentJson?.[fieldKey] || "";
    }

    if (id === "navbar:brand") return siteSettings.siteTitle || "";
    if (id === "navbar:artist") return siteSettings.artistName || "";
    if (id === "announcement:message") return siteSettings.announcementBar?.message || "";

    if (id === "contact:email") return siteSettings.contactEmail || "";
    if (id === "contact:phone") return siteSettings.phone || "";
    if (id === "contact:whatsapp") return siteSettings.whatsapp || "";
    if (id === "contact:address") return siteSettings.address || "";
    if (id === "contact:hours") return siteSettings.businessHours || "";

    if (activePage === "gallery") {
      const g = siteSettings.galleryPageConfig;
      if (fieldKey === "title") return g?.title || "";
      if (fieldKey === "subtitle") return g?.subtitle || "";
      if (fieldKey === "description") return g?.description || "";
    }

    if (activePage === "about") {
      const a = siteSettings.aboutPageConfig as any;
      if (fieldKey === "intro") return a?.intro || "";
      if (fieldKey === "bio") return a?.bio || "";
      if (fieldKey === "story") return a?.story || "";
    }

    return "";
  };

  const handleValueChange = (val: string) => {
    if (!selectedElement) return;
    const { sectionId, fieldKey, id } = selectedElement;

    if (currentSection && fieldKey) {
      if (fieldKey === "title" || fieldKey === "subtitle") {
        onUpdateSectionText(currentSection.id, fieldKey, val);
      } else {
        onUpdateSectionContent(currentSection.id, fieldKey, val);
      }
      return;
    }

    if (id === "navbar:brand") {
      onUpdateSiteSetting("siteTitle", val);
      return;
    }
    if (id === "navbar:artist") {
      onUpdateSiteSetting("artistName", val);
      return;
    }
    if (id === "announcement:message") {
      onUpdateSiteSetting("announcementBar", {
        ...(siteSettings.announcementBar || { isEnabled: true, message: "", bg: "#18191e", textColor: "#d1a86e" }),
        message: val,
      });
      return;
    }

    if (id === "contact:email") {
      onUpdateSiteSetting("contactEmail", val);
      return;
    }
    if (id === "contact:phone") {
      onUpdateSiteSetting("phone", val);
      return;
    }
    if (id === "contact:whatsapp") {
      onUpdateSiteSetting("whatsapp", val);
      return;
    }
    if (id === "contact:address") {
      onUpdateSiteSetting("address", val);
      return;
    }
    if (id === "contact:hours") {
      onUpdateSiteSetting("businessHours", val);
      return;
    }

    if (activePage === "gallery" && fieldKey) {
      onUpdateGalleryConfig(fieldKey, val);
      return;
    }
    if (activePage === "about" && fieldKey) {
      onUpdateAboutConfig(fieldKey, val);
      return;
    }
    if (activePage === "contact" && fieldKey) {
      onUpdateContactConfig(fieldKey, val);
      return;
    }
  };

  // EMPTY SELECTION STATE: Global Canvas / Page Inspector
  if (!selectedElement) {
    return (
      <div className="h-full bg-[#111218] border-l border-[#1f212b] p-4 sm:p-5 flex flex-col justify-between text-xs text-white overflow-y-auto scrollbar-thin">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-[#20222b] pb-3">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#d1a86e]" />
              <span className="font-serif text-sm font-medium">Inspector</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase bg-[#181922] px-2 py-0.5 rounded border border-white/5">
                {activePage}
              </span>
              {onClose && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Close Inspector"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#171822] border border-[#262834] space-y-2">
            <div className="flex items-center gap-2 text-[#d1a86e] font-semibold text-xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Direct Visual Selector</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed font-light">
              Click any element inside the live storefront canvas to inspect and edit its content, typography, or styling directly.
            </p>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 block">
              Page Structure
            </span>
            <div className="p-3 rounded-xl bg-[#161720] space-y-2 border border-white/5">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Current View:</span>
                <span className="font-mono text-white capitalize">{activePage}</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Total Sections:</span>
                <span className="font-mono text-[#d1a86e]">{sections.length} Units</span>
              </div>
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Published Status:</span>
                <span className="font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  Live Storefront
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Keyboard Shortcuts Guide */}
        <div className="pt-4 border-t border-white/5 space-y-2">
          <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-500 flex items-center gap-1.5">
            <Keyboard className="w-3 h-3 text-[#d1a86e]" />
            <span>Shortcuts</span>
          </span>
          <div className="space-y-1.5 text-[11px] text-zinc-400 font-mono">
            <div className="flex items-center justify-between">
              <span>Select Element</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1c1d27] text-zinc-300 text-[10px] border border-white/10">Click</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Deselect</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1c1d27] text-zinc-300 text-[10px] border border-white/10">Esc</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Publish Changes</span>
              <kbd className="px-1.5 py-0.5 rounded bg-[#1c1d27] text-[#d1a86e] text-[10px] border border-white/10">Ctrl+S</kbd>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ACTIVE ELEMENT INSPECTOR
  const currentVal = getElementValue();
  const currentImageUrl =
    currentSection?.contentJson?.imageUrl || undefined;

  return (
    <div className="h-full bg-[#111218] border-l border-[#1f212b] flex flex-col text-xs text-white overflow-hidden shadow-2xl">
      {/* 1. BREADCRUMBS BAR (Clean, non-duplicated) */}
      <div className="p-3 bg-[#15161f] border-b border-[#20222d] flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[10px] font-mono text-zinc-400">
          {selectedElement.path.map((item, idx) => {
            const isLast = idx === selectedElement.path.length - 1;
            return (
              <React.Fragment key={item.id + idx}>
                {idx > 0 && <ChevronRight className="w-2.5 h-2.5 text-zinc-600 shrink-0" />}
                <button
                  type="button"
                  onClick={() => {
                    if (idx === 0) {
                      clearSelection();
                    } else {
                      selectElement({
                        id: item.id,
                        label: item.label,
                        type: item.type,
                        path: selectedElement.path.slice(0, idx + 1),
                        sectionId: selectedElement.sectionId,
                        sectionKey: selectedElement.sectionKey,
                      });
                    }
                  }}
                  className={`truncate max-w-[120px] transition-colors cursor-pointer ${
                    isLast ? "text-[#d1a86e] font-semibold" : "hover:text-white text-zinc-400"
                  }`}
                >
                  {item.label}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => clearSelection()}
          className="p-1 rounded text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors shrink-0 cursor-pointer"
          title="Deselect"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 2. INSPECTOR HEADER */}
      <div className="p-3.5 border-b border-[#20222a] flex items-center justify-between gap-2 bg-[#121319] shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-[#1c1d27] border border-[#2b2d3d] flex items-center justify-center text-[#d1a86e] shrink-0 shadow-inner">
            {selectedElement.type === "image" ? (
              <ImageIcon className="w-3.5 h-3.5" />
            ) : selectedElement.type === "button" ? (
              <LinkIcon className="w-3.5 h-3.5" />
            ) : selectedElement.type === "section" ? (
              <Layers className="w-3.5 h-3.5" />
            ) : (
              <Type className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-serif text-xs sm:text-sm font-medium text-white truncate">
              {selectedElement.label}
            </h4>
            <span className="text-[9px] font-mono text-[#d1a86e] uppercase tracking-wider">
              {selectedElement.type}
            </span>
          </div>
        </div>

        {/* Actions shortcut & Close button in header */}
        <div className="flex items-center gap-1 shrink-0">
          {currentSection && selectedElement.type === "section" && (
            <>
              {onMoveSection && sectionIndex >= 0 && (
                <>
                  <button
                    type="button"
                    disabled={sectionIndex === 0}
                    onClick={() => onMoveSection(sectionIndex, "up")}
                    className="p-1.5 rounded bg-[#171822] hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move Section Up"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    disabled={sectionIndex === sections.length - 1}
                    onClick={() => onMoveSection(sectionIndex, "down")}
                    className="p-1.5 rounded bg-[#171822] hover:bg-zinc-800 text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer"
                    title="Move Section Down"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                </>
              )}
              {onToggleSection && (
                <button
                  type="button"
                  onClick={() => onToggleSection(currentSection.id)}
                  className={`p-1.5 rounded cursor-pointer ${
                    currentSection.isEnabled
                      ? "bg-[#1b2b22] text-emerald-400"
                      : "bg-[#251d20] text-rose-400"
                  }`}
                  title="Toggle Visibility"
                >
                  {currentSection.isEnabled ? (
                    <Eye className="w-3 h-3" />
                  ) : (
                    <EyeOff className="w-3 h-3" />
                  )}
                </button>
              )}
            </>
          )}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-[#171822] hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              title="Close Inspector"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. CONTEXTUAL INSPECTOR PANELS */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-700">
        {/* A. TEXT / HEADING / EYEBROW / PARAGRAPH */}
        {(selectedElement.type === "heading" ||
          selectedElement.type === "eyebrow" ||
          selectedElement.type === "paragraph" ||
          selectedElement.type === "banner") && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                Text Content
              </label>
              {selectedElement.type === "paragraph" ? (
                <textarea
                  rows={4}
                  value={currentVal}
                  onChange={(e) => handleValueChange(e.target.value)}
                  className="w-full bg-[#181922] border border-[#272937] rounded-xl p-2.5 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d1a86e] transition-colors leading-relaxed shadow-inner"
                  placeholder="Enter text..."
                />
              ) : (
                <input
                  type="text"
                  value={currentVal}
                  onChange={(e) => handleValueChange(e.target.value)}
                  className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d1a86e] transition-colors shadow-inner"
                  placeholder="Enter text..."
                />
              )}
            </div>

            {/* Typography Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                Editorial Styling
              </span>
              <div className="p-3 rounded-xl bg-[#161720] space-y-2.5 border border-white/5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Typeface:</span>
                  <span className="font-serif text-[#d1a86e]">
                    {selectedElement.type === "heading" ? "Playfair Display" : "Inter Sans"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-zinc-400">Font Weight:</span>
                  <span className="font-mono text-zinc-300">
                    {selectedElement.type === "heading" ? "Medium (500)" : "Regular (400)"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* B. BUTTON / ACTION */}
        {selectedElement.type === "button" && currentSection && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                Button Label
              </label>
              <input
                type="text"
                value={currentSection.contentJson?.ctaText || "Explore Catalog"}
                onChange={(e) => onUpdateSectionContent(currentSection.id, "ctaText", e.target.value)}
                className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d1a86e] transition-colors shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                Target Link
              </label>
              <input
                type="text"
                value={currentSection.contentJson?.ctaLink || "/gallery"}
                onChange={(e) => onUpdateSectionContent(currentSection.id, "ctaLink", e.target.value)}
                placeholder="/gallery or /contact"
                className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-2 text-xs text-white font-mono placeholder:text-zinc-600 focus:outline-none focus:border-[#d1a86e] transition-colors shadow-inner"
              />
            </div>

            <div className="p-3 rounded-xl bg-[#161720] space-y-2 border border-white/5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                Button Preset
              </span>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#d1a86e]" />
                <span className="text-xs text-zinc-300">Amber Primary Pill (Curatorial Accent)</span>
              </div>
            </div>
          </div>
        )}

        {/* C. IMAGE / ASSET */}
        {selectedElement.type === "image" && currentSection && (
          <div className="space-y-4">
            <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
              Image Asset
            </label>

            {/* Thumbnail Preview */}
            <div className="relative aspect-[4/3] rounded-xl overflow-hidden border border-[#262834] bg-[#0a0b0e] shadow-inner">
              {currentImageUrl ? (
                <Image
                  src={currentImageUrl}
                  alt={currentSection.title || "Section Asset"}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-zinc-500 text-xs">
                  Using default artwork cover
                </div>
              )}
            </div>

            {/* Actions: Media Library & Direct Upload */}
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => onOpenMediaPicker(currentSection.id)}
                className="flex-1 py-2 px-3 rounded-xl bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Media Library</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenMediaPicker(currentSection.id)}
                className="py-2 px-3 rounded-xl bg-[#181922] hover:bg-[#22242f] text-zinc-300 hover:text-white border border-[#272937] text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
              >
                <Upload className="w-3.5 h-3.5 text-[#d1a86e]" />
                <span>Upload</span>
              </button>
            </div>
          </div>
        )}

        {/* D. FULL SECTION */}
        {selectedElement.type === "section" && currentSection && (
          <div className="space-y-4">
            {/* Header / Visibility & Position */}
            <div className="p-3 rounded-xl bg-[#161720] space-y-2 border border-white/5">
              <div className="flex items-center justify-between">
                <span className="text-zinc-400 text-xs">Section Visibility</span>
                {onToggleSection && (
                  <button
                    type="button"
                    onClick={() => onToggleSection(currentSection.id)}
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono uppercase font-semibold cursor-pointer transition-colors ${
                      currentSection.isEnabled
                        ? "bg-emerald-950 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900"
                        : "bg-rose-950 text-rose-300 border border-rose-800/60 hover:bg-rose-900"
                    }`}
                  >
                    {currentSection.isEnabled ? "Active / Visible" : "Hidden"}
                  </button>
                )}
              </div>

              <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/5">
                <span className="text-zinc-400">Position in Layout:</span>
                <span className="font-mono text-[#d1a86e]">#{sectionIndex + 1} of {sections.length}</span>
              </div>
            </div>

            {/* Core Titles */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                Section Headline / Title
              </label>
              <input
                type="text"
                value={currentSection.title || ""}
                onChange={(e) => onUpdateSectionText(currentSection.id, "title", e.target.value)}
                className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d1a86e] shadow-inner"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                Eyebrow / Subtitle Pill
              </label>
              <input
                type="text"
                value={currentSection.subtitle || ""}
                onChange={(e) => onUpdateSectionText(currentSection.id, "subtitle", e.target.value)}
                className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d1a86e] shadow-inner"
              />
            </div>

            {/* Contextual Fields by Section Key */}

            {/* 1. HERO SHOWCASE */}
            {currentSection.sectionKey === "hero" && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    Curatorial Narrative
                  </label>
                  <textarea
                    rows={3}
                    value={currentSection.contentJson?.description || ""}
                    onChange={(e) => onUpdateSectionContent(currentSection.id, "description", e.target.value)}
                    className="w-full bg-[#181922] border border-[#272937] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d1a86e] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                      Primary CTA
                    </label>
                    <input
                      type="text"
                      value={currentSection.contentJson?.ctaText || "Explore Catalog"}
                      onChange={(e) => onUpdateSectionContent(currentSection.id, "ctaText", e.target.value)}
                      className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d1a86e]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                      CTA Link
                    </label>
                    <input
                      type="text"
                      value={currentSection.contentJson?.ctaUrl || "/gallery"}
                      onChange={(e) => onUpdateSectionContent(currentSection.id, "ctaUrl", e.target.value)}
                      className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-1.5 text-xs text-white font-mono focus:outline-none focus:border-[#d1a86e]"
                    />
                  </div>
                </div>

                <div className="pt-1">
                  <button
                    type="button"
                    onClick={() => onOpenMediaPicker(currentSection.id)}
                    className="w-full py-2 px-3 rounded-xl bg-[#181922] hover:bg-[#222432] text-zinc-300 hover:text-white border border-[#272937] text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#d1a86e]" />
                    <span>Change Featured Canvas Image</span>
                  </button>
                </div>
              </div>
            )}

            {/* 2. FEATURED ARTWORKS */}
            {currentSection.sectionKey === "featured_artworks" && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    Curatorial Intro
                  </label>
                  <textarea
                    rows={3}
                    value={currentSection.contentJson?.description || ""}
                    onChange={(e) => onUpdateSectionContent(currentSection.id, "description", e.target.value)}
                    className="w-full bg-[#181922] border border-[#272937] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d1a86e] leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* 3. LATEST COLLECTION */}
            {currentSection.sectionKey === "latest_collection" && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    Series Curatorial Statement
                  </label>
                  <textarea
                    rows={3}
                    value={currentSection.contentJson?.description || ""}
                    onChange={(e) => onUpdateSectionContent(currentSection.id, "description", e.target.value)}
                    className="w-full bg-[#181922] border border-[#272937] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d1a86e] leading-relaxed"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onOpenMediaPicker(currentSection.id)}
                  className="w-full py-2 px-3 rounded-xl bg-[#181922] hover:bg-[#222432] text-zinc-300 hover:text-white border border-[#272937] text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>Update Panoramic Series Cover</span>
                </button>
              </div>
            )}

            {/* 4. AR EXPERIENCE */}
            {currentSection.sectionKey === "ar_experience" && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    Spatial WebAR Description
                  </label>
                  <textarea
                    rows={3}
                    value={currentSection.contentJson?.description || ""}
                    onChange={(e) => onUpdateSectionContent(currentSection.id, "description", e.target.value)}
                    className="w-full bg-[#181922] border border-[#272937] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d1a86e] leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* 5. ABOUT THE ARTIST (ARTIST STORY) */}
            {currentSection.sectionKey === "artist_story" && (
              <div className="space-y-3.5 pt-2 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-[#d1a86e] block font-semibold">
                    Philosophy &amp; Monologue Quote
                  </label>
                  <textarea
                    rows={3}
                    value={currentSection.contentJson?.quote || "A painting is not merely an image hanging upon a partition; it is an alteration of the atmospheric silence within a room."}
                    onChange={(e) => onUpdateSectionContent(currentSection.id, "quote", e.target.value)}
                    className="w-full bg-[#181922] border border-[#272937] rounded-xl p-2.5 text-xs text-white italic font-serif focus:outline-none focus:border-[#d1a86e] leading-relaxed"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    Artist Biography &amp; Practice
                  </label>
                  <textarea
                    rows={4}
                    value={currentSection.contentJson?.description || ""}
                    onChange={(e) => onUpdateSectionContent(currentSection.id, "description", e.target.value)}
                    className="w-full bg-[#181922] border border-[#272937] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d1a86e] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                      Studio Location
                    </label>
                    <input
                      type="text"
                      value={siteSettings.location || ""}
                      onChange={(e) => onUpdateSiteSetting("location", e.target.value)}
                      className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d1a86e]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                      Studio Tagline
                    </label>
                    <input
                      type="text"
                      value={siteSettings.tagline || ""}
                      onChange={(e) => onUpdateSiteSetting("tagline", e.target.value)}
                      className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d1a86e]"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenMediaPicker(currentSection.id)}
                  className="w-full py-2 px-3 rounded-xl bg-[#181922] hover:bg-[#222432] text-zinc-300 hover:text-white border border-[#272937] text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>Change Artist Atelier Portrait</span>
                </button>
              </div>
            )}

            {/* 6. FEATURED EXHIBITION */}
            {currentSection.sectionKey === "featured_exhibition" && (
              <div className="space-y-3 pt-2 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    Exhibition Notes &amp; Dates
                  </label>
                  <textarea
                    rows={3}
                    value={currentSection.contentJson?.description || ""}
                    onChange={(e) => onUpdateSectionContent(currentSection.id, "description", e.target.value)}
                    className="w-full bg-[#181922] border border-[#272937] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d1a86e] leading-relaxed"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onOpenMediaPicker(currentSection.id)}
                  className="w-full py-2 px-3 rounded-xl bg-[#181922] hover:bg-[#222432] text-zinc-300 hover:text-white border border-[#272937] text-xs font-medium flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>Update Exhibition Poster</span>
                </button>
              </div>
            )}

            {/* 7. CONTACT & STUDIO INQUIRIES */}
            {currentSection.sectionKey === "contact_cta" && (
              <div className="space-y-3.5 pt-2 border-t border-white/5">
                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    Liaison Desk Description
                  </label>
                  <textarea
                    rows={2}
                    value={currentSection.contentJson?.description || ""}
                    onChange={(e) => onUpdateSectionContent(currentSection.id, "description", e.target.value)}
                    className="w-full bg-[#181922] border border-[#272937] rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-[#d1a86e] leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                      Curatorial Email
                    </label>
                    <input
                      type="email"
                      value={siteSettings.contactEmail || ""}
                      onChange={(e) => onUpdateSiteSetting("contactEmail", e.target.value)}
                      className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d1a86e]"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                      Studio Phone
                    </label>
                    <input
                      type="text"
                      value={siteSettings.phone || ""}
                      onChange={(e) => onUpdateSiteSetting("phone", e.target.value)}
                      className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d1a86e]"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    WhatsApp Liaison
                  </label>
                  <input
                    type="text"
                    value={siteSettings.whatsapp || ""}
                    onChange={(e) => onUpdateSiteSetting("whatsapp", e.target.value)}
                    className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d1a86e]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    Atelier Address
                  </label>
                  <input
                    type="text"
                    value={siteSettings.address || ""}
                    onChange={(e) => onUpdateSiteSetting("address", e.target.value)}
                    className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d1a86e]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-400 block font-semibold">
                    Studio Visiting Hours
                  </label>
                  <input
                    type="text"
                    value={siteSettings.businessHours || ""}
                    onChange={(e) => onUpdateSiteSetting("businessHours", e.target.value)}
                    className="w-full bg-[#181922] border border-[#272937] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d1a86e]"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
