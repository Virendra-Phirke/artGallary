"use client";

import React from "react";
import Image from "next/image";
import { useStudioSelection, StudioSelectedElement } from "./StudioSelectionManager";
import {
  MockHomepageSection,
  SiteSettingsData,
  MockArtwork,
} from "@/db/mockData";
import { formatCurrency } from "@/lib/utils";
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
  Sliders,
  Check,
  X,
  FileText,
  Maximize2,
  RotateCcw,
} from "lucide-react";

interface StudioInspectorProps {
  sections: MockHomepageSection[];
  siteSettings: SiteSettingsData;
  activePage: string;
  artworks?: MockArtwork[];
  onUpdateSectionText: (id: string, field: "title" | "subtitle", val: string) => void;
  onUpdateSectionContent: (id: string, field: string, val: any) => void;
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

function HeroSlidesManager({
  currentSection,
  artworks = [],
  onUpdateSectionContent,
  onOpenMediaPicker,
}: {
  currentSection: MockHomepageSection;
  artworks?: MockArtwork[];
  onUpdateSectionContent: (id: string, field: string, val: any) => void;
  onOpenMediaPicker: (targetId: string) => void;
}) {
  const heroSlideCount = Math.max(
    1,
    Math.min(6, Number(currentSection.contentJson?.heroSlideCount) || 4)
  );
  const heroImages: string[] = Array.isArray(currentSection.contentJson?.heroImages)
    ? [...currentSection.contentJson.heroImages]
    : [];
  const heroArtworkIds: string[] = Array.isArray(currentSection.contentJson?.heroArtworkIds)
    ? [...currentSection.contentJson.heroArtworkIds]
    : [];

  const handleSetSlideCount = (count: number) => {
    onUpdateSectionContent(currentSection.id, "heroSlideCount", count);
  };

  const handleSetArtworkForSlide = (slideIdx: number, artworkId: string) => {
    const updatedIds = [...heroArtworkIds];
    updatedIds[slideIdx] = artworkId;
    onUpdateSectionContent(currentSection.id, "heroArtworkIds", updatedIds);
  };

  const handleResetSlideImage = (slideIdx: number) => {
    const updatedImages = [...heroImages];
    updatedImages[slideIdx] = "";
    // If resetting slide 0, also clear imageUrl override
    if (slideIdx === 0) {
      onUpdateSectionContent(currentSection.id, "imageUrl", "");
    }
    onUpdateSectionContent(currentSection.id, "heroImages", updatedImages);
  };

  return (
    <div className="space-y-4 pt-3 border-t border-white/5">
      {/* 1. Slide Count Segmented Selector */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-[10px] uppercase font-mono tracking-wider text-zinc-300 block font-semibold">
            Carousel Slides ({heroSlideCount} of 6)
          </label>
          <span className="text-[10px] text-zinc-500 font-mono">
            Auto-cycles 9s
          </span>
        </div>
        <div className="grid grid-cols-6 gap-1 p-1 bg-[#14151c] rounded-xl border border-[#262834]">
          {[1, 2, 3, 4, 5, 6].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleSetSlideCount(num)}
              className={`py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                heroSlideCount === num
                  ? "bg-[#d1a86e] text-[#0d0e12] font-bold shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {num}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-zinc-500">
          Select number of artworks/images to switch through in the opening hero presentation.
        </p>
      </div>

      {/* 2. Slide Cards List */}
      <div className="space-y-3">
        {Array.from({ length: heroSlideCount }).map((_, idx) => {
          const linkedArtId = heroArtworkIds[idx];
          const linkedArt = linkedArtId
            ? artworks.find((a) => a.id === linkedArtId) || artworks[idx] || artworks[0]
            : artworks[idx] || artworks[0];

          const customImg = heroImages[idx] || (idx === 0 ? currentSection.contentJson?.imageUrl : undefined);
          const currentSlideImg =
            customImg ||
            linkedArt?.coverImageUrl ||
            "https://ik.imagekit.io/bpnsp30ni/artworks/gallery/1788717079935-kazuha__EB1yso0A.jpeg?updatedAt=1788717081490";

          const isCustomImage = Boolean(customImg);

          return (
            <div
              key={idx}
              className="p-3 rounded-xl bg-[#14151d] border border-[#232532] space-y-2.5 shadow-sm"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#1e202b] text-[10px] font-mono font-semibold text-[#d1a86e]">
                    Slide 0{idx + 1}
                  </span>
                  {idx === 0 && (
                    <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono">
                      (Initial Frame)
                    </span>
                  )}
                </div>
                {isCustomImage && (
                  <button
                    type="button"
                    onClick={() => handleResetSlideImage(idx)}
                    className="text-[10px] text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer flex items-center gap-1"
                    title="Reset to catalogue artwork default image"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Preview & Image Picker Action */}
              <div className="flex gap-3 items-center">
                <div className="relative w-20 h-14 rounded-lg overflow-hidden bg-black/50 border border-white/10 shrink-0">
                  {currentSlideImg ? (
                    <Image
                      src={currentSlideImg}
                      alt={`Slide 0${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[10px]">
                      No Image
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0 space-y-1">
                  <button
                    type="button"
                    onClick={() => onOpenMediaPicker(`hero_slide:${idx}`)}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-[#1a1c25] hover:bg-[#252835] text-zinc-300 hover:text-white border border-[#2d3040] text-[11px] font-medium flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-3 h-3 text-[#d1a86e]" />
                    <span>Replace Image</span>
                  </button>
                  <p className="text-[9px] text-zinc-500 truncate">
                    {isCustomImage ? "Custom override applied" : "Using catalogue artwork"}
                  </p>
                </div>
              </div>

              {/* Linked Artwork Selector */}
              <div className="space-y-1">
                <label className="text-[9px] uppercase font-mono tracking-wider text-zinc-400 block">
                  Assign Catalogue Artwork
                </label>
                <select
                  value={linkedArtId || ""}
                  onChange={(e) => handleSetArtworkForSlide(idx, e.target.value)}
                  className="w-full bg-[#181922] border border-[#272937] rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-[#d1a86e] cursor-pointer truncate"
                >
                  <option value="">
                    Default: {artworks[idx]?.title ? `${artworks[idx].title} (${formatCurrency(artworks[idx].price, artworks[idx].currency)})` : `Artwork Slot #${idx + 1}`}
                  </option>
                  {artworks.map((art) => (
                    <option key={art.id} value={art.id}>
                      {art.title} — {formatCurrency(art.price, art.currency)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StudioInspector({
  sections,
  siteSettings,
  activePage,
  artworks = [],
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

  // When no UI element is selected, do not render the empty inspector panel
  if (!selectedElement) {
    return null;
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
          currentSection.sectionKey === "hero" ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-[#161720] border border-white/5 space-y-1">
                <span className="text-[10px] uppercase font-mono tracking-wider text-[#d1a86e] block font-semibold">
                  Hero Masterpiece Carousel
                </span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Configure the number of cycling canvases and choose custom imagery or assign catalogue artworks for each slide.
                </p>
              </div>
              <HeroSlidesManager
                currentSection={currentSection}
                artworks={artworks}
                onUpdateSectionContent={onUpdateSectionContent}
                onOpenMediaPicker={onOpenMediaPicker}
              />
            </div>
          ) : (
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
          )
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

                <HeroSlidesManager
                  currentSection={currentSection}
                  artworks={artworks}
                  onUpdateSectionContent={onUpdateSectionContent}
                  onOpenMediaPicker={onOpenMediaPicker}
                />
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
