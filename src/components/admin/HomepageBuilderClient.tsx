"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MockHomepageSection,
  MockArtwork,
  MockCollection,
  MockExhibition,
  SiteSettingsData,
  DEFAULT_SITE_SETTINGS,
} from "@/db/mockData";
import {
  Eye,
  Check,
  Save,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Layers,
  Smartphone,
  Tablet,
  Monitor,
  RotateCcw,
  X,
  Search,
  RefreshCw,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  MousePointer,
  ListOrdered,
  ArrowUp,
  ArrowDown,
  EyeOff,
  ChevronDown,
  GripVertical,
  ChevronsUp,
  ChevronsDown,
} from "lucide-react";
import { PageLivePreview } from "./studio/PageLivePreview";
import { StudioSelectionProvider, useStudioSelection } from "./studio/StudioSelectionManager";
import { StudioInspector } from "./studio/StudioInspector";
import { StudioLayersTree } from "./studio/StudioLayersTree";

interface MediaAsset {
  id: string;
  fileName: string;
  fileUrl: string;
  fileKey?: string;
  mimeType: string;
  dimensions: string;
  byteSize: string;
  uploadedAt: string;
  provider: "imagekit" | "cloudflare";
}

interface HomepageBuilderClientProps {
  initialSections: MockHomepageSection[];
  artworks?: MockArtwork[];
  collections?: MockCollection[];
  exhibitions?: MockExhibition[];
  initialSiteSettings?: SiteSettingsData;
  initialPage?: ActiveStorefrontPage;
}

type ActiveStorefrontPage = "home" | "gallery" | "collections" | "exhibitions" | "about" | "contact";
type DeviceMode = "desktop" | "tablet" | "mobile";

export function HomepageBuilderClient(props: HomepageBuilderClientProps) {
  return (
    <StudioSelectionProvider>
      <HomepageBuilderContent {...props} />
    </StudioSelectionProvider>
  );
}

