"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MockHomepageSection,
  MockArtwork,
  MockCollection,
  MockExhibition,
} from "@/db/mockData";
import {
  Eye,
  Check,
  MoveUp,
  MoveDown,
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
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  MapPin,
  ArrowRight,
  ShieldCheck,
  Split,
  Sliders,
} from "lucide-react";
import { formatCurrency, formatDimensions } from "@/lib/utils";

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
}

type ViewMode = "split" | "editor" | "preview";
type DeviceMode = "desktop" | "tablet" | "mobile";

export function HomepageBuilderClient({
  initialSections,
  artworks = [],
  collections = [],
  exhibitions = [],
}: HomepageBuilderClientProps) {
  const [sections, setSections] = useState<MockHomepageSection[]>(initialSections);
  const [expandedSectionId, setExpandedSectionId] = useState<string | null>(
    initialSections[0]?.id || null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  const [deviceMode, setDeviceMode] = useState<DeviceMode>("desktop");
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Media Library Modal state
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [activeSectionForMedia, setActiveSectionForMedia] = useState<string | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [mediaSearchQuery, setMediaSearchQuery] = useState("");
  const [uploadingForSectionId, setUploadingForSectionId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const directUploadInputRef = useRef<HTMLInputElement>(null);

  // Fetch media records when modal opens
  const openMediaPicker = async (sectionId: string) => {
    setActiveSectionForMedia(sectionId);
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
    if (!activeSectionForMedia) return;
    updateSectionContent(activeSectionForMedia, "imageUrl", url);
    setIsMediaModalOpen(false);
    setActiveSectionForMedia(null);
  };

  // Direct upload handler for a section
  const handleFileUploadForSection = async (
    sectionId: string,
    file: File
  ) => {
    setUploadingForSectionId(sectionId);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("role", "homepage");
      formData.append("provider", "imagekit");

      const res = await fetch("/api/upload", {
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
          updateSectionContent(sectionId, "imageUrl", uploadedUrl);
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

  const updateSectionContent = (
    id: string,
    field: string,
    val: any
  ) => {
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

  const clearSectionImage = (id: string) => {
    setSections((prev) =>
      prev.map((s) => {
        if (s.id !== id) return s;
        const newJson = { ...(s.contentJson || {}) };
        delete newJson.imageUrl;
        return { ...s, contentJson: newJson };
      })
    );
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sections }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3500);
      } else {
        alert(data.error || "Failed to save sections");
      }
    } catch (err) {
      console.error("Failed to save homepage sections:", err);
      alert("Failed to save homepage sections");
    } finally {
      setIsSaving(false);
    }
  };

  const heroArtwork = artworks[0];
  const featuredCollection = collections[0];
  const currentExhibition = exhibitions[0];

  const filteredMedia = mediaAssets.filter((m) =>
    m.fileName.toLowerCase().includes(mediaSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* 1. TOP BUILDER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#14151a] p-5 rounded-2xl border border-[#262833] shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
              Live Visual Studio
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-[11px] text-zinc-400">
              {sections.filter((s) => s.isEnabled).length} of {sections.length} Sections Active
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-white mt-1">
            Homepage Visual Studio
          </h1>
        </div>

        {/* View Mode & Device Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex items-center p-1 bg-[#1a1c23] border border-[#262833] rounded-xl">
            <button
              onClick={() => setViewMode("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "split"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Split View: Editor & Live Preview"
            >
              <Split className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Split</span>
            </button>
            <button
              onClick={() => setViewMode("editor")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "editor"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Editor Only"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editor</span>
            </button>
            <button
              onClick={() => setViewMode("preview")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === "preview"
                  ? "bg-[#d1a86e] text-[#0d0e12] font-semibold"
                  : "text-zinc-400 hover:text-white"
              }`}
              title="Preview Canvas"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Live Canvas</span>
            </button>
          </div>

          {/* Device Simulator Toggle (visible if split or preview) */}
          {viewMode !== "editor" && (
            <div className="flex items-center p-1 bg-[#1a1c23] border border-[#262833] rounded-xl">
              <button
                onClick={() => setDeviceMode("desktop")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  deviceMode === "desktop"
                    ? "bg-zinc-800 text-[#d1a86e]"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Desktop View (Full Width)"
              >
                <Monitor className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode("tablet")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  deviceMode === "tablet"
                    ? "bg-zinc-800 text-[#d1a86e]"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Tablet View (768px)"
              >
                <Tablet className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeviceMode("mobile")}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  deviceMode === "mobile"
                    ? "bg-zinc-800 text-[#d1a86e]"
                    : "text-zinc-400 hover:text-white"
                }`}
                title="Mobile View (390px)"
              >
                <Smartphone className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Quick Storefront Pages Links */}
          <div className="hidden lg:flex items-center gap-1 p-1 bg-[#1a1c23] border border-[#262833] rounded-xl text-xs">
            <span className="px-2 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">Storefront:</span>
            <Link href="/" target="_blank" className="px-2 py-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">Home</Link>
            <Link href="/gallery" target="_blank" className="px-2 py-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">Gallery</Link>
            <Link href="/collections" target="_blank" className="px-2 py-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">Collections</Link>
            <Link href="/exhibitions" target="_blank" className="px-2 py-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">Exhibitions</Link>
            <Link href="/about" target="_blank" className="px-2 py-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">About</Link>
            <Link href="/contact" target="_blank" className="px-2 py-1 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors">Contact</Link>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all shadow-md shadow-[#d1a86e]/15 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : savedSuccess ? (
              <Check className="w-3.5 h-3.5 text-emerald-950 font-bold" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Saving..." : savedSuccess ? "Published!" : "Publish Layout"}</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN WORKSPACE CONTAINER (SPLIT / EDITOR / PREVIEW) */}
      <div
        className={`grid gap-8 items-start ${
          viewMode === "split"
            ? "grid-cols-1 xl:grid-cols-12"
            : "grid-cols-1"
        }`}
      >
        {/* LEFT COLUMN: SECTION EDITORS & IMAGE SETUP */}
        {viewMode !== "preview" && (
          <div
            className={`space-y-4 ${
              viewMode === "split" ? "xl:col-span-5" : "w-full max-w-4xl mx-auto"
            }`}
          >
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
                Editorial Sections ({sections.length})
              </span>
              <span className="text-[11px] text-zinc-500">
                Drag or use arrows to reorder
              </span>
            </div>

            {sections.map((sec, idx) => {
              const isExpanded = expandedSectionId === sec.id;
              const currentImageUrl =
                sec.contentJson?.imageUrl ||
                (sec.sectionKey === "hero"
                  ? heroArtwork?.coverImageUrl
                  : sec.sectionKey === "latest_collection"
                  ? featuredCollection?.coverImageUrl
                  : sec.sectionKey === "featured_exhibition"
                  ? currentExhibition?.coverImageUrl
                  : undefined);

              const hasCustomImage = Boolean(sec.contentJson?.imageUrl);

              return (
                <div
                  key={sec.id}
                  className={`rounded-2xl border transition-all shadow-md ${
                    sec.isEnabled
                      ? "bg-[#14151a] border-[#262833]"
                      : "bg-[#14151a]/50 border-[#1f212b] opacity-65"
                  }`}
                >
                  {/* Card Header & Controls */}
                  <div className="p-4 flex items-center justify-between gap-3">
                    <div
                      onClick={() =>
                        setExpandedSectionId(isExpanded ? null : sec.id)
                      }
                      className="flex items-center gap-3 cursor-pointer flex-1 select-none"
                    >
                      <span className="w-7 h-7 rounded-full bg-[#1a1c23] border border-[#262833] flex items-center justify-center text-xs font-mono text-[#d1a86e] font-semibold">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-serif text-sm md:text-base text-white font-medium">
                            {sec.title}
                          </h3>
                          {hasCustomImage && (
                            <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#d1a86e]/15 text-[#d1a86e] border border-[#d1a86e]/30 font-medium">
                              Custom Image
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] tracking-wider text-zinc-500 uppercase">
                          {sec.sectionKey.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Reorder Buttons */}
                      <div className="flex items-center gap-0.5 border border-[#262833] rounded-lg p-0.5 bg-[#1a1c23]">
                        <button
                          type="button"
                          onClick={() => moveSection(idx, "up")}
                          disabled={idx === 0}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                          title="Move Up"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveSection(idx, "down")}
                          disabled={idx === sections.length - 1}
                          className="p-1 text-zinc-400 hover:text-white disabled:opacity-20"
                          title="Move Down"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Enable/Disable Toggle */}
                      <button
                        type="button"
                        onClick={() => toggleSection(sec.id)}
                        className={`text-[11px] px-3 py-1 rounded-full font-medium transition-colors ${
                          sec.isEnabled
                            ? "bg-emerald-950/80 text-emerald-300 border border-emerald-800/80"
                            : "bg-zinc-800 text-zinc-400 border border-zinc-700"
                        }`}
                      >
                        {sec.isEnabled ? "Active" : "Hidden"}
                      </button>

                      {/* Expand Toggle */}
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedSectionId(isExpanded ? null : sec.id)
                        }
                        className="p-1.5 text-zinc-400 hover:text-white"
                        title={isExpanded ? "Collapse" : "Expand"}
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Content Editors */}
                  {isExpanded && (
                    <div className="p-4 pt-1 border-t border-[#1f212b] space-y-5">
                      {/* 1. Headline & Subheading */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                            Section Headline
                          </label>
                          <input
                            type="text"
                            value={sec.title}
                            onChange={(e) =>
                              updateSectionText(sec.id, "title", e.target.value)
                            }
                            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                            placeholder="e.g. Selected Works"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                            Section Subheading / Tagline
                          </label>
                          <input
                            type="text"
                            value={sec.subtitle}
                            onChange={(e) =>
                              updateSectionText(sec.id, "subtitle", e.target.value)
                            }
                            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                            placeholder="e.g. Curated Catalogue"
                          />
                        </div>
                      </div>

                      {/* 2. Custom Callout / Badge / Description */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#1f212b]/60">
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                            Badge Pill Text
                          </label>
                          <input
                            type="text"
                            value={sec.contentJson?.badge || ""}
                            onChange={(e) =>
                              updateSectionContent(sec.id, "badge", e.target.value)
                            }
                            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                            placeholder="e.g. Spring 2026 Retrospective"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                            Primary CTA Button Text
                          </label>
                          <input
                            type="text"
                            value={sec.contentJson?.ctaText || ""}
                            onChange={(e) =>
                              updateSectionContent(sec.id, "ctaText", e.target.value)
                            }
                            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                            placeholder="e.g. Explore Catalog"
                          />
                        </div>
                      </div>

                      {/* Extra Editorial Text for Story or AR */}
                      {(sec.sectionKey === "artist_story" ||
                        sec.sectionKey === "hero" ||
                        sec.sectionKey === "ar_experience") && (
                        <div>
                          <label className="block text-[10px] uppercase tracking-wider text-zinc-400 mb-1 font-semibold">
                            {sec.sectionKey === "artist_story"
                              ? "Artist Quote / Philosophy"
                              : "Curatorial Description"}
                          </label>
                          <textarea
                            rows={3}
                            value={
                              sec.sectionKey === "artist_story"
                                ? sec.contentJson?.quote ||
                                  "A painting is not merely an image hanging upon a partition; it is an alteration of the atmospheric silence within a room."
                                : sec.contentJson?.description || ""
                            }
                            onChange={(e) =>
                              updateSectionContent(
                                sec.id,
                                sec.sectionKey === "artist_story" ? "quote" : "description",
                                e.target.value
                              )
                            }
                            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none resize-none"
                            placeholder="Enter curatorial text..."
                          />
                        </div>
                      )}

                      {/* 3. DEDICATED IMAGE SETUP PANEL */}
                      <div className="p-3.5 rounded-xl bg-[#101115] border border-[#262833] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ImageIcon className="w-3.5 h-3.5 text-[#d1a86e]" />
                            <span className="text-[11px] font-semibold text-white uppercase tracking-wider">
                              Section Image Asset
                            </span>
                          </div>
                          {hasCustomImage ? (
                            <button
                              type="button"
                              onClick={() => clearSectionImage(sec.id)}
                              className="text-[10px] text-amber-400 hover:text-amber-300 flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset to Default</span>
                            </button>
                          ) : (
                            <span className="text-[10px] text-zinc-500">
                              Using Primary Artwork / Theme Default
                            </span>
                          )}
                        </div>

                        {/* Thumbnail Preview and Quick Controls */}
                        <div className="flex items-start gap-4">
                          <div className="relative w-28 h-20 rounded-lg overflow-hidden bg-[#181920] border border-[#262833] shrink-0 shadow-inner flex items-center justify-center">
                            {currentImageUrl ? (
                              <Image
                                src={currentImageUrl}
                                alt="Section asset preview"
                                fill
                                sizes="112px"
                                className="object-cover"
                              />
                            ) : (
                              <div className="text-zinc-600 text-[10px] flex flex-col items-center">
                                <ImageIcon className="w-5 h-5 mb-1 opacity-50" />
                                <span>No Image</span>
                              </div>
                            )}

                            {uploadingForSectionId === sec.id && (
                              <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center text-white text-[10px] gap-1 z-10">
                                <RefreshCw className="w-4 h-4 animate-spin text-[#d1a86e]" />
                                <span>Uploading...</span>
                              </div>
                            )}
                          </div>

                          <div className="flex-1 space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              {/* Direct Upload to ImageKit Button */}
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1c23] hover:bg-[#22242d] border border-[#262833] text-white text-[11px] font-medium transition-colors">
                                <Upload className="w-3 h-3 text-[#d1a86e]" />
                                <span>Upload to ImageKit</span>
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/webp,image/avif"
                                  className="hidden"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUploadForSection(sec.id, file);
                                  }}
                                />
                              </label>

                              {/* Media Library Selector */}
                              <button
                                type="button"
                                onClick={() => openMediaPicker(sec.id)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1c23] hover:bg-[#22242d] border border-[#262833] text-white text-[11px] font-medium transition-colors"
                              >
                                <Layers className="w-3 h-3 text-[#d1a86e]" />
                                <span>Media Library</span>
                              </button>
                            </div>

                            {/* Direct URL input */}
                            <div>
                              <input
                                type="text"
                                value={sec.contentJson?.imageUrl || ""}
                                onChange={(e) =>
                                  updateSectionContent(sec.id, "imageUrl", e.target.value)
                                }
                                placeholder="Paste direct CDN image URL..."
                                className="w-full bg-[#181920] border border-[#262833] rounded-lg px-2.5 py-1.5 text-[11px] text-zinc-300 focus:border-[#d1a86e] focus:outline-none placeholder:text-zinc-600"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* RIGHT COLUMN: INTERACTIVE VISUAL CANVAS PREVIEW */}
        {viewMode !== "editor" && (
          <div
            className={`sticky top-6 ${
              viewMode === "split" ? "xl:col-span-7" : "w-full"
            }`}
          >
            {/* Device Simulator Header */}
            <div className="bg-[#181920] border border-[#262833] rounded-t-2xl px-4 py-2.5 flex items-center justify-between text-xs text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 text-[11px] font-mono text-zinc-500 hidden sm:inline">
                  https://latelier-lumineux.art/
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-widest text-[#d1a86e] font-semibold">
                  Live Canvas
                </span>
                <span className="text-[10px] text-zinc-500 capitalize">
                  ({deviceMode} View)
                </span>
              </div>
            </div>

            {/* Device Canvas Frame */}
            <div className="bg-[#0b0c0f] border-x border-b border-[#262833] rounded-b-2xl p-3 md:p-6 overflow-hidden flex justify-center shadow-2xl">
              <div
                className={`transition-all duration-300 bg-[#0d0e12] rounded-xl overflow-y-auto max-h-[82vh] border border-[#1f212b] shadow-2xl ${
                  deviceMode === "desktop"
                    ? "w-full"
                    : deviceMode === "tablet"
                    ? "w-[768px] max-w-full"
                    : "w-[390px] max-w-full rounded-[36px] border-4 border-zinc-800"
                }`}
              >
                {/* Mobile Phone Speaker Notch if Mobile */}
                {deviceMode === "mobile" && (
                  <div className="w-full flex justify-center pt-2 pb-1 bg-[#0d0e12] sticky top-0 z-30">
                    <div className="w-28 h-4 bg-zinc-800 rounded-full flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-zinc-900 border border-zinc-700" />
                    </div>
                  </div>
                )}

                {/* SIMULATED HOMEPAGE SECTIONS IN SEQUENCE */}
                <div className="space-y-16 md:space-y-24 pb-16 pt-6">
                  {sections
                    .filter((s) => s.isEnabled)
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .map((sec) => {
                      // RENDER HERO
                      if (sec.sectionKey === "hero") {
                        const heroImage =
                          sec.contentJson?.imageUrl || heroArtwork?.coverImageUrl;
                        return (
                          <div
                            key={sec.id}
                            className="relative px-6 py-10 md:py-16 text-left overflow-hidden border-b border-[#1c1d25]/60"
                          >
                            <div className="absolute top-0 right-0 w-72 h-72 bg-[#d1a86e]/10 rounded-full blur-[90px] pointer-events-none" />

                            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                              <div className="md:col-span-7 space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18191e] border border-[#262833] text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e] animate-pulse" />
                                  <span>
                                    {sec.contentJson?.badge ||
                                      sec.subtitle ||
                                      "Spring 2026 Retrospective"}
                                  </span>
                                </div>

                                <h2 className="font-serif text-3xl md:text-5xl text-white font-medium leading-[1.1]">
                                  {sec.title || "The Architecture of Luminous Stillness"}
                                </h2>

                                <p className="text-xs md:text-sm text-[#a6aabf] leading-relaxed line-clamp-3">
                                  {sec.contentJson?.description ||
                                    "Original fine artworks by Elena Vance. Exploring the threshold where lapis lazuli glazes, crushed mineral earth, and oceanic silence alter atmospheric presence."}
                                </p>

                                <div className="pt-2 flex flex-wrap items-center gap-3">
                                  <button className="bg-[#d1a86e] text-[#0d0e12] px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider shadow-md">
                                    {sec.contentJson?.ctaText || "Explore Catalog"}
                                  </button>
                                  <button className="border border-[#262833] text-white px-4 py-2.5 rounded-full text-[11px] font-medium uppercase tracking-wider bg-[#18191e]">
                                    Spatial AR
                                  </button>
                                </div>
                              </div>

                              <div className="md:col-span-5 flex justify-center">
                                <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden border border-[#262833] bg-[#14151a] shadow-xl">
                                  {heroImage && (
                                    <Image
                                      src={heroImage}
                                      alt={sec.title}
                                      fill
                                      sizes="(max-width: 768px) 100vw, 300px"
                                      className="object-cover"
                                    />
                                  )}
                                  <div className="absolute bottom-2 left-2 right-2 p-2 bg-black/70 backdrop-blur-md rounded border border-white/10 flex items-center justify-between">
                                    <span className="text-[11px] font-serif text-white truncate">
                                      {heroArtwork?.title || "Hero Piece"}
                                    </span>
                                    <span className="text-[9px] uppercase tracking-wider text-[#d1a86e]">
                                      Try AR
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // RENDER FEATURED ARTWORKS
                      if (sec.sectionKey === "featured_artworks") {
                        return (
                          <div key={sec.id} className="px-6 max-w-4xl mx-auto space-y-6">
                            <div className="flex items-end justify-between border-b border-[#1c1d25] pb-4">
                              <div>
                                <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                                  {sec.subtitle || "Curated Catalogue"}
                                </span>
                                <h3 className="font-serif text-2xl md:text-3xl text-white mt-0.5">
                                  {sec.title || "Selected Works"}
                                </h3>
                              </div>
                              <span className="text-[11px] uppercase tracking-wider text-zinc-400">
                                View All ({artworks.length})
                              </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                              {artworks.slice(0, 3).map((art) => (
                                <div
                                  key={art.id}
                                  className="group bg-[#14151a] rounded-lg border border-[#262833] overflow-hidden p-2.5 space-y-2"
                                >
                                  <div className="relative aspect-[4/3] rounded overflow-hidden bg-black/40">
                                    <Image
                                      src={art.coverImageUrl}
                                      alt={art.title}
                                      fill
                                      sizes="200px"
                                      className="object-cover"
                                    />
                                    <span className="absolute top-1.5 left-1.5 text-[8px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/90 text-emerald-300 border border-emerald-800/80">
                                      {art.status}
                                    </span>
                                  </div>
                                  <div className="flex items-baseline justify-between text-xs">
                                    <span className="font-serif text-white font-medium truncate">
                                      {art.title}
                                    </span>
                                    <span className="text-[#d1a86e] font-mono text-[11px]">
                                      {formatCurrency(art.price, art.currency)}
                                    </span>
                                  </div>
                                  <div className="text-[10px] text-zinc-500">
                                    {formatDimensions(art.widthCm, art.heightCm)}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      }

                      // RENDER LATEST COLLECTION
                      if (sec.sectionKey === "latest_collection") {
                        const colImage =
                          sec.contentJson?.imageUrl || featuredCollection?.coverImageUrl;
                        return (
                          <div
                            key={sec.id}
                            className="bg-[#101116] border-y border-[#1c1d25] py-12 px-6"
                          >
                            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                              <div className="md:col-span-5 space-y-3">
                                <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                                  {sec.subtitle || "Featured Series"}
                                </span>
                                <h3 className="font-serif text-2xl md:text-3xl text-white">
                                  {sec.title || featuredCollection?.title || "Series Spotlight"}
                                </h3>
                                <p className="text-xs text-[#a6aabf] leading-relaxed line-clamp-3">
                                  {sec.contentJson?.description ||
                                    featuredCollection?.curatorialStatement ||
                                    "A curated exploration of silence, texture, and light."}
                                </p>
                                <div className="pt-1">
                                  <span className="text-xs uppercase tracking-wider text-[#d1a86e] font-semibold inline-flex items-center gap-1.5">
                                    <span>Explore Collection</span>
                                    <ArrowRight className="w-3.5 h-3.5" />
                                  </span>
                                </div>
                              </div>

                              <div className="md:col-span-7">
                                <div className="relative aspect-[16/10] rounded-lg overflow-hidden border border-[#262833] shadow-xl">
                                  {colImage && (
                                    <Image
                                      src={colImage}
                                      alt={sec.title}
                                      fill
                                      sizes="400px"
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // RENDER WEBAR EXPERIENCE
                      if (sec.sectionKey === "ar_experience") {
                        const arImage = sec.contentJson?.imageUrl;
                        return (
                          <div key={sec.id} className="px-6 max-w-4xl mx-auto">
                            <div className="rounded-2xl bg-gradient-to-br from-[#14151a] to-[#181920] border border-[#262833] p-8 shadow-xl relative overflow-hidden">
                              <div className="max-w-xl space-y-3 relative z-10">
                                <div className="inline-flex items-center gap-1.5 text-[10px] tracking-widest text-[#d1a86e] uppercase font-semibold">
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span>{sec.subtitle || "Spatial WebAR Experience"}</span>
                                </div>
                                <h3 className="font-serif text-2xl md:text-3xl text-white">
                                  {sec.title || "View Original Works in Your Interior Space"}
                                </h3>
                                <p className="text-xs text-[#a6aabf] leading-relaxed">
                                  {sec.contentJson?.description ||
                                    "Experience any painting calibrated to its exact physical centimeter dimensions on your living room wall."}
                                </p>
                                <div className="pt-2">
                                  <button className="bg-[#d1a86e] text-[#0d0e12] px-5 py-2.5 rounded-full text-[11px] font-semibold uppercase tracking-wider">
                                    {sec.contentJson?.ctaText || "Launch Spatial AR"}
                                  </button>
                                </div>
                              </div>

                              {arImage && (
                                <div className="mt-4 relative aspect-[21/9] rounded-lg overflow-hidden border border-[#262833]">
                                  <Image
                                    src={arImage}
                                    alt="AR showcase"
                                    fill
                                    sizes="500px"
                                    className="object-cover"
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // RENDER ARTIST STORY
                      if (sec.sectionKey === "artist_story") {
                        const storyImage = sec.contentJson?.imageUrl;
                        return (
                          <div
                            key={sec.id}
                            className="px-6 max-w-3xl mx-auto text-center space-y-5"
                          >
                            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                              {sec.subtitle || "Studio Monologue"}
                            </span>
                            <blockquote className="font-serif text-xl md:text-2xl text-white font-light italic leading-snug">
                              &ldquo;
                              {sec.contentJson?.quote ||
                                "A painting is not merely an image hanging upon a partition; it is an alteration of the atmospheric silence within a room."}
                              &rdquo;
                            </blockquote>

                            {storyImage && (
                              <div className="relative aspect-[16/9] max-w-md mx-auto rounded-lg overflow-hidden border border-[#262833]">
                                <Image
                                  src={storyImage}
                                  alt="Artist Studio"
                                  fill
                                  sizes="400px"
                                  className="object-cover"
                                />
                              </div>
                            )}

                            <p className="text-xs text-[#a6aabf] max-w-lg mx-auto leading-relaxed">
                              {sec.contentJson?.description ||
                                "Elena Vance creates works reflecting mineral materiality and oceanic stillness between Paris and Brittany."}
                            </p>
                          </div>
                        );
                      }

                      // RENDER CURRENT EXHIBITION
                      if (sec.sectionKey === "featured_exhibition") {
                        const exhImage =
                          sec.contentJson?.imageUrl || currentExhibition?.coverImageUrl;
                        return (
                          <div key={sec.id} className="px-6 max-w-4xl mx-auto">
                            <div className="border-t border-[#1c1d25] pt-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                              <div className="md:col-span-7">
                                <div className="relative aspect-[16/9] rounded-lg overflow-hidden border border-[#262833]">
                                  {exhImage && (
                                    <Image
                                      src={exhImage}
                                      alt={sec.title}
                                      fill
                                      sizes="400px"
                                      className="object-cover"
                                    />
                                  )}
                                </div>
                              </div>
                              <div className="md:col-span-5 space-y-2.5">
                                <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                                  {sec.subtitle || "Current Exhibition"}
                                </span>
                                <h3 className="font-serif text-2xl text-white">
                                  {sec.title || currentExhibition?.title || "Exhibition"}
                                </h3>
                                <div className="flex items-center gap-1.5 text-xs text-zinc-300">
                                  <MapPin className="w-3 h-3 text-[#d1a86e]" />
                                  <span>{currentExhibition?.location || "Paris, France"}</span>
                                </div>
                                <p className="text-xs text-[#a6aabf] line-clamp-3">
                                  {sec.contentJson?.description ||
                                    currentExhibition?.description ||
                                    "A presentation of recent works."}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      // RENDER CONTACT CTA
                      if (sec.sectionKey === "contact_cta") {
                        return (
                          <div key={sec.id} className="px-6 max-w-3xl mx-auto text-center">
                            <div className="rounded-2xl border border-[#262833] bg-[#14151a] p-8 space-y-3">
                              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
                                {sec.subtitle || "Inquiries & Acquisitions"}
                              </span>
                              <h3 className="font-serif text-2xl text-white">
                                {sec.title || "Direct Studio Acquisitions"}
                              </h3>
                              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                                Contact the artist directly for private acquisitions, commissions, and shipping worldwide.
                              </p>
                              <div className="pt-2">
                                <button className="bg-[#d1a86e] text-[#0d0e12] px-6 py-2.5 rounded-full text-xs font-semibold uppercase tracking-wider">
                                  {sec.contentJson?.ctaText || "Contact Curator"}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      }

                      return null;
                    })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. MEDIA ASSET PICKER MODAL */}
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
                  Select any verified image hosted on ImageKit / CDN for this homepage section.
                </p>
              </div>
              <button
                onClick={() => setIsMediaModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
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
                      className="group relative rounded-xl overflow-hidden border border-[#262833] bg-[#101115] hover:border-[#d1a86e] text-left transition-all p-2 flex flex-col space-y-2 hover:shadow-lg"
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
