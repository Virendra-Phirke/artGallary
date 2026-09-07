"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { SiteSettingsData, ThemeSettingsData } from "@/db/repository";
import {
  Check,
  Phone,
  Palette,
  AlertCircle,
  Loader2,
  ExternalLink,
  Compass,
  LayoutGrid,
  BookOpen,
  Scale,
  Sparkles,
  ShieldAlert,
  Plus,
  Trash2,
  MoveUp,
  MoveDown,
  FolderKanban,
  Calendar,
  Home,
  Save,
  ArrowRight,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const ACCENT_HUES = [
  { id: "#d1a86e", name: "Champagne Gold", hex: "#d1a86e" },
  { id: "#c59b63", name: "Florentine Amber", hex: "#c59b63" },
  { id: "#e2c18d", name: "Luminous Ochre", hex: "#e2c18d" },
  { id: "#9fa3b0", name: "Platinum Slate", hex: "#9fa3b0" },
  { id: "#3d5a80", name: "Deep Lapis", hex: "#3d5a80" },
  { id: "#9c6644", name: "Venetian Terracotta", hex: "#9c6644" },
];

const CANVAS_BACKGROUNDS = [
  { id: "#0d0e12", name: "Obsidian Noir (Default)", hex: "#0d0e12" },
  { id: "#000000", name: "Deep Void Pure Black", hex: "#000000" },
  { id: "#14151a", name: "Dark Charcoal Ash", hex: "#14151a" },
];

const normalizeTab = (tab?: string): string => {
  if (!tab) return "landing";
  if (tab === "identity" || tab === "appearance" || tab === "announcement") return "theme";
  if (tab === "ar_defaults" || tab === "maintenance") return "footer";
  return tab;
};

interface SettingsClientProps {
  initialSettings: SiteSettingsData;
  initialTab?: string;
}

export function SettingsClient({ initialSettings, initialTab = "landing" }: SettingsClientProps) {
  const [settings, setSettings] = useState<SiteSettingsData>(initialSettings);
  const [activeTab, setActiveTab] = useState<string>(normalizeTab(initialTab));
  const [theme, setTheme] = useState<ThemeSettingsData>({
    primaryColor: "#d1a86e",
    accentColor: "#e2c18d",
    backgroundColor: "#0d0e12",
    foregroundColor: "#f4f4f6",
    headingFont: "Playfair Display",
    bodyFont: "Plus Jakarta Sans",
    borderRadius: "0.375rem",
    containerWidth: "1440px",
    animationLevel: "cinematic",
  });
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch("/api/admin/theme")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.theme) setTheme(d.theme);
      })
      .catch(() => {});
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!settings.artistName.trim()) newErrors.artistName = "Artist name is required";
    if (!settings.siteTitle.trim()) newErrors.siteTitle = "Site title is required";
    if (!settings.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)) {
      newErrors.contactEmail = "Invalid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSaveStatus("idle");

    try {
      const [resSettings, resTheme] = await Promise.all([
        fetch("/api/admin/settings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(settings),
        }),
        fetch("/api/admin/theme", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(theme),
        }),
      ]);

      if (!resSettings.ok || !resTheme.ok) throw new Error("Save failed");

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err) {
      console.error("Failed to save site settings or theme:", err);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 5000);
    } finally {
      setSaving(false);
    }
  };

  // Helper update functions
  const updateField = <K extends keyof SiteSettingsData>(field: K, value: SiteSettingsData[K]) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field as string];
        return next;
      });
    }
  };

  const updateSocialLink = (key: keyof SiteSettingsData["socialLinks"], value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
  };

  // Navigation Items reorder & add/remove
  const addNavigationItem = () => {
    const newId = `nav-${Date.now()}`;
    const newItem = {
      id: newId,
      label: "New Link",
      href: "/gallery",
      isEnabled: true,
      order: settings.navigationItems.length + 1,
    };
    setSettings((prev) => ({
      ...prev,
      navigationItems: [...prev.navigationItems, newItem],
    }));
  };

  const removeNavigationItem = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      navigationItems: prev.navigationItems.filter((item) => item.id !== id),
    }));
  };

  const updateNavigationItem = (
    id: string,
    updates: Partial<SiteSettingsData["navigationItems"][number]>
  ) => {
    setSettings((prev) => ({
      ...prev,
      navigationItems: prev.navigationItems.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      ),
    }));
  };

  const moveNavigationItem = (index: number, direction: "up" | "down") => {
    const items = [...settings.navigationItems];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const temp = items[index];
    items[index] = items[targetIndex];
    items[targetIndex] = temp;
    setSettings((prev) => ({
      ...prev,
      navigationItems: items.map((item, idx) => ({ ...item, order: idx + 1 })),
    }));
  };

  // Exhibitions list add/remove for About Page CV
  const addExhibitionCv = () => {
    const newEx = {
      year: new Date().getFullYear().toString(),
      title: "New Exhibition Title",
      location: "Gallery Name, City",
    };
    setSettings((prev) => ({
      ...prev,
      aboutPageConfig: {
        ...prev.aboutPageConfig,
        exhibitions: [...(prev.aboutPageConfig.exhibitions || []), newEx],
      },
    }));
  };

  const removeExhibitionCv = (index: number) => {
    setSettings((prev) => ({
      ...prev,
      aboutPageConfig: {
        ...prev.aboutPageConfig,
        exhibitions: (prev.aboutPageConfig.exhibitions || []).filter((_, i) => i !== index),
      },
    }));
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header Plaque */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Storefront Curation &amp; Management Hub
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Storefront &amp; Settings</h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Manage themes, curated text, and layout parameters across all customer-facing storefront pages. Visual UI modifications are dedicated to the Landing Page.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            asChild
            variant="outline"
            size="sm"
            className="border-[#262833] text-zinc-300 hover:text-white text-xs gap-1.5"
          >
            <Link href="/" target="_blank">
              <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>View Public Site</span>
            </Link>
          </Button>

          <Button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-[#d1a86e]/10 gap-2"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveStatus === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{saving ? "Saving..." : saveStatus === "success" ? "Saved" : "Save All Changes"}</span>
          </Button>
        </div>
      </div>

      {/* Save Status Toast */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-950/60 border border-emerald-800/50 rounded-xl text-emerald-300 text-xs font-medium animate-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>All storefront configurations, theme tokens, and system settings successfully saved to database.</span>
        </div>
      )}
      {saveStatus === "error" && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-950/60 border border-red-800/50 rounded-xl text-red-300 text-xs font-medium animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4" />
          <span>Failed to save settings. Please inspect network or database connectivity.</span>
        </div>
      )}

      {/* Main Multi-Tab Storefront CMS */}
      <form onSubmit={handleSave}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full flex-wrap justify-start gap-1 p-1.5 bg-[#14151a] border border-[#262833] rounded-xl h-auto">
            <TabsTrigger
              value="landing"
              className="gap-2 text-xs py-2 px-3.5 data-[state=active]:bg-[#d1a86e] data-[state=active]:text-[#0d0e12] data-[state=active]:font-semibold transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Landing Page</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded uppercase tracking-wider bg-black/20 text-[#d1a86e] data-[state=active]:text-[#0d0e12] font-mono">
                UI Studio
              </span>
            </TabsTrigger>

            <TabsTrigger
              value="gallery"
              className="gap-2 text-xs py-2 px-3.5 data-[state=active]:bg-[#d1a86e] data-[state=active]:text-[#0d0e12] data-[state=active]:font-semibold transition-all"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Gallery</span>
            </TabsTrigger>

            <TabsTrigger
              value="collections"
              className="gap-2 text-xs py-2 px-3.5 data-[state=active]:bg-[#d1a86e] data-[state=active]:text-[#0d0e12] data-[state=active]:font-semibold transition-all"
            >
              <FolderKanban className="w-3.5 h-3.5" />
              <span>Collections</span>
            </TabsTrigger>

            <TabsTrigger
              value="exhibitions"
              className="gap-2 text-xs py-2 px-3.5 data-[state=active]:bg-[#d1a86e] data-[state=active]:text-[#0d0e12] data-[state=active]:font-semibold transition-all"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Exhibitions</span>
            </TabsTrigger>

            <TabsTrigger
              value="about"
              className="gap-2 text-xs py-2 px-3.5 data-[state=active]:bg-[#d1a86e] data-[state=active]:text-[#0d0e12] data-[state=active]:font-semibold transition-all"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>About</span>
            </TabsTrigger>

            <TabsTrigger
              value="contact"
              className="gap-2 text-xs py-2 px-3.5 data-[state=active]:bg-[#d1a86e] data-[state=active]:text-[#0d0e12] data-[state=active]:font-semibold transition-all"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Contact</span>
            </TabsTrigger>

            <TabsTrigger
              value="theme"
              className="gap-2 text-xs py-2 px-3.5 data-[state=active]:bg-[#d1a86e] data-[state=active]:text-[#0d0e12] data-[state=active]:font-semibold transition-all"
            >
              <Palette className="w-3.5 h-3.5" />
              <span>Theme &amp; Brand</span>
            </TabsTrigger>

            <TabsTrigger
              value="navigation"
              className="gap-2 text-xs py-2 px-3.5 data-[state=active]:bg-[#d1a86e] data-[state=active]:text-[#0d0e12] data-[state=active]:font-semibold transition-all"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Navigation</span>
            </TabsTrigger>

            <TabsTrigger
              value="footer"
              className="gap-2 text-xs py-2 px-3.5 data-[state=active]:bg-[#d1a86e] data-[state=active]:text-[#0d0e12] data-[state=active]:font-semibold transition-all"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Footer &amp; Policies</span>
            </TabsTrigger>
          </TabsList>

          {/* ============================================================ */}
          {/* TAB 1: LANDING PAGE (WITH UI MODIFICATION STUDIO)           */}
          {/* ============================================================ */}
          <TabsContent value="landing" className="pt-4 space-y-6">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase tracking-widest text-[#d1a86e] font-semibold">
                      Signature Storefront Entrance
                    </span>
                    <Badge className="bg-[#d1a86e]/15 text-[#d1a86e] border-[#d1a86e]/30 text-[10px]">
                      UI Modification Studio Active
                    </Badge>
                  </div>
                  <h3 className="font-serif text-xl text-white mt-1">Customer Landing Page Studio</h3>
                  <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                    The public storefront landing page features interactive split-screen UI modifications. Reorder sections, select layout presets (Masonry, Minimal Grid, Carousel), and test responsive viewports in real time.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Button
                    asChild
                    className="bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs gap-2 shadow-lg shadow-[#d1a86e]/20"
                  >
                    <Link href="/admin/homepage">
                      <LayoutGrid className="w-4 h-4" />
                      <span>Launch Visual Homepage Builder</span>
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="border-[#262833] text-zinc-300 hover:text-white text-xs gap-1.5">
                    <Link href="/" target="_blank">
                      <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>Live Preview</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Visual Studio Action Banner */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-[#1a1c23] via-[#16171d] to-[#121318] border border-[#d1a86e]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-white text-sm font-medium">
                    <Sparkles className="w-4 h-4 text-[#d1a86e]" />
                    <span>Interactive UI Modifications Dedicated to Landing Page</span>
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
                    Drag and reorder all 7 modular sections, toggle layouts, and preview live on mobile, tablet, and desktop viewports without writing any code.
                  </p>
                </div>
                <Button asChild variant="outline" size="sm" className="border-[#d1a86e]/50 text-[#d1a86e] hover:bg-[#d1a86e]/10 text-xs shrink-0 gap-1.5">
                  <Link href="/admin/homepage">
                    <span>Open Visual Split-Screen Studio</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </div>

              <Separator />

              {/* 7 Modular Sections Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                    Customer Landing Page Modular Sections
                  </span>
                  <span className="text-[11px] text-zinc-500">7 Interactive Sections</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[
                    { no: "01", name: "Hero Stage", desc: "Hero artwork canvas, luminous ambient light bloom, curatorial badge, and WebAR trigger CTA." },
                    { no: "02", name: "Featured Artworks", desc: "Curated highlight canvases with responsive layouts (Masonry, Minimal Grid, 3-Card Carousel, Editorial)." },
                    { no: "03", name: "Latest Curated Series", desc: "Featured thematic collection spotlight with curatorial narrative and series link." },
                    { no: "04", name: "Artist Monologue & Story", desc: "Studio monologue, authentic portrait, and philosophical statement blockquote." },
                    { no: "05", name: "Spatial WebAR Experience", desc: "Interactive room preview inviting collectors to project true-scale art on physical walls." },
                    { no: "06", name: "Museum Exhibition Feature", desc: "Active museum showcase, gallery biennale dates, and institutional coordinates." },
                    { no: "07", name: "Acquisitions Liaison Desk", desc: "Direct correspondence invitation, private appointment prompt, and inquiry dispatch." },
                  ].map((s) => (
                    <div
                      key={s.name}
                      className="p-4 rounded-xl bg-[#181920] border border-[#262833] space-y-1.5 hover:border-[#d1a86e]/30 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-serif text-white font-medium">{s.name}</span>
                        <span className="text-[10px] font-mono text-[#d1a86e] font-semibold">{s.no}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-relaxed">{s.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB 2: GALLERY CATALOGUE                                     */}
          {/* ============================================================ */}
          <TabsContent value="gallery" className="pt-4">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg text-white mb-1">Gallery Catalogue CMS</h3>
                  <p className="text-xs text-zinc-400">
                    Control the public /gallery hero introduction, curatorial statement, and visitor filter controls.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs gap-1.5">
                    <Link href="/gallery" target="_blank">
                      <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>View Public Gallery</span>
                    </Link>
                  </Button>
                </div>
              </div>
              <Separator />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Catalogue Headline
                    </label>
                    <Input
                      type="text"
                      value={settings.galleryPageConfig.title || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          galleryPageConfig: { ...prev.galleryPageConfig, title: e.target.value },
                        }))
                      }
                      placeholder="e.g., Complete Artworks Catalogue"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Eyebrow Badge
                    </label>
                    <Input
                      type="text"
                      value={settings.galleryPageConfig.subtitle || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          galleryPageConfig: { ...prev.galleryPageConfig, subtitle: e.target.value },
                        }))
                      }
                      placeholder="e.g., Permanent Collection & Available Works"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Catalogue Curatorial Description
                  </label>
                  <Textarea
                    rows={3}
                    value={settings.galleryPageConfig.description || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        galleryPageConfig: { ...prev.galleryPageConfig, description: e.target.value },
                      }))
                    }
                    placeholder="Curatorial introduction displayed above the gallery masonry grid..."
                  />
                </div>

                {/* Filter Checkboxes */}
                <div className="p-4 bg-[#1a1c23] border border-[#262833] rounded-xl space-y-2">
                  <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold block">
                    Enabled Catalogue Filters for Public Visitors
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 text-xs">
                    {[
                      { id: "collection", label: "Curated Series" },
                      { id: "medium", label: "Medium & Pigments" },
                      { id: "price", label: "Price Range" },
                      { id: "year", label: "Creation Year" },
                      { id: "availability", label: "Availability Status" },
                    ].map((f) => (
                      <label key={f.id} className="flex items-center gap-2 text-zinc-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(settings.galleryPageConfig.enabledFilters?.[f.id as keyof typeof settings.galleryPageConfig.enabledFilters])}
                          onChange={(e) =>
                            setSettings((prev) => ({
                              ...prev,
                              galleryPageConfig: {
                                ...prev.galleryPageConfig,
                                enabledFilters: {
                                  ...prev.galleryPageConfig.enabledFilters,
                                  [f.id]: e.target.checked,
                                },
                              },
                            }))
                          }
                          className="rounded accent-[#d1a86e]"
                        />
                        <span>{f.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB 3: CURATED SERIES & COLLECTIONS PAGE                     */}
          {/* ============================================================ */}
          <TabsContent value="collections" className="pt-4">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg text-white mb-1">Curated Series &amp; Collections Page CMS</h3>
                  <p className="text-xs text-zinc-400">
                    Control the public /collections directory header, eyebrow category, and curatorial lead paragraph.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="border-[#d1a86e]/40 text-[#d1a86e] hover:bg-[#d1a86e]/10 text-xs gap-1.5">
                    <Link href="/admin/collections">
                      <FolderKanban className="w-3.5 h-3.5" />
                      <span>Manage Series Records</span>
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs gap-1.5">
                    <Link href="/collections" target="_blank">
                      <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>View Public Collections</span>
                    </Link>
                  </Button>
                </div>
              </div>
              <Separator />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Page Headline
                    </label>
                    <Input
                      type="text"
                      value={settings.collectionsPageConfig?.title || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          collectionsPageConfig: { ...prev.collectionsPageConfig, title: e.target.value },
                        }))
                      }
                      placeholder="e.g., Curated Series"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Eyebrow Badge
                    </label>
                    <Input
                      type="text"
                      value={settings.collectionsPageConfig?.eyebrow || settings.collectionsPageConfig?.subtitle || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          collectionsPageConfig: {
                            ...prev.collectionsPageConfig,
                            eyebrow: e.target.value,
                            subtitle: e.target.value,
                          },
                        }))
                      }
                      placeholder="e.g., Thematic Bodies of Work"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Curatorial Lead Description
                  </label>
                  <Textarea
                    rows={4}
                    value={settings.collectionsPageConfig?.description || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        collectionsPageConfig: { ...prev.collectionsPageConfig, description: e.target.value },
                      }))
                    }
                    placeholder="Describe the thematic scope and materials connecting the artist's series..."
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB 4: MUSEUM EXHIBITIONS PAGE                               */}
          {/* ============================================================ */}
          <TabsContent value="exhibitions" className="pt-4">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg text-white mb-1">Museum Exhibitions &amp; Retrospectives Page CMS</h3>
                  <p className="text-xs text-zinc-400">
                    Control the public /exhibitions directory header, historical record title, and archival summary.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button asChild variant="outline" size="sm" className="border-[#d1a86e]/40 text-[#d1a86e] hover:bg-[#d1a86e]/10 text-xs gap-1.5">
                    <Link href="/admin/exhibitions">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Manage Exhibitions Records</span>
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs gap-1.5">
                    <Link href="/exhibitions" target="_blank">
                      <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>View Public Exhibitions</span>
                    </Link>
                  </Button>
                </div>
              </div>
              <Separator />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Page Headline
                    </label>
                    <Input
                      type="text"
                      value={settings.exhibitionsPageConfig?.title || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          exhibitionsPageConfig: { ...prev.exhibitionsPageConfig, title: e.target.value },
                        }))
                      }
                      placeholder="e.g., Exhibitions"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Eyebrow Badge
                    </label>
                    <Input
                      type="text"
                      value={settings.exhibitionsPageConfig?.eyebrow || settings.exhibitionsPageConfig?.subtitle || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          exhibitionsPageConfig: {
                            ...prev.exhibitionsPageConfig,
                            eyebrow: e.target.value,
                            subtitle: e.target.value,
                          },
                        }))
                      }
                      placeholder="e.g., Public & Museum History"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Archival Record Description
                  </label>
                  <Textarea
                    rows={4}
                    value={settings.exhibitionsPageConfig?.description || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        exhibitionsPageConfig: { ...prev.exhibitionsPageConfig, description: e.target.value },
                      }))
                    }
                    placeholder="Chronological narrative of solo museum exhibitions, biennials, and institutional showcases..."
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB 5: ABOUT & ARTIST CV                                     */}
          {/* ============================================================ */}
          <TabsContent value="about" className="pt-4">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg text-white mb-1">About Page &amp; Curatorial CV</h3>
                  <p className="text-xs text-zinc-400">
                    Manage artist biography, philosophy, studio portrait URL, and museum exhibition history.
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs gap-1.5">
                  <Link href="/about" target="_blank">
                    <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
                    <span>View Public About</span>
                  </Link>
                </Button>
              </div>
              <Separator />

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Intro Plaque Eyebrow
                    </label>
                    <Input
                      type="text"
                      value={settings.aboutPageConfig.intro || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          aboutPageConfig: { ...prev.aboutPageConfig, intro: e.target.value },
                        }))
                      }
                      placeholder="e.g., Provenance & Philosophy"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Artist Studio Portrait Image URL
                    </label>
                    <Input
                      type="text"
                      value={settings.aboutPageConfig.artistImageUrl || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          aboutPageConfig: { ...prev.aboutPageConfig, artistImageUrl: e.target.value },
                        }))
                      }
                      placeholder="https://..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Artist Biography
                  </label>
                  <Textarea
                    rows={4}
                    value={settings.aboutPageConfig.bio || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        aboutPageConfig: { ...prev.aboutPageConfig, bio: e.target.value },
                      }))
                    }
                    placeholder="Comprehensive biography chronicling early origins, atelier evolution, and international acclaim..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Studio Philosophy
                  </label>
                  <Textarea
                    rows={3}
                    value={settings.aboutPageConfig.philosophy || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        aboutPageConfig: { ...prev.aboutPageConfig, philosophy: e.target.value },
                      }))
                    }
                    placeholder="Curatorial statement regarding artistic method, raw materials, and aesthetic intent..."
                  />
                </div>

                {/* Exhibitions CV List */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-wider text-zinc-400 font-semibold">
                      Museum &amp; Gallery Exhibitions CV
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addExhibitionCv}
                      className="gap-1.5 border-[#262833] text-zinc-300 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>Add Exhibition</span>
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {(settings.aboutPageConfig.exhibitions || []).map((ex, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-[#1a1c23] border border-[#262833] rounded-xl grid grid-cols-1 sm:grid-cols-12 gap-2 items-center"
                      >
                        <Input
                          type="text"
                          value={ex.year}
                          onChange={(e) => {
                            const updated = [...(settings.aboutPageConfig.exhibitions || [])];
                            updated[idx].year = e.target.value;
                            setSettings((prev) => ({
                              ...prev,
                              aboutPageConfig: { ...prev.aboutPageConfig, exhibitions: updated },
                            }));
                          }}
                          placeholder="Year"
                          className="sm:col-span-2 h-8 text-xs bg-[#14151a]"
                        />
                        <Input
                          type="text"
                          value={ex.title}
                          onChange={(e) => {
                            const updated = [...(settings.aboutPageConfig.exhibitions || [])];
                            updated[idx].title = e.target.value;
                            setSettings((prev) => ({
                              ...prev,
                              aboutPageConfig: { ...prev.aboutPageConfig, exhibitions: updated },
                            }));
                          }}
                          placeholder="Exhibition Title"
                          className="sm:col-span-5 h-8 text-xs bg-[#14151a]"
                        />
                        <Input
                          type="text"
                          value={ex.location}
                          onChange={(e) => {
                            const updated = [...(settings.aboutPageConfig.exhibitions || [])];
                            updated[idx].location = e.target.value;
                            setSettings((prev) => ({
                              ...prev,
                              aboutPageConfig: { ...prev.aboutPageConfig, exhibitions: updated },
                            }));
                          }}
                          placeholder="Institution, City"
                          className="sm:col-span-4 h-8 text-xs bg-[#14151a]"
                        />
                        <button
                          type="button"
                          onClick={() => removeExhibitionCv(idx)}
                          className="sm:col-span-1 text-zinc-500 hover:text-red-400 flex justify-center"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB 6: CONTACT & LIAISON DESK                                */}
          {/* ============================================================ */}
          <TabsContent value="contact" className="pt-4">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-lg text-white mb-1">Contact Desk &amp; Inquiries Liaison</h3>
                  <p className="text-xs text-zinc-400">
                    Studio correspondence email, atelier address, desk phone, and acquisition instructions.
                  </p>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-zinc-400 hover:text-white text-xs gap-1.5">
                  <Link href="/contact" target="_blank">
                    <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
                    <span>View Public Contact</span>
                  </Link>
                </Button>
              </div>
              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Curatorial Inquiries Email <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateField("contactEmail", e.target.value)}
                  />
                  {errors.contactEmail && <span className="text-[10px] text-red-400">{errors.contactEmail}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Studio Desk Phone
                  </label>
                  <Input
                    type="text"
                    value={settings.phone || ""}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+33 (0) 1 42 68 00 00"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Direct WhatsApp Contact Link
                  </label>
                  <Input
                    type="text"
                    value={settings.whatsapp || ""}
                    onChange={(e) => updateField("whatsapp", e.target.value)}
                    placeholder="+33 6 12 34 56 78"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Opening Hours (By Appointment)
                  </label>
                  <Input
                    type="text"
                    value={settings.businessHours || ""}
                    onChange={(e) => updateField("businessHours", e.target.value)}
                    placeholder="Tuesday – Saturday, 11:00 – 19:00"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Atelier Address
                </label>
                <Input
                  type="text"
                  value={settings.address || ""}
                  onChange={(e) => updateField("address", e.target.value)}
                  placeholder="7 Place Vendôme, 75001 Paris, France"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Collector Submission Success Confirmation Message
                </label>
                <Textarea
                  rows={2}
                  value={settings.contactPageConfig.successMessage || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      contactPageConfig: { ...prev.contactPageConfig, successMessage: e.target.value },
                    }))
                  }
                  placeholder="Thank you. Your acquisition inquiry has been received by our curatorial liaisons."
                />
              </div>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB 7: THEME & BRAND IDENTITY (UNIFIED ADMIN THEME CONTROLS) */}
          {/* ============================================================ */}
          <TabsContent value="theme" className="pt-4 space-y-6">
            {/* Part A: Brand Identity */}
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Gallery Brand &amp; Artist Identity</h3>
                <p className="text-xs text-zinc-400">
                  Global names, logotypes, and artistic credentials displayed across the public storefront.
                </p>
              </div>
              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Gallery / Studio Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => updateField("siteTitle", e.target.value)}
                  />
                  {errors.siteTitle && <span className="text-[10px] text-red-400">{errors.siteTitle}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Artist Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={settings.artistName}
                    onChange={(e) => updateField("artistName", e.target.value)}
                  />
                  {errors.artistName && <span className="text-[10px] text-red-400">{errors.artistName}</span>}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Short Brand Monogram
                  </label>
                  <Input
                    type="text"
                    value={settings.shortBrandName || ""}
                    onChange={(e) => updateField("shortBrandName", e.target.value)}
                    placeholder="e.g., L'Atelier"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Tagline
                  </label>
                  <Input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => updateField("tagline", e.target.value)}
                    placeholder="Contemporary Pigment Master & Spatial Sculptor"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Custom Logo Image URL (Optional)
                  </label>
                  <Input
                    type="text"
                    value={settings.logoUrl || ""}
                    onChange={(e) => updateField("logoUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Favicon URL (Optional)
                  </label>
                  <Input
                    type="text"
                    value={settings.faviconUrl || ""}
                    onChange={(e) => updateField("faviconUrl", e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Studio Statement
                </label>
                <Textarea
                  rows={3}
                  value={settings.statement || ""}
                  onChange={(e) => updateField("statement", e.target.value)}
                  placeholder="Concise artistic declaration displayed in gallery catalogues and about introductions..."
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Copyright Notice
                </label>
                <Input
                  type="text"
                  value={settings.copyrightText || ""}
                  onChange={(e) => updateField("copyrightText", e.target.value)}
                  placeholder="All rights reserved. Studio of Elena Rostova."
                />
              </div>
            </Card>

            {/* Part B: Museum Theme Color Tokens */}
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Visual Theme Tokens &amp; Color Palette</h3>
                <p className="text-xs text-zinc-400">
                  Configure verified museum accent tokens and dark canvas depths for the public storefront.
                </p>
              </div>
              <Separator />

              {/* Accent Color Palette */}
              <div className="space-y-3">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Curated Museum Accent Hues
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {ACCENT_HUES.map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setTheme((prev) => ({ ...prev, primaryColor: c.id, accentColor: c.hex }))}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        theme.primaryColor === c.id
                          ? "bg-[#1a1c23] border-[#d1a86e] shadow-lg ring-1 ring-[#d1a86e]/30"
                          : "bg-[#14151a] border-[#262833] hover:border-zinc-600"
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: c.hex }}
                      />
                      <span className="text-xs text-white font-medium truncate">{c.name}</span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <span className="text-xs text-zinc-400">Custom Accent Hex:</span>
                  <Input
                    type="text"
                    value={theme.primaryColor}
                    onChange={(e) => setTheme((prev) => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-32 h-8 text-xs font-mono bg-[#1a1c23]"
                  />
                  <div
                    className="w-6 h-6 rounded border border-white/20"
                    style={{ backgroundColor: theme.primaryColor }}
                  />
                </div>
              </div>

              {/* Canvas Backgrounds */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Dark Canvas Background Depth
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {CANVAS_BACKGROUNDS.map((bg) => (
                    <button
                      key={bg.id}
                      type="button"
                      onClick={() => setTheme((prev) => ({ ...prev, backgroundColor: bg.id }))}
                      className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${
                        theme.backgroundColor === bg.id
                          ? "bg-[#1a1c23] border-[#d1a86e] shadow-lg ring-1 ring-[#d1a86e]/30"
                          : "bg-[#14151a] border-[#262833] hover:border-zinc-600"
                      }`}
                    >
                      <div
                        className="w-5 h-5 rounded-full border border-white/20 shrink-0"
                        style={{ backgroundColor: bg.hex }}
                      />
                      <span className="text-xs text-white font-medium truncate">{bg.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography Hierarchy */}
              <div className="space-y-3 pt-2">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Typography Hierarchy
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="block text-[11px] text-zinc-500 mb-1">Editorial Heading Serif</span>
                    <select
                      value={theme.headingFont}
                      onChange={(e) => setTheme((prev) => ({ ...prev, headingFont: e.target.value }))}
                      className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none cursor-pointer"
                    >
                      <option value="Playfair Display">Playfair Display (Default Luxury Serif)</option>
                      <option value="Cormorant Garamond">Cormorant Garamond (Classical Venetian)</option>
                      <option value="Cinzel">Cinzel (Lapidary Inscriptional)</option>
                      <option value="Bodoni Moda">Bodoni Moda (High Contrast Haute Couture)</option>
                      <option value="Spectral">Spectral (Refined Editorial)</option>
                    </select>
                  </div>

                  <div>
                    <span className="block text-[11px] text-zinc-500 mb-1">Body Sans-Serif</span>
                    <select
                      value={theme.bodyFont}
                      onChange={(e) => setTheme((prev) => ({ ...prev, bodyFont: e.target.value }))}
                      className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none cursor-pointer"
                    >
                      <option value="Plus Jakarta Sans">Plus Jakarta Sans (Contemporary Clean)</option>
                      <option value="Inter">Inter (High-Legibility Neutral)</option>
                      <option value="Roboto">Roboto (Technical Modern)</option>
                      <option value="Outfit">Outfit (Geometric Minimalist)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Corner Radius & Animation Intensity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Corner Radius Preset
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: "0px", label: "Sharp" },
                      { id: "0.375rem", label: "6px" },
                      { id: "0.75rem", label: "12px" },
                      { id: "1.25rem", label: "20px" },
                    ].map((r) => (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setTheme((prev) => ({ ...prev, borderRadius: r.id }))}
                        className={`p-2 rounded-lg border text-xs text-center transition-all ${
                          theme.borderRadius === r.id
                            ? "bg-[#1a1c23] border-[#d1a86e] text-white font-semibold"
                            : "bg-[#14151a] border-[#262833] text-zinc-400 hover:text-zinc-200"
                        }`}
                      >
                        {r.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Animation Intensity
                  </label>
                  <select
                    value={theme.animationLevel}
                    onChange={(e) => setTheme((prev) => ({ ...prev, animationLevel: e.target.value as any }))}
                    className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                  >
                    <option value="minimal">Minimal (Accessible &amp; Static)</option>
                    <option value="standard">Standard (Subtle Fades &amp; Hovers)</option>
                    <option value="cinematic">Cinematic (Editorial Parallax &amp; Light Bloom)</option>
                  </select>
                </div>
              </div>
            </Card>

            {/* Part C: Top Announcement Ribbon */}
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-white mb-1">Top Announcement Banner</h3>
                  <p className="text-xs text-zinc-400">
                    Display global exhibition notices, retrospective alerts, or acquisitions updates above the header.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-300">Enable Bar:</span>
                  <input
                    type="checkbox"
                    checked={settings.announcementBar.isEnabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        announcementBar: { ...prev.announcementBar, isEnabled: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded cursor-pointer accent-[#d1a86e]"
                  />
                </div>
              </div>
              <Separator />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Announcement Message
                  </label>
                  <Input
                    type="text"
                    value={settings.announcementBar.message}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        announcementBar: { ...prev.announcementBar, message: e.target.value },
                      }))
                    }
                    placeholder="e.g., Spring 2026 Retrospective: New lapis lazuli originals now available."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Action Link Destination (Optional)
                    </label>
                    <Input
                      type="text"
                      value={settings.announcementBar.link || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          announcementBar: { ...prev.announcementBar, link: e.target.value },
                        }))
                      }
                      placeholder="/gallery or https://..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Action Link Label
                    </label>
                    <Input
                      type="text"
                      value={settings.announcementBar.linkLabel || ""}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          announcementBar: { ...prev.announcementBar, linkLabel: e.target.value },
                        }))
                      }
                      placeholder="e.g., Explore Catalogue"
                    />
                  </div>
                </div>

                {/* Banner Live Preview */}
                <div className="pt-2">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-semibold block mb-2">
                    Live Banner Preview
                  </span>
                  <div className="p-3 rounded-lg border border-[#262833] bg-[#18191e] flex items-center justify-between text-xs text-[#d1a86e]">
                    <span>{settings.announcementBar.message || "Announcement preview message"}</span>
                    {settings.announcementBar.linkLabel && (
                      <span className="underline cursor-pointer text-white text-[11px]">
                        {settings.announcementBar.linkLabel} &rarr;
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB 8: HEADER & NAVIGATION MENU BUILDER                      */}
          {/* ============================================================ */}
          <TabsContent value="navigation" className="pt-4">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-white mb-1">Header &amp; Navigation Menu Builder</h3>
                  <p className="text-xs text-zinc-400">
                    Add, rename, reorder, and toggle navigation destinations without changing code.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addNavigationItem}
                  className="gap-1.5 border-[#262833] text-zinc-300 hover:text-white text-xs"
                >
                  <Plus className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>Add Menu Item</span>
                </Button>
              </div>
              <Separator />

              {/* Navigation Items List */}
              <div className="space-y-2.5">
                {settings.navigationItems.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-[#1a1c23] border border-[#262833] rounded-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex flex-col gap-0.5">
                        <button
                          type="button"
                          onClick={() => moveNavigationItem(index, "up")}
                          disabled={index === 0}
                          className="text-zinc-500 hover:text-white disabled:opacity-30"
                        >
                          <MoveUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveNavigationItem(index, "down")}
                          disabled={index === settings.navigationItems.length - 1}
                          className="text-zinc-500 hover:text-white disabled:opacity-30"
                        >
                          <MoveDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <span className="text-xs text-zinc-500 font-mono w-5">#{index + 1}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 flex-1">
                      <Input
                        type="text"
                        value={item.label}
                        onChange={(e) => updateNavigationItem(item.id, { label: e.target.value })}
                        placeholder="Label"
                        className="h-8 text-xs bg-[#14151a]"
                      />
                      <Input
                        type="text"
                        value={item.href}
                        onChange={(e) => updateNavigationItem(item.id, { href: e.target.value })}
                        placeholder="/destination"
                        className="h-8 text-xs bg-[#14151a]"
                      />
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <label className="flex items-center gap-1.5 text-xs text-zinc-400 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={item.isEnabled}
                          onChange={(e) => updateNavigationItem(item.id, { isEnabled: e.target.checked })}
                          className="rounded accent-[#d1a86e]"
                        />
                        <span>Visible</span>
                      </label>

                      <button
                        type="button"
                        onClick={() => removeNavigationItem(item.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Header Style & CTA Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Header Background Style
                  </label>
                  <select
                    value={settings.headerConfig.style}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        headerConfig: { ...prev.headerConfig, style: e.target.value as any },
                      }))
                    }
                    className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                  >
                    <option value="transparent">Transparent with Blur on Scroll</option>
                    <option value="solid">Solid Dark Background</option>
                    <option value="sticky">Fixed Sticky Navbar</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Header CTA Button Label
                  </label>
                  <Input
                    type="text"
                    value={settings.headerConfig.ctaLabel || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        headerConfig: { ...prev.headerConfig, ctaLabel: e.target.value },
                      }))
                    }
                    placeholder="e.g., Inquire"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Header CTA Destination
                  </label>
                  <Input
                    type="text"
                    value={settings.headerConfig.ctaUrl || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        headerConfig: { ...prev.headerConfig, ctaUrl: e.target.value },
                      }))
                    }
                    placeholder="/contact"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* ============================================================ */}
          {/* TAB 9: FOOTER, LEGAL POLICIES, AR DEFAULTS & MAINTENANCE    */}
          {/* ============================================================ */}
          <TabsContent value="footer" className="pt-4 space-y-6">
            {/* Part A: Footer Description & Social Media */}
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Footer Monologue &amp; Social Links</h3>
                <p className="text-xs text-zinc-400">
                  Manage the studio provenance statement and active gallery channels.
                </p>
              </div>
              <Separator />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Footer Studio Monologue Description
                  </label>
                  <Textarea
                    rows={3}
                    value={settings.footerConfig.description || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        footerConfig: { ...prev.footerConfig, description: e.target.value },
                      }))
                    }
                    placeholder="Refined curatorial statement displayed in the public footer..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Instagram URL
                    </label>
                    <Input
                      type="text"
                      value={settings.socialLinks.instagram || ""}
                      onChange={(e) => updateSocialLink("instagram", e.target.value)}
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Twitter / X URL
                    </label>
                    <Input
                      type="text"
                      value={settings.socialLinks.twitter || ""}
                      onChange={(e) => updateSocialLink("twitter", e.target.value)}
                      placeholder="https://x.com/..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      LinkedIn URL
                    </label>
                    <Input
                      type="text"
                      value={settings.socialLinks.linkedin || ""}
                      onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                      placeholder="https://linkedin.com/..."
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                      Artsy Gallery Profile URL
                    </label>
                    <Input
                      type="text"
                      value={settings.socialLinks.artsy || ""}
                      onChange={(e) => updateSocialLink("artsy", e.target.value)}
                      placeholder="https://artsy.net/..."
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Part B: Legal Policy Texts */}
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Legal Policies &amp; Provenance</h3>
                <p className="text-xs text-zinc-400">
                  Client acquisition conditions, privacy protections, and museum shipping protocols.
                </p>
              </div>
              <Separator />

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-xs text-zinc-400 font-medium">
                    Privacy Policy Text (/privacy)
                  </label>
                  <Textarea
                    rows={3}
                    value={settings.legalPages.privacyPolicy || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        legalPages: { ...prev.legalPages, privacyPolicy: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-zinc-400 font-medium">
                    Terms of Acquisition (/terms)
                  </label>
                  <Textarea
                    rows={3}
                    value={settings.legalPages.termsOfService || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        legalPages: { ...prev.legalPages, termsOfService: e.target.value },
                      }))
                    }
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs text-zinc-400 font-medium">
                    Shipping &amp; Crating Policy (/shipping)
                  </label>
                  <Textarea
                    rows={2}
                    value={settings.legalPages.shippingPolicy || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        legalPages: { ...prev.legalPages, shippingPolicy: e.target.value },
                      }))
                    }
                  />
                </div>
              </div>
            </Card>

            {/* Part C: Global WebAR Defaults */}
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Global WebAR Spatial Defaults</h3>
                <p className="text-xs text-zinc-400">
                  Default parameters applied across artworks for true-scale wall placement and interactive WebXR sessions.
                </p>
              </div>
              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Storefront AR Button Label
                  </label>
                  <Input
                    type="text"
                    value={settings.globalArDefaults.ctaLabel || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        globalArDefaults: { ...prev.globalArDefaults, ctaLabel: e.target.value },
                      }))
                    }
                    placeholder="e.g., View in Your Space"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Default Placement Mode
                  </label>
                  <select
                    value={settings.globalArDefaults.defaultPlacement}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        globalArDefaults: {
                          ...prev.globalArDefaults,
                          defaultPlacement: e.target.value as any,
                        },
                      }))
                    }
                    className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                  >
                    <option value="wall">Wall Surface (Paintings &amp; Framed Art)</option>
                    <option value="floor">Floor Surface (Sculptures &amp; Installations)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Default Frame Profile
                  </label>
                  <select
                    value={settings.globalArDefaults.defaultFrame}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        globalArDefaults: { ...prev.globalArDefaults, defaultFrame: e.target.value },
                      }))
                    }
                    className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
                  >
                    <option value="minimal_black">Minimal Museum Black Frame</option>
                    <option value="classic_gold">Florentine Classic Gold Leaf</option>
                    <option value="natural_wood">Natural Nordic Oak Wood</option>
                    <option value="white_gallery">White Gallery Float Box</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Default Scale Ratio
                  </label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0.5"
                    max="2.0"
                    value={settings.globalArDefaults.defaultScale}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        globalArDefaults: {
                          ...prev.globalArDefaults,
                          defaultScale: parseFloat(e.target.value) || 1.0,
                        },
                      }))
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Visitor Scanning Instructions
                </label>
                <Textarea
                  rows={2}
                  value={settings.globalArDefaults.defaultInstructions || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      globalArDefaults: { ...prev.globalArDefaults, defaultInstructions: e.target.value },
                    }))
                  }
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Device Incompatibility Fallback Text
                </label>
                <Textarea
                  rows={2}
                  value={settings.globalArDefaults.fallbackMessage || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      globalArDefaults: { ...prev.globalArDefaults, fallbackMessage: e.target.value },
                    }))
                  }
                />
              </div>
            </Card>

            {/* Part D: Maintenance Mode */}
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-white mb-1">Maintenance Mode &amp; Curatorial Lock</h3>
                  <p className="text-xs text-zinc-400">
                    Temporarily present an editorial maintenance notice to visitors while making private gallery updates.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                  <span className="text-xs text-zinc-300 font-medium">Active:</span>
                  <input
                    type="checkbox"
                    checked={settings.maintenanceMode.isEnabled}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        maintenanceMode: { ...prev.maintenanceMode, isEnabled: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded cursor-pointer accent-amber-500"
                  />
                </div>
              </div>
              <Separator />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Maintenance Headline
                  </label>
                  <Input
                    type="text"
                    value={settings.maintenanceMode.title || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        maintenanceMode: { ...prev.maintenanceMode, title: e.target.value },
                      }))
                    }
                    placeholder="e.g., Studio Under Curation"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Maintenance Visitor Message
                  </label>
                  <Textarea
                    rows={3}
                    value={settings.maintenanceMode.message || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        maintenanceMode: { ...prev.maintenanceMode, message: e.target.value },
                      }))
                    }
                    placeholder="Message displayed to public visitors..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Estimated Return Time
                  </label>
                  <Input
                    type="text"
                    value={settings.maintenanceMode.expectedReturn || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        maintenanceMode: { ...prev.maintenanceMode, expectedReturn: e.target.value },
                      }))
                    }
                    placeholder="e.g., Returning Today at 18:00 CET"
                  />
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </form>
    </div>
  );
}