function HomepageBuilderContent({
  initialSections,
  artworks = [],
  collections = [],
  exhibitions = [],
  initialSiteSettings,
  initialPage = "home",
}: HomepageBuilderClientProps) {
  const {
    mode,
    setMode,
    activeTool,
    setActiveTool,
    selectedElement,
    selectElement,
    clearSelection,
  } = useStudioSelection();

  const [activePage, setActivePage] = useState<ActiveStorefrontPage>(
    initialPage && ["home", "gallery", "collections", "exhibitions", "about", "contact"].includes(initialPage)
      ? initialPage
      : "home"
  );

  const CANONICAL_SECTION_TITLES: Record<string, string> = {
    hero: "Hero Showcase",
    featured_artworks: "Curated Masterworks",
    latest_collection: "Series Spotlight",
    artist_story: "About the Artist",
    ar_experience: "WebAR Spatial Preview",
    featured_exhibition: "Exhibition Note",
    contact_cta: "Contact & Studio Inquiries",
  };

  const normalizeSections = (raw: MockHomepageSection[]): MockHomepageSection[] => {
    return raw.map((sec) => {
      let title = sec.title;
      if (sec.sectionKey === "artist_story" && (title === "The Artist's Monologue" || !title)) {
        title = "About the Artist";
      }
      if (sec.sectionKey === "contact_cta" && (title === "Private Inquiries & Acquisitions" || !title)) {
        title = "Contact & Studio Inquiries";
      }
      return {
        ...sec,
        title,
      };
    });
  };

  const [sections, setSections] = useState<MockHomepageSection[]>(() =>
    normalizeSections(initialSections)
  );
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>(
    initialSiteSettings || DEFAULT_SITE_SETTINGS
  );

  const [canvasZoom, setCanvasZoom] = useState<number>(100);
  const [canvasRefreshKey, setCanvasRefreshKey] = useState<number>(0);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Auto-open Inspector whenever user clicks / selects any element or section
  useEffect(() => {
    if (selectedElement) {
      setIsInspectorOpen(true);
    }
  }, [selectedElement]);

  const syncCanonicalTitles = () => {
    setSections((prev) =>
      prev.map((sec) => ({
        ...sec,
        title: CANONICAL_SECTION_TITLES[sec.sectionKey] || sec.title,
      }))
    );
  };

  const handleSelectSectionRow = (sec: MockHomepageSection) => {
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

    const el =
      document.querySelector(`[data-studio-id="sec:${sec.id}"]`) ||
      document.querySelector(`[data-studio-section="${sec.id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Drag and drop reordering state
  const [draggedSectionIndex, setDraggedSectionIndex] = useState<number | null>(null);
  const [dragOverSectionIndex, setDragOverSectionIndex] = useState<number | null>(null);

  // Media Library Modal state
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeSectionForMedia, setActiveSectionForMedia] = useState<string | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [uploadingForSectionId, setUploadingForSectionId] = useState<string | null>(null);

  // Fetch media records when modal opens
  const openMediaPicker = async (targetId: string) => {
    setActiveSectionForMedia(targetId);
    setIsMediaModalOpen(true);
    setLoadingMedia(true);
    try {
      const res = await fetch("/api/admin/media");
      const data = await res.json();
      if (data.success && Array.isArray(data.media)) {
        setMediaAssets(data.media);
      }
    } catch (err) {
      console.error("Failed to load media assets:", err);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleSelectMedia = (url: string) => {
    if (activeSectionForMedia === "about_portrait") {
      updateAboutConfig("artistImageUrl", url);
    } else if (activeSectionForMedia?.startsWith("hero_slide:")) {
      const slideIdx = parseInt(activeSectionForMedia.replace("hero_slide:", ""), 10);
      const heroSec = sections.find((s) => s.sectionKey === "hero");
      if (heroSec && !isNaN(slideIdx)) {
        const existingHeroImages = Array.isArray(heroSec.contentJson?.heroImages)
          ? [...heroSec.contentJson.heroImages]
          : [];
        existingHeroImages[slideIdx] = url;
        setSections((prev) =>
          prev.map((s) =>
            s.id === heroSec.id
              ? {
                  ...s,
                  contentJson: {
                    ...(s.contentJson || {}),
                    heroImages: existingHeroImages,
                    ...(slideIdx === 0 ? { imageUrl: url } : {}),
                  },
                }
              : s
          )
        );
      }
    } else if (activeSectionForMedia) {
      updateSectionContent(activeSectionForMedia, "imageUrl", url);
    }
    setIsMediaModalOpen(false);
    setActiveSectionForMedia(null);
  };

  // Direct upload handler
  const handleFileUploadForSection = async (targetId: string, file: File) => {
    setUploadingForSectionId(targetId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("purpose", targetId === "about_portrait" ? "artist_portrait" : "homepage_section");

      const res = await fetch("/api/admin/media/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success && data.media) {
        const uploadedUrl =
          data.media.variants?.optimized ||
          data.media.variants?.original ||
          data.media.url ||
          data.media.fileUrl;
        if (uploadedUrl) {
          if (targetId === "about_portrait") {
            updateAboutConfig("artistImageUrl", uploadedUrl);
          } else if (targetId.startsWith("hero_slide:")) {
            const slideIdx = parseInt(targetId.replace("hero_slide:", ""), 10);
            const heroSec = sections.find((s) => s.sectionKey === "hero");
            if (heroSec && !isNaN(slideIdx)) {
              const existingHeroImages = Array.isArray(heroSec.contentJson?.heroImages)
                ? [...heroSec.contentJson.heroImages]
                : [];
              existingHeroImages[slideIdx] = uploadedUrl;
              setSections((prev) =>
                prev.map((s) =>
                  s.id === heroSec.id
                    ? {
                        ...s,
                        contentJson: {
                          ...(s.contentJson || {}),
                          heroImages: existingHeroImages,
                          ...(slideIdx === 0 ? { imageUrl: uploadedUrl } : {}),
                        },
                      }
                    : s
                )
              );
            }
          } else {
            updateSectionContent(targetId, "imageUrl", uploadedUrl);
          }
        }
      } else {
        alert(data.error || "Image upload failed");
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      alert(err.message || "Failed to upload image");
    } finally {
      setUploadingForSectionId(null);
    }
  };

  // Reordering sections
  const moveSection = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    if (!temp || !updated[targetIndex]) return;

    updated[index] = updated[targetIndex]!;
    updated[targetIndex] = temp;

    updated.forEach((s, idx) => {
      s.displayOrder = idx + 1;
    });

    setSections(updated);
  };

  const reorderSections = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= sections.length ||
      toIndex >= sections.length
    )
      return;

    const updated = [...sections];
    const [moved] = updated.splice(fromIndex, 1);
    if (!moved) return;
    updated.splice(toIndex, 0, moved);

    updated.forEach((s, idx) => {
      s.displayOrder = idx + 1;
    });

    setSections(updated);
  };

  const moveToTop = (index: number) => {
    if (index <= 0 || index >= sections.length) return;
    reorderSections(index, 0);
  };

  const moveToBottom = (index: number) => {
    if (index < 0 || index >= sections.length - 1) return;
    reorderSections(index, sections.length - 1);
  };

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isEnabled: !s.isEnabled } : s))
    );
  };

  const updateSectionText = (
    id: string,
    field: "title" | "subtitle",
    val: string
  ) => {
    setSections((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: val } : s))
    );
  };

  const updateSectionContent = (id: string, field: string, val: any) => {
    setSections((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              contentJson: {
                ...(s.contentJson || {}),
                [field]: val,
              },
            }
          : s
      )
    );
  };

  // Site settings mutation helpers
  const updateSiteSetting = <K extends keyof SiteSettingsData>(key: K, value: SiteSettingsData[K]) => {
    setSiteSettings((prev) => ({ ...prev, [key]: value }));
  };

  const updateGalleryConfig = (field: string, value: any) => {
    setSiteSettings((prev) => ({
      ...prev,
      galleryPageConfig: {
        ...prev.galleryPageConfig,
        [field]: value,
      },
    }));
  };

  const updateCollectionsConfig = (field: string, value: any) => {
    setSiteSettings((prev) => ({
      ...prev,
      collectionsPageConfig: {
        ...prev.collectionsPageConfig,
        [field]: value,
      },
    }));
  };

  const updateExhibitionsConfig = (field: string, value: any) => {
    setSiteSettings((prev) => ({
      ...prev,
      exhibitionsPageConfig: {
        ...prev.exhibitionsPageConfig,
        [field]: value,
      },
    }));
  };

  const updateAboutConfig = (field: string, value: any) => {
    setSiteSettings((prev) => ({
      ...prev,
      aboutPageConfig: {
        ...prev.aboutPageConfig,
        [field]: value,
      },
    }));
  };

  const updateContactConfig = (field: string, value: any) => {
    setSiteSettings((prev) => ({
      ...prev,
      contactPageConfig: {
        ...prev.contactPageConfig,
        [field]: value,
      },
    }));
  };

  const handleSaveHomepage = async () => {
    const res = await fetch("/api/admin/homepage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sections }),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to save homepage sections");
    }
  };

  const handleSaveSettings = async () => {
    const res = await fetch("/api/admin/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(siteSettings),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(data.error || "Failed to save site settings");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (activePage === "home") {
        // Save both homepage sections AND site settings (so contact details and bio are saved simultaneously)
        await Promise.all([handleSaveHomepage(), handleSaveSettings()]);
      } else {
        await handleSaveSettings();
      }
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err: any) {
      console.error("Save error:", err);
      alert(err.message || "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Keyboard shortcut: Ctrl+S / Cmd+S to publish
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        clearSelection();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sections, siteSettings, activePage, clearSelection]);

  const filteredMedia = mediaAssets.filter((m) =>
    m.fileName.toLowerCase().includes(mediaSearchQuery.toLowerCase())
  );

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[#090a0f] text-[#f4f4f6]">
      {/* 1. UNIFIED STUDIO COMMAND BAR (PRO LEVEL) */}
      <header className="h-12 sm:h-13 bg-[#111218] border-b border-[#1f212b] px-3 sm:px-4 flex items-center justify-between gap-3 shrink-0 z-30">
        {/* Mode (Select/Preview) + Device Mode + Zoom */}
        <div className="flex items-center gap-2 shrink-0 bg-[#0c0d12] p-1 rounded-xl border border-[#1f212b]">
          {/* Select vs Preview Toggle */}
          <div className="flex items-center bg-[#15161f] p-0.5 rounded-lg border border-[#252834]">
            <button
              type="button"
              onClick={() => setMode("select")}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                mode === "select"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Select Mode: Click any element in preview to edit"
            >
              <MousePointer className="w-3 h-3" />
              <span>Select</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("preview");
                clearSelection();
              }}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                mode === "preview"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-xs"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Preview Mode: Test storefront freely without editor outlines"
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
          </div>

          <div className="h-3.5 w-px bg-[#262834]" />

          {/* Viewport Width Preset */}
          <div className="flex items-center bg-[#15161f] p-0.5 rounded-lg border border-[#252834]">
            <button
              type="button"
              onClick={() => setDeviceMode("desktop")}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                deviceMode === "desktop"
                  ? "bg-[#252836] text-[#d1a86e]"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Desktop View (Full Width)"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("tablet")}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                deviceMode === "tablet"
                  ? "bg-[#252836] text-[#d1a86e]"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setDeviceMode("mobile")}
              className={`p-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                deviceMode === "mobile"
                  ? "bg-[#252836] text-[#d1a86e]"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-3.5 w-px bg-[#262834]" />

          {/* Zoom */}
          <div className="flex items-center gap-0.5 text-xs text-zinc-400">
            <button
              type="button"
              onClick={() => setCanvasZoom((z) => Math.max(50, z - 10))}
              className="p-1 hover:text-white transition-colors cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[10px] min-w-[32px] text-center text-zinc-300">
              {canvasZoom}%
            </span>
            <button
              type="button"
              onClick={() => setCanvasZoom((z) => Math.min(150, z + 10))}
              className="p-1 hover:text-white transition-colors cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCanvasRefreshKey((k) => k + 1)}
              className="p-1 hover:text-white transition-colors cursor-pointer ml-1"
              title="Refresh Canvas"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Right: Publish button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-1.5 bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] px-3 sm:px-4 py-1.5 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md shadow-[#d1a86e]/20 disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-950 font-bold" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>
              {isSaving
                ? "Saving..."
                : savedSuccess
                ? "Published!"
                : "Publish Layout"}
            </span>
          </button>
        </div>
      </header>

      {/* 2. DOCKED 3-PANE WORKSPACE (ZERO WEIRD FLOATING GAPS) */}
      <div className="flex-1 flex overflow-hidden min-h-0 relative">
        {/* COLUMN 1: SLIM TOOL RAIL (DOCK-STYLE) */}
        <div className="w-12 sm:w-13 h-full bg-[#111218] border-r border-[#1f212b] py-3 flex flex-col items-center justify-between shrink-0 z-20">
          {/* Top Tools */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setActiveTool("select");
                setMode("select");
              }}
              className={`p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTool === "select"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-md shadow-[#d1a86e]/20"
                  : "text-zinc-400 hover:text-white hover:bg-[#1a1b24]"
              }`}
              title="Select Tool: Click canvas elements directly"
            >
              <MousePointer className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool(activeTool === "layers" ? "select" : "layers");
              }}
              className={`p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTool === "layers"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-md shadow-[#d1a86e]/20"
                  : "text-zinc-400 hover:text-white hover:bg-[#1a1b24]"
              }`}
              title="Layers Navigator (Tree View)"
            >
              <Layers className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTool(activeTool === "sections" ? "select" : "sections");
              }}
              className={`p-2.5 rounded-xl text-xs transition-all cursor-pointer ${
                activeTool === "sections"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-md shadow-[#d1a86e]/20"
                  : "text-zinc-400 hover:text-white hover:bg-[#1a1b24]"
              }`}
              title="Sections Structure & Order"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
          </div>

          {/* Bottom Tools */}
          <div className="flex flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => openMediaPicker("homepage_media")}
              className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-[#1a1b24] transition-colors cursor-pointer"
              title="Media Library Asset Manager"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* COLUMN 1.5: DOCKED DRAWER (LAYERS OR SECTIONS) */}
        {activeTool === "layers" && (
          <div className="w-80 lg:w-96 xl:w-[410px] h-full shrink-0 border-r border-[#1f212b] bg-[#111218] overflow-hidden z-10 shadow-xl animate-in slide-in-from-left duration-200">
            <StudioLayersTree
              sections={sections}
              activePage={activePage}
              onMoveSection={moveSection}
              onReorderSections={reorderSections}
              onToggleSection={toggleSection}
            />
          </div>
        )}

        {activeTool === "sections" && (
          <div className="w-80 lg:w-96 xl:w-[410px] h-full shrink-0 border-r border-[#1f212b] bg-[#111218] overflow-hidden z-10 shadow-xl flex flex-col text-xs text-white animate-in slide-in-from-left duration-200">
            <div className="p-3.5 border-b border-[#20222a] shrink-0 bg-[#14151c] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ListOrdered className="w-4 h-4 text-[#d1a86e]" />
                  <span className="font-serif text-sm font-medium">Sections Order</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={syncCanonicalTitles}
                    className="text-[10px] text-zinc-400 hover:text-[#d1a86e] bg-[#181922] hover:bg-[#20222e] px-2 py-0.5 rounded border border-white/5 transition-colors flex items-center gap-1 cursor-pointer"
                    title="Reset all section names to clean canonical titles"
                  >
                    <Sparkles className="w-3 h-3 text-[#d1a86e]" />
                    <span>Sync Titles</span>
                  </button>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase bg-[#181922] px-2 py-0.5 rounded border border-white/5">
                    {sections.length} Units
                  </span>
                </div>
              </div>
              <p className="text-[10px] text-zinc-500 font-light">
                Click any section to inspect &amp; edit. Grab handle to reorder anywhere.
              </p>
            </div>
            <div className="p-2.5 space-y-1.5 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-zinc-700 select-none">
              {sections.map((sec, idx) => {
                const isDragging = draggedSectionIndex === idx;
                const isDragOver = dragOverSectionIndex === idx && draggedSectionIndex !== idx;
                const isSelected =
                  selectedElement?.sectionId === sec.id ||
                  selectedElement?.id === `sec:${sec.id}`;

                return (
                  <div
                    key={sec.id}
                    draggable
                    onClick={() => handleSelectSectionRow(sec)}
                    onDragStart={(e) => {
                      setDraggedSectionIndex(idx);
                      e.dataTransfer.effectAllowed = "move";
                      e.dataTransfer.setData("text/plain", `${idx}`);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = "move";
                      if (dragOverSectionIndex !== idx) {
                        setDragOverSectionIndex(idx);
                      }
                    }}
                    onDragEnter={(e) => {
                      e.preventDefault();
                      setDragOverSectionIndex(idx);
                    }}
                    onDragLeave={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDragOverSectionIndex((curr) => (curr === idx ? null : curr));
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (draggedSectionIndex !== null && draggedSectionIndex !== idx) {
                        reorderSections(draggedSectionIndex, idx);
                      }
                      setDraggedSectionIndex(null);
                      setDragOverSectionIndex(null);
                    }}
                    onDragEnd={() => {
                      setDraggedSectionIndex(null);
                      setDragOverSectionIndex(null);
                    }}
                    className={`group p-2.5 rounded-xl border flex items-center justify-between gap-2 shadow-sm transition-all duration-150 cursor-pointer ${
                      isDragging
                        ? "opacity-30 scale-[0.98] border-dashed border-[#d1a86e] bg-[#1a1b26]"
                        : isDragOver
                        ? "border-[#d1a86e] bg-[#d1a86e]/15 ring-2 ring-[#d1a86e]/70 shadow-lg shadow-[#d1a86e]/20 translate-y-0.5"
                        : isSelected
                        ? "border-[#d1a86e] bg-[#d1a86e]/15 ring-1 ring-[#d1a86e]/50 shadow-md shadow-[#d1a86e]/10 text-white"
                        : "bg-[#161722] border-white/5 hover:border-[#d1a86e]/40 hover:bg-[#1a1c2a]"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {/* Active Indicator Bar */}
                      <div
                        className={`w-1 h-5 rounded-full shrink-0 transition-colors ${
                          isSelected ? "bg-[#d1a86e]" : "bg-transparent group-hover:bg-[#d1a86e]/40"
                        }`}
                      />

                      {/* Grab Drag Handle */}
                      <div
                        onClick={(e) => e.stopPropagation()}
                        className="text-zinc-500 group-hover:text-[#d1a86e] transition-colors p-0.5 shrink-0 cursor-grab active:cursor-grabbing hover:bg-white/5 rounded"
                        title="Grab to drag and reorder"
                      >
                        <GripVertical className="w-3.5 h-3.5" />
                      </div>
                      <span className="font-mono text-[10px] text-zinc-500 shrink-0">
                        0{idx + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p
                          className="truncate text-white text-xs font-medium"
                          title={sec.title || sec.sectionKey}
                        >
                          {sec.title || sec.sectionKey}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono truncate">
                          {sec.sectionKey.replace(/_/g, " ")}
                        </p>
                      </div>
                    </div>

                    <div
                      className="flex items-center gap-0.5 shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Quick Move to Top */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveToTop(idx)}
                        className="p-1 rounded text-zinc-500 hover:text-[#d1a86e] disabled:opacity-15 cursor-pointer hover:bg-zinc-800 transition-colors hidden sm:inline-flex"
                        title="Move to Top"
                      >
                        <ChevronsUp className="w-3 h-3" />
                      </button>

                      {/* Step Up */}
                      <button
                        type="button"
                        disabled={idx === 0}
                        onClick={() => moveSection(idx, "up")}
                        className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer hover:bg-zinc-800 transition-colors"
                        title="Move Up"
                      >
                        <ArrowUp className="w-3 h-3" />
                      </button>

                      {/* Step Down */}
                      <button
                        type="button"
                        disabled={idx === sections.length - 1}
                        onClick={() => moveSection(idx, "down")}
                        className="p-1 rounded text-zinc-400 hover:text-white disabled:opacity-20 cursor-pointer hover:bg-zinc-800 transition-colors"
                        title="Move Down"
                      >
                        <ArrowDown className="w-3 h-3" />
                      </button>

                      {/* Quick Move to Bottom */}
                      <button
                        type="button"
                        disabled={idx === sections.length - 1}
                        onClick={() => moveToBottom(idx)}
                        className="p-1 rounded text-zinc-500 hover:text-[#d1a86e] disabled:opacity-15 cursor-pointer hover:bg-zinc-800 transition-colors hidden sm:inline-flex"
                        title="Move to Bottom"
                      >
                        <ChevronsDown className="w-3 h-3" />
                      </button>

                      {/* Toggle Visibility */}
                      <button
                        type="button"
                        onClick={() => toggleSection(sec.id)}
                        className={`p-1 rounded cursor-pointer hover:bg-zinc-800 transition-colors ${
                          sec.isEnabled ? "text-emerald-400" : "text-zinc-600"
                        }`}
                        title="Toggle Visibility"
                      >
                        {sec.isEnabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* COLUMN 2: CENTER CANVAS STAGE (ARTBOARD VIEWPORT) */}
        <div className="flex-1 h-full overflow-y-auto bg-[#08090d] p-2 sm:p-3 lg:p-4 flex justify-center items-start scrollbar-thin scrollbar-thumb-[#1f212b] relative">
          <div className="w-full flex justify-center transition-all duration-300">
            <PageLivePreview
              key={canvasRefreshKey}
              activePage={activePage}
              sections={sections}
              siteSettings={siteSettings}
              artworks={artworks}
              collections={collections}
              exhibitions={exhibitions}
              deviceMode={deviceMode}
              zoom={canvasZoom}
              onMoveSection={(secId, dir) => {
                const idx = sections.findIndex((s) => s.id === secId);
                if (idx !== -1) moveSection(idx, dir);
              }}
              onToggleSection={toggleSection}
              onOpenMediaPicker={openMediaPicker}
            />
          </div>
        </div>

        {/* COLUMN 3: DOCKED RIGHT INSPECTOR (COLLAPSIBLE) */}
        <div
          className={`h-full shrink-0 z-10 transition-all duration-300 ease-in-out ${
            isInspectorOpen && selectedElement
              ? "w-72 sm:w-80 lg:w-84 xl:w-92 opacity-100"
              : "w-0 opacity-0 pointer-events-none overflow-hidden"
          }`}
        >
          <StudioInspector
            sections={sections}
            siteSettings={siteSettings}
            activePage={activePage}
            artworks={artworks}
            onUpdateSectionText={updateSectionText}
            onUpdateSectionContent={updateSectionContent}
            onUpdateSiteSetting={updateSiteSetting}
            onUpdateGalleryConfig={updateGalleryConfig}
            onUpdateCollectionsConfig={updateCollectionsConfig}
            onUpdateExhibitionsConfig={updateExhibitionsConfig}
            onUpdateAboutConfig={updateAboutConfig}
            onUpdateContactConfig={updateContactConfig}
            onOpenMediaPicker={openMediaPicker}
            onMoveSection={moveSection}
            onToggleSection={toggleSection}
            onClose={() => {
              setIsInspectorOpen(false);
              clearSelection();
            }}
          />
        </div>
      </div>

      {/* MEDIA ASSET PICKER MODAL */}
      {isMediaModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14151a] border border-[#262833] rounded-2xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-[#262833] flex items-center justify-between">
              <div>
                <h3 className="font-serif text-lg text-white">
                  Select Image Asset from Media Library
                </h3>
                <p className="text-xs text-zinc-400">
                  Select any verified image hosted on Cloudflare R2 / ImageKit for{" "}
                  {activeSectionForMedia === "about_portrait"
                    ? "the artist studio portrait"
                    : activeSectionForMedia?.startsWith("hero_slide:")
                    ? `Hero Carousel Slide 0${Number(activeSectionForMedia.replace("hero_slide:", "")) + 1}`
                    : "this editorial section"}
                  .
                </p>
              </div>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Search & Upload Filter */}
            <div className="p-4 border-b border-[#1f212b] flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search assets by filename..."
                  value={mediaSearchQuery}
                  onChange={(e) => setMediaSearchQuery(e.target.value)}
                  className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#d1a86e]"
                />
              </div>

              {/* Upload directly inside modal */}
              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d1a86e] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shrink-0 hover:bg-[#e2c18d] transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New</span>
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && activeSectionForMedia) {
                      await handleFileUploadForSection(activeSectionForMedia, file);
                      setIsMediaModalOpen(false);
                    }
                  }}
                />
              </label>
            </div>

            {/* Modal Asset Grid */}
            <div className="p-5 overflow-y-auto flex-1">
              {loadingMedia ? (
                <div className="py-20 flex flex-col items-center justify-center text-zinc-400 gap-3">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#d1a86e]" />
                  <span className="text-xs">Loading media records...</span>
                </div>
              ) : filteredMedia.length === 0 ? (
                <div className="py-20 text-center text-zinc-500 text-xs">
                  No media assets found matching &ldquo;{mediaSearchQuery}&rdquo;.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredMedia.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={() => handleSelectMedia(asset.fileUrl)}
                      className="group relative rounded-xl overflow-hidden border border-[#262833] bg-[#101115] hover:border-[#d1a86e] text-left transition-all p-2 flex flex-col space-y-2 hover:shadow-lg cursor-pointer"
                    >
                      <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-black/50 w-full">
                        <Image
                          src={asset.fileUrl}
                          alt={asset.fileName}
                          fill
                          sizes="180px"
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute top-1 right-1 text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-black/75 text-[#d1a86e] border border-white/10 font-mono">
                          {asset.provider}
                        </span>
                      </div>

                      <div className="w-full">
                        <p className="text-[11px] font-medium text-white truncate group-hover:text-[#d1a86e] transition-colors">
                          {asset.fileName}
                        </p>
                        <p className="text-[9px] text-zinc-500 font-mono">
                          {asset.dimensions} • {asset.byteSize}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
