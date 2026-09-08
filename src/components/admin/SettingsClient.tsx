"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Phone,
  MapPin,
  Clock,
  Save,
  Check,
  AlertCircle,
  ExternalLink,
  Loader2,
  Share2,
  Sliders,
  CheckCircle2,
  Database,
  Sparkles,
  ShieldCheck,
  Globe,
  Zap,
  Server,
  Trash2,
  RefreshCw,
} from "lucide-react";
import type { SiteSettingsData } from "@/db/mockData";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface SettingsClientProps {
  initialSettings: SiteSettingsData;
  initialTab?: string;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<SiteSettingsData>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Redis Performance & Cache State
  const [redisStatus, setRedisStatus] = useState<{
    connected: boolean;
    latencyMs?: number;
    keyCount?: number;
    configured?: boolean;
    error?: string;
  } | null>(null);
  const [loadingRedis, setLoadingRedis] = useState(false);
  const [purgingRedis, setPurgingRedis] = useState(false);
  const [cacheMessage, setCacheMessage] = useState<string | null>(null);

  const fetchRedisStatus = async () => {
    setLoadingRedis(true);
    try {
      const res = await fetch("/api/admin/cache");
      const data = await res.json();
      if (data?.health) {
        setRedisStatus(data.health);
      }
    } catch (e) {
      console.error("Failed to check Redis status:", e);
    } finally {
      setLoadingRedis(false);
    }
  };

  useEffect(() => {
    fetchRedisStatus();
  }, []);

  const handlePurgeRedis = async () => {
    setPurgingRedis(true);
    setCacheMessage(null);
    try {
      const res = await fetch("/api/admin/cache", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "flush_all" }),
      });
      const data = await res.json();
      if (data?.success) {
        setCacheMessage("All Redis caches successfully purged!");
        fetchRedisStatus();
        setTimeout(() => setCacheMessage(null), 4000);
      } else {
        setCacheMessage(data?.error || "Failed to purge cache");
      }
    } catch (e) {
      setCacheMessage("Network error while purging cache");
    } finally {
      setPurgingRedis(false);
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!settings.siteTitle.trim()) {
      newErrors.siteTitle = "Gallery name is required";
    }
    if (!settings.artistName.trim()) {
      newErrors.artistName = "Gallery owner / artist name is required";
    }
    if (!settings.contactEmail.trim()) {
      newErrors.contactEmail = "Store contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)) {
      newErrors.contactEmail = "Please provide a valid email format";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validate()) return;

    setSaving(true);
    setSaveStatus("idle");
    setStatusMessage("");

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        if (data.settings) {
          setSettings(data.settings);
        }
        setSaveStatus("success");
        setStatusMessage(
          `Gallery profile updated successfully! "${settings.siteTitle}" is now live across your customer storefront.`
        );

        // Clear success notification after 5s
        setTimeout(() => {
          setSaveStatus("idle");
        }, 5000);
      } else {
        setSaveStatus("error");
        setStatusMessage(data.error || "Failed to update settings. Please try again.");
      }
    } catch (err: any) {
      console.error("Save settings failed:", err);
      setSaveStatus("error");
      setStatusMessage("Network error while updating gallery profile. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-8 pb-10 w-full">
      {/* Executive Header Bar */}
      <div className="p-6 sm:p-8 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-none">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#d1a86e] bg-[#222432] font-mono text-xs px-2.5 py-1 rounded-xl border-none">
              STORE PROFILE &amp; BRAND
            </span>
            <span className="text-zinc-500 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Direct Neon Database Sync
            </span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl text-white font-medium">
            Gallery &amp; Store Settings
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Manage your fine art gallery name, owner credentials, and physical store liaison coordinates.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <Button asChild variant="ghost" size="sm" className="gap-2 text-xs bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 rounded-xl border-none h-9 px-4">
            <Link href="/" target="_blank" title="View live customer storefront">
              <span>Live Storefront</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </Link>
          </Button>

          <Button asChild variant="ghost" size="sm" className="gap-2 text-xs bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 rounded-xl border-none h-9 px-4">
            <Link href="/admin/homepage" title="Manage visual page builder and layouts">
              <Sliders className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>Storefront Studio</span>
            </Link>
          </Button>

          <Button
            type="button"
            onClick={() => handleSave()}
            disabled={saving}
            size="sm"
            className="bg-[#d1a86e] hover:bg-[#c49a5f] text-black font-semibold gap-2 shadow-lg shadow-black/40 cursor-pointer rounded-xl border-none h-9 px-5"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === "success" ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Save Status Alert */}
      {saveStatus === "success" && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 text-emerald-300 text-sm flex items-center justify-between gap-3 shadow-md border-none">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>{statusMessage}</span>
          </div>
          <Button asChild variant="ghost" size="sm" className="text-emerald-300 hover:text-emerald-100 hover:bg-emerald-900/50 text-xs rounded-xl border-none">
            <Link href="/" target="_blank">
              View on Storefront <ExternalLink className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      )}

      {saveStatus === "error" && (
        <div className="p-4 rounded-2xl bg-red-950/80 text-red-300 text-sm flex items-center gap-3 shadow-md border-none">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="w-full space-y-8">
        {/* Full-Width 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full items-start">
          
          {/* COLUMN 1 (LEFT): Gallery & Artist Identity + Public Channels */}
          <div className="space-y-6">
            {/* 1. Gallery & Artist Identity */}
            <Card className="p-6 sm:p-8 bg-[#121319] rounded-3xl space-y-6 shadow-xl shadow-black/40 border-none">
              <div className="flex items-center gap-3 pb-2">
                <div className="w-9 h-9 rounded-xl bg-[#1a1b26] flex items-center justify-center shrink-0 border-none shadow-sm">
                  <Building2 className="w-4 h-4 text-[#d1a86e]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-white font-medium">Gallery &amp; Artist Identity</h2>
                  <p className="text-xs text-zinc-400">
                    Primary name and branding shown in customer headers, footers, and SEO tags.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Gallery Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Art Gallery Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => {
                      setSettings({ ...settings, siteTitle: e.target.value });
                      if (errors.siteTitle) setErrors({ ...errors, siteTitle: "" });
                    }}
                    placeholder="e.g. L'Atelier Lumineux"
                    className={`bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e] ${
                      errors.siteTitle ? "ring-1 ring-red-500" : ""
                    }`}
                  />
                  {errors.siteTitle && (
                    <p className="text-xs text-red-400">{errors.siteTitle}</p>
                  )}
                  <p className="text-[11px] text-zinc-500">
                    Main title shown on all customer web pages and browser tabs.
                  </p>
                </div>

                {/* Gallery Owner / Primary Artist */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Gallery Owner / Artist Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={settings.artistName}
                    onChange={(e) => {
                      setSettings({ ...settings, artistName: e.target.value });
                      if (errors.artistName) setErrors({ ...errors, artistName: "" });
                    }}
                    placeholder="e.g. Elena Vance"
                    className={`bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e] ${
                      errors.artistName ? "ring-1 ring-red-500" : ""
                    }`}
                  />
                  {errors.artistName && (
                    <p className="text-xs text-red-400">{errors.artistName}</p>
                  )}
                  <p className="text-[11px] text-zinc-500">
                    The lead artist or gallery director credited on curatorial statements.
                  </p>
                </div>

                {/* Short Brand Name */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Short Brand Name / Monogram
                  </label>
                  <Input
                    type="text"
                    value={settings.shortBrandName}
                    onChange={(e) => setSettings({ ...settings, shortBrandName: e.target.value })}
                    placeholder="e.g. L'Atelier"
                    className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Used in compact mobile headers and copyright notices.
                  </p>
                </div>

                {/* Tagline */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Studio Tagline &amp; Philosophy
                  </label>
                  <Input
                    type="text"
                    value={settings.tagline}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    placeholder="e.g. Fine Contemporary Oil & Spatial AR Gallery"
                    className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                  />
                  <p className="text-[11px] text-zinc-500">
                    Shown below the gallery name on hero banners and meta descriptions.
                  </p>
                </div>
              </div>

              {/* Bio Summary */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Curatorial Bio Summary
                </label>
                <Textarea
                  rows={2}
                  value={settings.bioSummary}
                  onChange={(e) => setSettings({ ...settings, bioSummary: e.target.value })}
                  placeholder="Brief 2-3 sentence overview of the studio practice and curatorial focus."
                  className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus:ring-1 focus:ring-[#d1a86e] resize-none"
                />
              </div>

              {/* Artist Monologue Statement */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Artist Monologue Statement
                </label>
                <Textarea
                  rows={3}
                  value={settings.statement}
                  onChange={(e) => setSettings({ ...settings, statement: e.target.value })}
                  placeholder="The signature philosophical statement featured on the homepage."
                  className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus:ring-1 focus:ring-[#d1a86e] resize-none"
                />
              </div>
            </Card>

            {/* 2. Public Channels & Social Links */}
            <Card className="p-6 sm:p-8 bg-[#121319] rounded-3xl space-y-6 shadow-xl shadow-black/40 border-none">
              <div className="flex items-center gap-3 pb-2">
                <div className="w-9 h-9 rounded-xl bg-[#1a1b26] flex items-center justify-center shrink-0 border-none shadow-sm">
                  <Share2 className="w-4 h-4 text-[#d1a86e]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-white font-medium">Public Channels &amp; Social Links</h2>
                  <p className="text-xs text-zinc-400">
                    Profiles linked in your customer footer and artist bio plaque.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Instagram Profile</label>
                  <Input
                    type="text"
                    value={settings.socialLinks?.instagram || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: { ...settings.socialLinks, instagram: e.target.value },
                      })
                    }
                    placeholder="https://instagram.com/..."
                    className="bg-[#1a1b26] text-white text-xs font-mono placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Artsy Profile</label>
                  <Input
                    type="text"
                    value={settings.socialLinks?.artsy || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: { ...settings.socialLinks, artsy: e.target.value },
                      })
                    }
                    placeholder="https://artsy.net/artist/..."
                    className="bg-[#1a1b26] text-white text-xs font-mono placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">Twitter / X</label>
                  <Input
                    type="text"
                    value={settings.socialLinks?.twitter || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: { ...settings.socialLinks, twitter: e.target.value },
                      })
                    }
                    placeholder="https://x.com/..."
                    className="bg-[#1a1b26] text-white text-xs font-mono placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300">LinkedIn Profile</label>
                  <Input
                    type="text"
                    value={settings.socialLinks?.linkedin || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        socialLinks: { ...settings.socialLinks, linkedin: e.target.value },
                      })
                    }
                    placeholder="https://linkedin.com/..."
                    className="bg-[#1a1b26] text-white text-xs font-mono placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* COLUMN 2 (RIGHT): Store & Liaison Details + Live Preview Plaque */}
          <div className="space-y-6">
            {/* 3. Store & Liaison Details */}
            <Card className="p-6 sm:p-8 bg-[#121319] rounded-3xl space-y-6 shadow-xl shadow-black/40 border-none">
              <div className="flex items-center gap-3 pb-2">
                <div className="w-9 h-9 rounded-xl bg-[#1a1b26] flex items-center justify-center shrink-0 border-none shadow-sm">
                  <Mail className="w-4 h-4 text-[#d1a86e]" />
                </div>
                <div>
                  <h2 className="font-serif text-lg text-white font-medium">Store &amp; Liaison Details</h2>
                  <p className="text-xs text-zinc-400">
                    Direct contact channels for acquisitions, private viewings, and correspondence.
                  </p>
                </div>
              </div>

              {/* Collector Email */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-300 block">
                  Primary Collector Email <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => {
                      setSettings({ ...settings, contactEmail: e.target.value });
                      if (errors.contactEmail) setErrors({ ...errors, contactEmail: "" });
                    }}
                    placeholder="curator@latelier-lumineux.art"
                    className={`pl-10 bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e] ${
                      errors.contactEmail ? "ring-1 ring-red-500" : ""
                    }`}
                  />
                </div>
                {errors.contactEmail && (
                  <p className="text-xs text-red-400">{errors.contactEmail}</p>
                )}
              </div>

              {/* Telephone & WhatsApp */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Studio Telephone
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      type="text"
                      value={settings.phone || ""}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      placeholder="+33 1 42 68 55 00"
                      className="pl-10 bg-[#1a1b26] text-white text-xs font-mono placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    WhatsApp Liaison Desk
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      type="text"
                      value={settings.whatsapp || ""}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      placeholder="+33 6 12 34 56 78"
                      className="pl-10 bg-[#1a1b26] text-white text-xs font-mono placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                    />
                  </div>
                </div>
              </div>

              {/* Address & City/Country */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Physical Gallery Address
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      type="text"
                      value={settings.address || ""}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      placeholder="14 Rue de Beaune, 7th Arr."
                      className="pl-10 bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    City, Region &amp; Country
                  </label>
                  <Input
                    type="text"
                    value={settings.location || ""}
                    onChange={(e) => setSettings({ ...settings, location: e.target.value })}
                    placeholder="Paris & Brittany, France"
                    className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                  />
                </div>
              </div>

              {/* Hours & Acquisition Note */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Visiting &amp; Studio Hours
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <Input
                      type="text"
                      value={settings.businessHours || ""}
                      onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                      placeholder="Mon – Sat: 10:00 – 19:00"
                      className="pl-10 bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Appointment Note
                  </label>
                  <Input
                    type="text"
                    value={settings.contactInstructions || ""}
                    onChange={(e) => setSettings({ ...settings, contactInstructions: e.target.value })}
                    placeholder="Correspond via liaison desk."
                    className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                  />
                </div>
              </div>
            </Card>

            {/* 4. Live Customer Storefront Plaque Simulation */}
            <Card className="p-6 sm:p-8 bg-[#121319] rounded-3xl space-y-4 shadow-xl shadow-black/40 relative overflow-hidden border-none">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-[#d1a86e] font-semibold">
                    Live Plaque Preview
                  </span>
                </div>
                <span className="text-[10px] text-zinc-500 font-mono">Updates as you type</span>
              </div>

              {/* Simulated Museum Plaque */}
              <div className="bg-[#1a1b26] rounded-2xl p-5 space-y-3 shadow-inner relative border-none">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#222432] flex items-center justify-center shrink-0 border-none shadow-sm">
                    <Building2 className="w-5 h-5 text-[#d1a86e]" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">
                      {settings.shortBrandName || "Fine Art Studio"}
                    </span>
                    <h3 className="font-serif text-lg text-white font-medium truncate">
                      {settings.siteTitle || "L'Atelier Lumineux"}
                    </h3>
                  </div>
                </div>

                <div className="pt-2 space-y-2 text-xs">
                  <div className="text-zinc-300">
                    <span className="text-zinc-500">Lead Artist: </span>
                    <span className="text-[#d1a86e] font-serif font-medium">
                      {settings.artistName || "Elena Vance"}
                    </span>
                  </div>

                  {settings.tagline && (
                    <p className="text-[11px] text-zinc-400 italic line-clamp-2">
                      &quot;{settings.tagline}&quot;
                    </p>
                  )}

                  <div className="pt-2 flex flex-col gap-1 text-[11px] text-zinc-400">
                    {settings.location && (
                      <div className="flex items-center gap-1.5 truncate">
                        <MapPin className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                        <span className="truncate">{settings.location}</span>
                      </div>
                    )}
                    {settings.contactEmail && (
                      <div className="flex items-center gap-1.5 truncate">
                        <Mail className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                        <span className="truncate font-mono text-[10px]">{settings.contactEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                  <Database className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>Direct Neon DB Sync</span>
                </div>
                <Button asChild variant="ghost" size="sm" className="text-xs bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 gap-1.5 hover:text-white rounded-xl border-none h-8 px-3">
                  <Link href="/" target="_blank">
                    <span>Open Storefront</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </Link>
                </Button>
              </div>
            </Card>

            {/* 5. Redis Performance & Edge Cache Engine */}
            <Card className="p-6 sm:p-8 bg-[#121319] rounded-3xl space-y-4 shadow-xl shadow-black/40 relative overflow-hidden border-none">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#d1a86e]" />
                  <span className="text-[11px] font-mono uppercase tracking-widest text-white font-semibold">
                    Redis Cache Acceleration
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={fetchRedisStatus}
                    disabled={loadingRedis}
                    title="Refresh cache status"
                    className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-[#1a1b26] transition-colors disabled:opacity-50 cursor-pointer border-none"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingRedis ? "animate-spin" : ""}`} />
                  </button>
                  {redisStatus?.connected ? (
                    <span className="bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-medium border-none">
                      ONLINE
                    </span>
                  ) : (
                    <span className="bg-[#1a1b26] text-zinc-400 px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-medium border-none">
                      STANDBY
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-[#1a1b26] rounded-2xl p-5 space-y-2.5 text-xs border-none">
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Provider</span>
                  <span className="text-zinc-200 font-mono text-[11px]">Upstash Global KV</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Edge Roundtrip Latency</span>
                  <span className="text-[#d1a86e] font-mono text-[11px] font-semibold">
                    {redisStatus?.latencyMs !== undefined ? `${redisStatus.latencyMs} ms` : "Measuring..."}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Cache Strategy</span>
                  <span className="text-zinc-300 text-[11px]">1h TTL + Instant Invalidation</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">Fallback Safety</span>
                  <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Fail-open (Neon DB)
                  </span>
                </div>
              </div>

              {cacheMessage && (
                <div className="p-3 rounded-xl text-xs bg-emerald-950/80 text-emerald-300 flex items-center gap-2 border-none shadow-sm">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>{cacheMessage}</span>
                </div>
              )}

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-zinc-500">Purge stale cache keys</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handlePurgeRedis}
                  disabled={purgingRedis}
                  className="text-xs bg-[#2d1616] hover:bg-red-950 text-red-300 gap-1.5 h-9 px-4 cursor-pointer rounded-xl border-none"
                >
                  {purgingRedis ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Purging...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Purge Redis Cache</span>
                    </>
                  )}
                </Button>
              </div>
            </Card>

            {/* Inline Save Action Button */}
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-[#d1a86e] hover:bg-[#c49a5f] text-black font-semibold gap-2 py-4 shadow-lg shadow-black/40 cursor-pointer text-sm rounded-2xl border-none"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Applying Updates...</span>
                </>
              ) : saveStatus === "success" ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Saved &amp; Live!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Gallery Settings</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
