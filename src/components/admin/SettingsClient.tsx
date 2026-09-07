"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SiteSettingsData } from "@/db/repository";
import {
  Settings,
  Check,
  Database,
  HardDrive,
  Mail,
  User,
  MapPin,
  Phone,
  Globe,
  Palette,
  FileText,
  AlertCircle,
  Loader2,
  ExternalLink,
  Search,
  Eye,
  History,
  ImageIcon,
  ArrowUpRight,
  Sliders,
  Megaphone,
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
  Lock,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SettingsClientProps {
  initialSettings: SiteSettingsData;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<SiteSettingsData>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

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
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (!res.ok) throw new Error("Save failed");

      setSaveStatus("success");
      setTimeout(() => setSaveStatus("idle"), 4000);
    } catch (err) {
      console.error("Failed to save site settings:", err);
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

  // Exhibitions list add/remove
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
            Storefront &amp; Studio System Hub
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Storefront &amp; Settings</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Control branding, navigation, announcement banners, gallery catalogue, about CV, contact desk, and global AR defaults.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            className="bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-[#d1a86e]/10"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : saveStatus === "success" ? (
              <Check className="w-4 h-4" />
            ) : (
              <Settings className="w-4 h-4" />
            )}
            <span>{saving ? "Saving..." : saveStatus === "success" ? "Saved" : "Save All Changes"}</span>
          </Button>
        </div>
      </div>

      {/* Save Status Toast */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-950/60 border border-emerald-800/50 rounded-xl text-emerald-300 text-xs font-medium animate-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>All storefront configurations and system settings successfully saved to database.</span>
        </div>
      )}
      {saveStatus === "error" && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-950/60 border border-red-800/50 rounded-xl text-red-300 text-xs font-medium animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4" />
          <span>Failed to save settings. Please inspect network or database connectivity.</span>
        </div>
      )}

      {/* Studio Systems & Tools Hub */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-white">Studio Systems &amp; Configurations</h2>
          <span className="text-[10px] uppercase tracking-wider text-zinc-400">Integrated Tools</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Link
            href="/admin/homepage"
            className="group p-4 bg-[#14151a] hover:bg-[#1a1c23] border border-[#262833] hover:border-[#d1a86e]/40 rounded-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 group-hover:text-[#d1a86e] transition-colors">
                <LayoutGrid className="w-4 h-4 text-[#d1a86e]" />
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#d1a86e] transition-colors" />
              </div>
              <h3 className="font-medium text-sm text-white mt-2 group-hover:text-[#d1a86e] transition-colors">
                Visual Homepage Builder
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Hero slides, featured artworks, masonry layouts, and responsive live previews.
              </p>
            </div>
            <span className="text-[10px] text-zinc-500 mt-3 font-mono">/admin/homepage</span>
          </Link>

          <Link
            href="/admin/appearance"
            className="group p-4 bg-[#14151a] hover:bg-[#1a1c23] border border-[#262833] hover:border-[#d1a86e]/40 rounded-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 group-hover:text-[#d1a86e] transition-colors">
                <Palette className="w-4 h-4 text-[#d1a86e]" />
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#d1a86e] transition-colors" />
              </div>
              <h3 className="font-medium text-sm text-white mt-2 group-hover:text-[#d1a86e] transition-colors">
                Brand Aesthetics &amp; Theme
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Playfair typography, editorial palette tokens, radius, and animation curves.
              </p>
            </div>
            <span className="text-[10px] text-zinc-500 mt-3 font-mono">/admin/appearance</span>
          </Link>

          <Link
            href="/admin/seo"
            className="group p-4 bg-[#14151a] hover:bg-[#1a1c23] border border-[#262833] hover:border-[#d1a86e]/40 rounded-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 group-hover:text-[#d1a86e] transition-colors">
                <Search className="w-4 h-4 text-[#d1a86e]" />
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#d1a86e] transition-colors" />
              </div>
              <h3 className="font-medium text-sm text-white mt-2 group-hover:text-[#d1a86e] transition-colors">
                Search &amp; SEO Discovery
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Dynamic sitemap, OpenGraph metadata, Google indexing, and search tags.
              </p>
            </div>
            <span className="text-[10px] text-zinc-500 mt-3 font-mono">/admin/seo</span>
          </Link>

          <Link
            href="/admin/accessibility"
            className="group p-4 bg-[#14151a] hover:bg-[#1a1c23] border border-[#262833] hover:border-[#d1a86e]/40 rounded-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 group-hover:text-[#d1a86e] transition-colors">
                <Eye className="w-4 h-4 text-[#d1a86e]" />
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#d1a86e] transition-colors" />
              </div>
              <h3 className="font-medium text-sm text-white mt-2 group-hover:text-[#d1a86e] transition-colors">
                Accessibility &amp; WCAG
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                WCAG 2.2 AA audit, alt text compliance, focus states, and screen reader tokens.
              </p>
            </div>
            <span className="text-[10px] text-zinc-500 mt-3 font-mono">/admin/accessibility</span>
          </Link>

          <Link
            href="/admin/activity"
            className="group p-4 bg-[#14151a] hover:bg-[#1a1c23] border border-[#262833] hover:border-[#d1a86e]/40 rounded-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 group-hover:text-[#d1a86e] transition-colors">
                <History className="w-4 h-4 text-[#d1a86e]" />
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#d1a86e] transition-colors" />
              </div>
              <h3 className="font-medium text-sm text-white mt-2 group-hover:text-[#d1a86e] transition-colors">
                Studio Activity Trail
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Immutable audit trail of artwork edits, publications, and administrative mutations.
              </p>
            </div>
            <span className="text-[10px] text-zinc-500 mt-3 font-mono">/admin/activity</span>
          </Link>

          <Link
            href="/admin/media"
            className="group p-4 bg-[#14151a] hover:bg-[#1a1c23] border border-[#262833] hover:border-[#d1a86e]/40 rounded-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 group-hover:text-[#d1a86e] transition-colors">
                <ImageIcon className="w-4 h-4 text-[#d1a86e]" />
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#d1a86e] transition-colors" />
              </div>
              <h3 className="font-medium text-sm text-white mt-2 group-hover:text-[#d1a86e] transition-colors">
                Cloud Media Assets
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Cloudflare R2 buckets, Sharp transformations, original master files, and CDN cache.
              </p>
            </div>
            <span className="text-[10px] text-zinc-500 mt-3 font-mono">/admin/media</span>
          </Link>
        </div>
      </div>

      {/* Main Multi-Tab Storefront CMS */}
      <form onSubmit={handleSave}>
        <Tabs defaultValue="identity">
          <TabsList className="w-full flex-wrap justify-start gap-1 p-1 bg-[#14151a] border border-[#262833] rounded-xl h-auto">
            <TabsTrigger value="identity" className="gap-1.5 text-xs py-2 px-3">
              <User className="w-3.5 h-3.5" />
              <span>Identity &amp; Brand</span>
            </TabsTrigger>
            <TabsTrigger value="announcement" className="gap-1.5 text-xs py-2 px-3">
              <Megaphone className="w-3.5 h-3.5" />
              <span>Announcement Bar</span>
            </TabsTrigger>
            <TabsTrigger value="navigation" className="gap-1.5 text-xs py-2 px-3">
              <Compass className="w-3.5 h-3.5" />
              <span>Header &amp; Nav Menu</span>
            </TabsTrigger>
            <TabsTrigger value="gallery" className="gap-1.5 text-xs py-2 px-3">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Gallery Catalogue</span>
            </TabsTrigger>
            <TabsTrigger value="about" className="gap-1.5 text-xs py-2 px-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>About &amp; CV</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5 text-xs py-2 px-3">
              <Phone className="w-3.5 h-3.5" />
              <span>Contact Desk</span>
            </TabsTrigger>
            <TabsTrigger value="footer" className="gap-1.5 text-xs py-2 px-3">
              <Scale className="w-3.5 h-3.5" />
              <span>Footer &amp; Legal</span>
            </TabsTrigger>
            <TabsTrigger value="ar_defaults" className="gap-1.5 text-xs py-2 px-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AR Defaults</span>
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="gap-1.5 text-xs py-2 px-3">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Maintenance Mode</span>
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: IDENTITY & BRAND */}
          <TabsContent value="identity" className="pt-4">
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
                />
              </div>
            </Card>
          </TabsContent>

          {/* TAB 2: ANNOUNCEMENT BAR */}
          <TabsContent value="announcement" className="pt-4">
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

          {/* TAB 3: HEADER & NAVIGATION */}
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

          {/* TAB 4: GALLERY CATALOGUE */}
          <TabsContent value="gallery" className="pt-4">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Gallery Catalogue CMS</h3>
                <p className="text-xs text-zinc-400">
                  Control the public /gallery hero introduction, default layout cards, and enabled visitor filters.
                </p>
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

          {/* TAB 5: ABOUT & CV */}
          <TabsContent value="about" className="pt-4">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">About Page &amp; Curatorial CV</h3>
                <p className="text-xs text-zinc-400">
                  Manage artist biography, philosophy, quote, and museum exhibition history.
                </p>
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

          {/* TAB 6: CONTACT DESK */}
          <TabsContent value="contact" className="pt-4">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Contact Desk &amp; Inquiries Liaison</h3>
                <p className="text-xs text-zinc-400">
                  Studio correspondence email, atelier address, desk phone, and acquisition instructions.
                </p>
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
                    placeholder="+33 6..."
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
                />
              </div>
            </Card>
          </TabsContent>

          {/* TAB 7: FOOTER & LEGAL */}
          <TabsContent value="footer" className="pt-4">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Footer Curation &amp; Legal Policies</h3>
                <p className="text-xs text-zinc-400">
                  Manage studio provenance statement, social links, and legal policies (Privacy, Terms, Shipping).
                </p>
              </div>
              <Separator />

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Footer Studio Description
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
                    />
                  </div>
                </div>

                <Separator />
                <h4 className="text-xs uppercase tracking-wider text-zinc-300 font-semibold pt-1">
                  Legal Policy Texts
                </h4>

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
                      Shipping &amp; Crating Policy
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
              </div>
            </Card>
          </TabsContent>

          {/* TAB 8: AR DEFAULTS */}
          <TabsContent value="ar_defaults" className="pt-4">
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
          </TabsContent>

          {/* TAB 9: MAINTENANCE MODE */}
          <TabsContent value="maintenance" className="pt-4">
            <Card className="p-6 space-y-6 bg-[#14151a] border-[#262833]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-serif text-lg text-white mb-1">Maintenance Mode &amp; System Health</h3>
                  <p className="text-xs text-zinc-400">
                    Temporarily present an editorial maintenance notice to visitors while you make private curatorial updates. Admins remain logged in.
                  </p>
                </div>
                <div className="flex items-center gap-2">
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
                    className="w-4 h-4 rounded cursor-pointer accent-red-500"
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
