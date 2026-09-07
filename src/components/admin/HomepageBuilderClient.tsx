"use client";

import React, { useState, useEffect, useRef } from "react";
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
  ExternalLink,
  Compass,
} from "lucide-react";
import { formatCurrency, formatDimensions } from "@/lib/utils";
import { NavbarLayoutModal } from "./studio/NavbarLayoutModal";
import { GalleryPageEditor } from "./studio/GalleryPageEditor";
import { CollectionsPageEditor } from "./studio/CollectionsPageEditor";
import { ExhibitionsPageEditor } from "./studio/ExhibitionsPageEditor";
import { AboutPageEditor } from "./studio/AboutPageEditor";
import { ContactPageEditor } from "./studio/ContactPageEditor";
import { PageLivePreview } from "./studio/PageLivePreview";

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
type ViewMode = "split" | "editor" | "preview";
type DeviceMode = "desktop" | "tablet" | "mobile";

export function HomepageBuilderClient({
  initialSections,
  artworks = [],
  collections = [],
  exhibitions = [],
  initialSiteSettings,
  initialPage = "home",
}: HomepageBuilderClientProps) {
  const [activePage, setActivePage] = useState<ActiveStorefrontPage>(
    initialPage && ["home", "gallery", "collections", "exhibitions", "about", "contact"].includes(initialPage)
      ? initialPage
      : "home"
  );
  const [sections, setSections] = useState<MockHomepageSection[]>(initialSections);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData>(
    initialSiteSettings || DEFAULT_SITE_SETTINGS
  );
  const [isNavbarModalOpen, setIsNavbarModalOpen] = useState(false);

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
    } else if (activeSectionForMedia) {
      updateSectionContent(activeSectionForMedia, "imageUrl", url);
    }
    setIsMediaModalOpen(false);
    setActiveSectionForMedia(null);
  };

  // Direct upload handler
  const handleFileUploadForSection = async (
    targetId: string,
    file: File
  ) => {
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

  const updateSectionContent = (id: string, field: string, val: string) => {
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
        await handleSaveHomepage();
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

  const heroArtwork = artworks[0];
  const featuredCollection = collections[0];
  const currentExhibition = exhibitions[0];

  const filteredMedia = mediaAssets.filter((m) =>
    m.fileName.toLowerCase().includes(mediaSearchQuery.toLowerCase())
  );

  // Dynamic tabs labels synced with navigationItems
  const navItemGallery = siteSettings.navigationItems?.find((i) => i.href.includes("gallery"));
  const navItemCollections = siteSettings.navigationItems?.find((i) => i.href.includes("collection"));
  const navItemExhibitions = siteSettings.navigationItems?.find((i) => i.href.includes("exhibit"));
  const navItemAbout = siteSettings.navigationItems?.find((i) => i.href.includes("about"));
  const navItemContact = siteSettings.navigationItems?.find((i) => i.href.includes("contact"));

  const storefrontNavTabs: Array<{
    key: ActiveStorefrontPage;
    label: string;
    href: string;
  }> = [
    { key: "gallery", label: navItemGallery?.label || "Gallery", href: "/gallery" },
    { key: "collections", label: navItemCollections?.label || "Collections", href: "/collections" },
    { key: "exhibitions", label: navItemExhibitions?.label || "Exhibitions", href: "/exhibitions" },
    { key: "about", label: navItemAbout?.label || "About", href: "/about" },
    { key: "contact", label: navItemContact?.label || "Contact", href: "/contact" },
  ];

  const getPageTitle = () => {
    switch (activePage) {
      case "gallery":
        return "Gallery Studio & Curation";
      case "collections":
        return "Collections Studio";
      case "exhibitions":
        return "Exhibitions Studio";
      case "about":
        return "About & Artist Studio";
      case "contact":
        return "Contact & Liaison Studio";
      default:
        return "Homepage Visual Studio";
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP BUILDER BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#14151a] p-5 rounded-2xl border border-[#262833] shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
              Live Storefront Studio
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-[11px] text-zinc-400 capitalize">
              Editing {activePage} Page
            </span>
          </div>
          <h1 className="font-serif text-2xl md:text-3xl text-white mt-1">
            {getPageTitle()}
          </h1>
        </div>

        {/* View Mode & Device Controls & Storefront Switcher */}
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

          {/* Storefront Page Switcher Navbar */}
          <div className="flex items-center gap-1 p-1 bg-[#1a1c23] border border-[#262833] rounded-xl text-xs">
            <span className="px-2 text-[10px] text-zinc-500 uppercase tracking-widest font-mono hidden xl:inline">
              Storefront:
            </span>

            {/* Home Pill */}
            <div className="flex items-center group relative">
              <button
                type="button"
                onClick={() => setActivePage("home")}
                className={`px-2.5 py-1 rounded-lg text-xs transition-all font-medium ${
                  activePage === "home"
                    ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-sm shadow-[#d1a86e]/30"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                }`}
              >
                Home
              </button>
              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                title="Open live / in new tab"
                className={`p-1 text-zinc-500 hover:text-white transition-opacity ${
                  activePage === "home" ? "opacity-70 hover:opacity-100" : "opacity-0 group-hover:opacity-70"
                }`}
              >
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>

            {/* Other Storefront Nav Pages */}
            {storefrontNavTabs.map((tab) => {
              const isActive = activePage === tab.key;
              return (
                <div key={tab.key} className="flex items-center group relative">
                  <button
                    type="button"
                    onClick={() => setActivePage(tab.key)}
                    className={`px-2.5 py-1 rounded-lg text-xs transition-all font-medium ${
                      isActive
                        ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-sm shadow-[#d1a86e]/30"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-800"
                    }`}
                  >
                    {tab.label}
                  </button>
                  <a
                    href={tab.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Open live ${tab.href} in new tab`}
                    className={`p-1 text-zinc-500 hover:text-white transition-opacity ${
                      isActive ? "opacity-70 hover:opacity-100" : "opacity-0 group-hover:opacity-70"
                    }`}
                  >
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
              );
            })}

            {/* Navbar Layout Manager Button */}
            <button
              type="button"
              onClick={() => setIsNavbarModalOpen(true)}
              className="ml-1 px-2.5 py-1 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center gap-1.5 transition-colors border border-white/5"
              title="Manage Navbar Layout & Navigation Links"
            >
              <Compass className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span className="text-[11px] font-medium hidden md:inline">Navbar Layout</span>
            </button>
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
            <span>
              {isSaving
                ? "Saving..."
                : savedSuccess
                ? "Saved!"
                : activePage === "home"
                ? "Publish Layout"
                : `Publish ${activePage.charAt(0).toUpperCase() + activePage.slice(1)}`}
            </span>
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
        {/* LEFT COLUMN: PAGE EDITORS */}
        {viewMode !== "preview" && (
          <div
            className={`space-y-4 ${
              viewMode === "split" ? "xl:col-span-5" : "w-full max-w-4xl mx-auto"
            }`}
          >
            {/* RENDER HOME PAGE EDITOR (7 EDITORIAL SECTIONS) */}
            {activePage === "home" && (
              <div className="space-y-4">
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
                          <div className="flex flex-col gap-0.5">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSection(idx, "up");
                              }}
                              disabled={idx === 0}
                              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20"
                              title="Move Up"
                            >
                              <MoveUp className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSection(idx, "down");
                              }}
                              disabled={idx === sections.length - 1}
                              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-20"
                              title="Move Down"
                            >
                              <MoveDown className="w-3 h-3" />
                            </button>
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-zinc-500">
                                0{sec.displayOrder}
                              </span>
                              <h3 className="text-sm font-medium text-white">
                                {sec.title || sec.sectionKey}
                              </h3>
                            </div>
                            <span className="text-[11px] text-[#d1a86e] capitalize font-mono">
                              {sec.sectionKey.replace(/_/g, " ")}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleSection(sec.id)}
                            className={`p-1.5 rounded-lg text-xs transition-colors ${
                              sec.isEnabled
                                ? "bg-emerald-950/60 text-emerald-400 border border-emerald-800/50"
                                : "bg-zinc-800 text-zinc-500"
                            }`}
                            title={sec.isEnabled ? "Section Active" : "Section Hidden"}
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedSectionId(isExpanded ? null : sec.id)
                            }
                            className="p-1.5 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section Editor */}
                      {isExpanded && (
                        <div className="p-4 border-t border-[#1f212b] space-y-4 bg-[#101115]/50 rounded-b-2xl">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                                Headline / Title
                              </label>
                              <input
                                type="text"
                                value={sec.title || ""}
                                onChange={(e) =>
                                  updateSectionText(sec.id, "title", e.target.value)
                                }
                                className="w-full bg-[#181920] border border-[#262833] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                                Subtitle / Eyebrow
                              </label>
                              <input
                                type="text"
                                value={sec.subtitle || ""}
                                onChange={(e) =>
                                  updateSectionText(sec.id, "subtitle", e.target.value)
                                }
                                className="w-full bg-[#181920] border border-[#262833] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                              Description / Curatorial Text
                            </label>
                            <textarea
                              rows={2}
                              value={sec.contentJson?.description || ""}
                              onChange={(e) =>
                                updateSectionContent(
                                  sec.id,
                                  "description",
                                  e.target.value
                                )
                              }
                              className="w-full bg-[#181920] border border-[#262833] rounded-lg px-3 py-1.5 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                            />
                          </div>

                          {/* Image controls */}
                          <div className="pt-2 border-t border-[#1f212b] space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">
                                Visual Asset / Image
                              </span>
                              {hasCustomImage && (
                                <button
                                  type="button"
                                  onClick={() => clearSectionImage(sec.id)}
                                  className="text-[10px] text-zinc-500 hover:text-rose-400"
                                >
                                  Reset to Default
                                </button>
                              )}
                            </div>

                            <div className="flex items-center gap-3">
                              {currentImageUrl ? (
                                <div className="relative w-16 h-12 rounded-lg overflow-hidden border border-[#262833] bg-black/40 shrink-0">
                                  <Image
                                    src={currentImageUrl}
                                    alt="Section asset"
                                    fill
                                    sizes="80px"
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-12 rounded-lg border border-[#262833] bg-black/20 flex items-center justify-center text-zinc-600 shrink-0">
                                  <ImageIcon className="w-4 h-4" />
                                </div>
                              )}

                              <div className="flex-1 flex flex-wrap gap-2">
                                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181920] hover:bg-[#22242e] border border-[#262833] text-xs text-zinc-300 hover:text-white transition-colors">
                                  {uploadingForSectionId === sec.id ? (
                                    <RefreshCw className="w-3 h-3 animate-spin text-[#d1a86e]" />
                                  ) : (
                                    <Upload className="w-3 h-3 text-[#d1a86e]" />
                                  )}
                                  <span>
                                    {uploadingForSectionId === sec.id
                                      ? "Uploading..."
                                      : "Upload File"}
                                  </span>
                                  <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp,image/avif"
                                    className="hidden"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        await handleFileUploadForSection(sec.id, file);
                                      }
                                    }}
                                  />
                                </label>

                                <button
                                  type="button"
                                  onClick={() => openMediaPicker(sec.id)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181920] hover:bg-[#22242e] border border-[#262833] text-xs text-zinc-300 hover:text-white transition-colors"
                                >
                                  <Layers className="w-3 h-3 text-[#d1a86e]" />
                                  <span>Media Library</span>
                                </button>
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

            {/* RENDER GALLERY PAGE EDITOR */}
            {activePage === "gallery" && (
              <GalleryPageEditor
                settings={siteSettings}
                onUpdateConfig={updateGalleryConfig}
                artworksCount={artworks.length}
              />
            )}

            {/* RENDER COLLECTIONS PAGE EDITOR */}
            {activePage === "collections" && (
              <CollectionsPageEditor
                settings={siteSettings}
                onUpdateConfig={updateCollectionsConfig}
                collectionsCount={collections.length}
              />
            )}

            {/* RENDER EXHIBITIONS PAGE EDITOR */}
            {activePage === "exhibitions" && (
              <ExhibitionsPageEditor
                settings={siteSettings}
                onUpdateConfig={updateExhibitionsConfig}
                exhibitionsCount={exhibitions.length}
              />
            )}

            {/* RENDER ABOUT PAGE EDITOR */}
            {activePage === "about" && (
              <AboutPageEditor
                settings={siteSettings}
                onUpdateSetting={updateSiteSetting}
                onUpdateAboutConfig={updateAboutConfig}
                onOpenMediaPicker={() => openMediaPicker("about_portrait")}
              />
            )}

            {/* RENDER CONTACT PAGE EDITOR */}
            {activePage === "contact" && (
              <ContactPageEditor
                settings={siteSettings}
                onUpdateSetting={updateSiteSetting}
                onUpdateContactConfig={updateContactConfig}
              />
            )}
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
                  https://latelier-lumineux.art{activePage === "home" ? "" : `/${activePage}`}
                </span>
                <a
                  href={activePage === "home" ? "/" : `/${activePage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 text-zinc-500 hover:text-white transition-colors"
                  title="Open live storefront page in new tab"
                >
                  <ExternalLink className="w-3 h-3 text-[#d1a86e]" />
                </a>
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

            {/* Real-time Multi-Page Simulated Canvas */}
            <PageLivePreview
              activePage={activePage}
              sections={sections}
              siteSettings={siteSettings}
              artworks={artworks}
              collections={collections}
              exhibitions={exhibitions}
              deviceMode={deviceMode}
            />
          </div>
        )}
      </div>

      {/* 3. NAVBAR ARCHITECTURE & LAYOUT MODAL */}
      <NavbarLayoutModal
        isOpen={isNavbarModalOpen}
        onClose={() => setIsNavbarModalOpen(false)}
        siteSettings={siteSettings}
        onUpdateSettings={setSiteSettings}
        onSave={handleSaveSettings}
        isSaving={isSaving}
      />

      {/* 4. MEDIA ASSET PICKER MODAL */}
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
                  Select any verified image hosted on ImageKit / CDN for{" "}
                  {activeSectionForMedia === "about_portrait"
                    ? "the artist studio portrait"
                    : "this editorial section"}
                  .
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
