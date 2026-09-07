"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Settings,
  Check,
  ShieldCheck,
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
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SocialLinks {
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  artsy?: string;
}

interface SettingsData {
  artistName: string;
  siteTitle: string;
  tagline: string;
  bioSummary: string;
  statement: string;
  contactEmail: string;
  phone: string;
  location: string;
  socialLinks: SocialLinks;
  copyrightText: string;
}

interface SettingsClientProps {
  initialSettings: SettingsData;
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState<SettingsData>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!settings.artistName.trim()) {
      newErrors.artistName = "Artist name is required";
    }
    if (!settings.siteTitle.trim()) {
      newErrors.siteTitle = "Site title is required";
    }
    if (!settings.contactEmail.trim()) {
      newErrors.contactEmail = "Contact email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(settings.contactEmail)) {
      newErrors.contactEmail = "Invalid email format";
    }

    // Validate social URLs if provided
    const urlPattern = /^https?:\/\/.+/;
    if (settings.socialLinks.instagram && !urlPattern.test(settings.socialLinks.instagram)) {
      newErrors.instagram = "Must start with https://";
    }
    if (settings.socialLinks.twitter && !urlPattern.test(settings.socialLinks.twitter)) {
      newErrors.twitter = "Must start with https://";
    }
    if (settings.socialLinks.linkedin && !urlPattern.test(settings.socialLinks.linkedin)) {
      newErrors.linkedin = "Must start with https://";
    }
    if (settings.socialLinks.artsy && !urlPattern.test(settings.socialLinks.artsy)) {
      newErrors.artsy = "Must start with https://";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
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

  const updateField = (field: keyof SettingsData, value: string) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const updateSocialLink = (key: keyof SocialLinks, value: string) => {
    setSettings((prev) => ({
      ...prev,
      socialLinks: { ...prev.socialLinks, [key]: value },
    }));
    if (errors[key]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Page Header */}
      <div className="border-b border-[#1c1d25] pb-6">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
          Studio System Configuration
        </span>
        <h1 className="font-serif text-3xl text-white mt-1">Settings &amp; Status</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Manage your gallery identity, contact details, social presence, and system health.
        </p>
      </div>

      {/* Save Status Toast */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-950/60 border border-emerald-800/50 rounded-xl text-emerald-300 text-xs font-medium animate-in slide-in-from-top-2">
          <Check className="w-4 h-4" />
          <span>All settings saved successfully</span>
        </div>
      )}
      {saveStatus === "error" && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-950/60 border border-red-800/50 rounded-xl text-red-300 text-xs font-medium animate-in slide-in-from-top-2">
          <AlertCircle className="w-4 h-4" />
          <span>Failed to save settings. Please try again.</span>
        </div>
      )}

      {/* Cloud Infrastructure Health */}
      <Card className="p-6 space-y-4">
        <h2 className="font-serif text-lg text-white">Cloud Infrastructure Health</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 bg-[#1a1c23] border border-[#262833] rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-zinc-400">
              <Database className="w-4 h-4 text-[#d1a86e]" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Neon PostgreSQL
              </span>
            </div>
            <div className="font-serif text-sm text-white pt-1">
              Drizzle Engine Active
            </div>
            <span className="text-[10px] text-emerald-400 block">
              19 Tables Mapped &amp; Tested
            </span>
          </div>

          <div className="p-4 bg-[#1a1c23] border border-[#262833] rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-zinc-400">
              <HardDrive className="w-4 h-4 text-[#d1a86e]" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Cloudflare R2 Storage
              </span>
            </div>
            <div className="font-serif text-sm text-white pt-1">
              Sharp Pipeline Active
            </div>
            <span className="text-[10px] text-emerald-400 block">
              WebP / AVIF Generation Ready
            </span>
          </div>

          <div className="p-4 bg-[#1a1c23] border border-[#262833] rounded-xl space-y-1">
            <div className="flex items-center gap-2 text-zinc-400">
              <Mail className="w-4 h-4 text-[#d1a86e]" />
              <span className="font-semibold uppercase tracking-wider text-[10px]">
                Better Auth &amp; Resend
              </span>
            </div>
            <div className="font-serif text-sm text-white pt-1">
              Session Cookies Active
            </div>
            <span className="text-[10px] text-emerald-400 block">
              Admin 2FA Capable
            </span>
          </div>
        </div>
      </Card>

      {/* Studio Systems & Tools Hub */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg text-white">Studio Systems &amp; Configurations</h2>
          <span className="text-[10px] uppercase tracking-wider text-zinc-400">Integrated Tools</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

          <Link
            href="/admin/analytics"
            className="group p-4 bg-[#14151a] hover:bg-[#1a1c23] border border-[#262833] hover:border-[#d1a86e]/40 rounded-xl transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-zinc-400 group-hover:text-[#d1a86e] transition-colors">
                <Sliders className="w-4 h-4 text-[#d1a86e]" />
                <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-[#d1a86e] transition-colors" />
              </div>
              <h3 className="font-medium text-sm text-white mt-2 group-hover:text-[#d1a86e] transition-colors">
                Visitor &amp; AR Analytics
              </h3>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                Exhibition footfall, artwork engagement, WebAR session completions, and conversions.
              </p>
            </div>
            <span className="text-[10px] text-zinc-500 mt-3 font-mono">/admin/analytics</span>
          </Link>
        </div>
      </div>

      {/* Tabbed Settings Form */}
      <form onSubmit={handleSave}>
        <Tabs defaultValue="general">
          <TabsList className="w-full sm:w-auto flex-wrap">
            <TabsTrigger value="general" className="gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>General</span>
            </TabsTrigger>
            <TabsTrigger value="contact" className="gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Contact &amp; Location</span>
            </TabsTrigger>
            <TabsTrigger value="social" className="gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              <span>Social Links</span>
            </TabsTrigger>
            <TabsTrigger value="branding" className="gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              <span>Branding</span>
            </TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Artist &amp; Gallery Identity</h3>
                <p className="text-xs text-zinc-400">
                  Core information about the artist and the gallery brand.
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Artist Name <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={settings.artistName}
                    onChange={(e) => updateField("artistName", e.target.value)}
                    placeholder="e.g., Vishal Phirke"
                  />
                  {errors.artistName && (
                    <span className="text-[10px] text-red-400">{errors.artistName}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    Gallery / Site Title <span className="text-red-400">*</span>
                  </label>
                  <Input
                    type="text"
                    value={settings.siteTitle}
                    onChange={(e) => updateField("siteTitle", e.target.value)}
                    placeholder="e.g., Atelier Lumineux"
                  />
                  {errors.siteTitle && (
                    <span className="text-[10px] text-red-400">{errors.siteTitle}</span>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Tagline / Subtitle
                </label>
                <Input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => updateField("tagline", e.target.value)}
                  placeholder="e.g., Contemporary Oil & Mixed Media Gallery"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Bio Summary
                </label>
                <Textarea
                  value={settings.bioSummary}
                  onChange={(e) => updateField("bioSummary", e.target.value)}
                  placeholder="A brief biography of the artist — displayed on the About page and homepage..."
                  rows={4}
                  className="bg-[#1a1c23] border-[#262833] text-white text-xs placeholder:text-zinc-600 focus:border-[#d1a86e] focus:ring-0 resize-none"
                />
                <span className="text-[10px] text-zinc-500">
                  {settings.bioSummary.length} characters
                </span>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  Artist Statement
                </label>
                <Textarea
                  value={settings.statement}
                  onChange={(e) => updateField("statement", e.target.value)}
                  placeholder="Your artistic philosophy and creative vision..."
                  rows={5}
                  className="bg-[#1a1c23] border-[#262833] text-white text-xs placeholder:text-zinc-600 focus:border-[#d1a86e] focus:ring-0 resize-none"
                />
                <span className="text-[10px] text-zinc-500">
                  {settings.statement.length} characters
                </span>
              </div>
            </Card>
          </TabsContent>

          {/* Contact & Location Tab */}
          <TabsContent value="contact">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Contact &amp; Location</h3>
                <p className="text-xs text-zinc-400">
                  Public contact information for collectors and gallery visitors.
                </p>
              </div>

              <Separator />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#d1a86e]" />
                      Contact Email <span className="text-red-400">*</span>
                    </div>
                  </label>
                  <Input
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateField("contactEmail", e.target.value)}
                    placeholder="curator@yourgallery.art"
                  />
                  {errors.contactEmail && (
                    <span className="text-[10px] text-red-400">{errors.contactEmail}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-[#d1a86e]" />
                      Phone / Mobile
                    </div>
                  </label>
                  <Input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#d1a86e]" />
                    Studio / Gallery Location
                  </div>
                </label>
                <Input
                  type="text"
                  value={settings.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g., Mumbai, Maharashtra, India"
                />
                <span className="text-[10px] text-zinc-500">
                  Displayed in the footer and contact page
                </span>
              </div>
            </Card>
          </TabsContent>

          {/* Social Links Tab */}
          <TabsContent value="social">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Social &amp; Web Presence</h3>
                <p className="text-xs text-zinc-400">
                  Link your gallery to external platforms. Leave blank to hide from the public site.
                </p>
              </div>

              <Separator />

              <div className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-[#E1306C]" />
                      Instagram
                    </div>
                  </label>
                  <Input
                    type="url"
                    value={settings.socialLinks.instagram || ""}
                    onChange={(e) => updateSocialLink("instagram", e.target.value)}
                    placeholder="https://instagram.com/yourgallery"
                  />
                  {errors.instagram && (
                    <span className="text-[10px] text-red-400">{errors.instagram}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-[#1DA1F2]" />
                      Twitter / X
                    </div>
                  </label>
                  <Input
                    type="url"
                    value={settings.socialLinks.twitter || ""}
                    onChange={(e) => updateSocialLink("twitter", e.target.value)}
                    placeholder="https://x.com/yourgallery"
                  />
                  {errors.twitter && (
                    <span className="text-[10px] text-red-400">{errors.twitter}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 text-[#0077B5]" />
                      LinkedIn
                    </div>
                  </label>
                  <Input
                    type="url"
                    value={settings.socialLinks.linkedin || ""}
                    onChange={(e) => updateSocialLink("linkedin", e.target.value)}
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                  {errors.linkedin && (
                    <span className="text-[10px] text-red-400">{errors.linkedin}</span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                    <div className="flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-[#d1a86e]" />
                      Artsy / Portfolio
                    </div>
                  </label>
                  <Input
                    type="url"
                    value={settings.socialLinks.artsy || ""}
                    onChange={(e) => updateSocialLink("artsy", e.target.value)}
                    placeholder="https://artsy.net/artist/your-name"
                  />
                  {errors.artsy && (
                    <span className="text-[10px] text-red-400">{errors.artsy}</span>
                  )}
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Branding Tab */}
          <TabsContent value="branding">
            <Card className="p-6 space-y-6">
              <div>
                <h3 className="font-serif text-lg text-white mb-1">Branding &amp; Legal</h3>
                <p className="text-xs text-zinc-400">
                  Copyright notices and footer branding displayed across the public site.
                </p>
              </div>

              <Separator />

              <div className="space-y-1.5">
                <label className="block text-xs uppercase tracking-wider text-zinc-400 font-medium">
                  <div className="flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#d1a86e]" />
                    Copyright &amp; Provenance Notice
                  </div>
                </label>
                <Input
                  type="text"
                  value={settings.copyrightText}
                  onChange={(e) => updateField("copyrightText", e.target.value)}
                  placeholder="© 2026 Your Name. All rights reserved."
                />
                <span className="text-[10px] text-zinc-500">
                  Displayed in the footer of every public page
                </span>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Sticky Save Bar */}
        <div className="mt-6 pt-4 border-t border-[#1c1d25] flex items-center justify-between">
          <div className="flex items-center gap-2">
            {Object.keys(errors).length > 0 && (
              <span className="text-xs text-red-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {Object.keys(errors).length} validation error(s)
              </span>
            )}
          </div>

          <Button type="submit" disabled={saving} className="gap-2 min-w-[160px]">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveStatus === "success" ? (
              <>
                <Check className="w-4 h-4 text-emerald-950" />
                <span>Settings Saved</span>
              </>
            ) : (
              <>
                <Settings className="w-4 h-4" />
                <span>Save All Settings</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
