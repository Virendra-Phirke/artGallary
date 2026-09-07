"use client";

import React from "react";
import Link from "next/link";
import type { SiteSettingsData } from "@/db/mockData";
import {
  LayoutGrid,
  Sparkles,
  ExternalLink,
  Plus,
  Layers,
  Eye,
  Sliders,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface GalleryPageEditorProps {
  settings: SiteSettingsData;
  onUpdateConfig: (field: string, value: any) => void;
  artworksCount: number;
}

export function GalleryPageEditor({
  settings,
  onUpdateConfig,
  artworksCount,
}: GalleryPageEditorProps) {
  const cfg = settings.galleryPageConfig || {
    title: "Curated Artwork Gallery",
    subtitle: "Permanent & Contemporary Works",
    description: "",
    defaultLayout: "grid",
    enabledFilters: {
      medium: true,
      price: true,
      year: true,
      availability: true,
      collection: true,
    },
    defaultSort: "featured",
  };

  const handleFilterToggle = (key: string, val: boolean) => {
    onUpdateConfig("enabledFilters", {
      ...cfg.enabledFilters,
      [key]: val,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Actions */}
      <div className="p-4 rounded-2xl bg-[#14151a] border border-[#262833] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#d1a86e] font-semibold">
              Public Catalogue Curation
            </span>
            <Badge className="bg-emerald-950/60 text-emerald-400 border-emerald-800/50 text-[10px]">
              {artworksCount} Works Published
            </Badge>
          </div>
          <h3 className="font-serif text-lg text-white font-medium mt-0.5">
            Gallery Page Parameters
          </h3>
          <p className="text-xs text-zinc-400">
            Changes made here update the public <code className="text-[#d1a86e] font-mono">/gallery</code> layout in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" variant="outline" className="border-[#262833] text-xs text-zinc-300 hover:text-white">
            <Link href="/admin/artworks">
              <Layers className="w-3.5 h-3.5 mr-1.5 text-[#d1a86e]" />
              <span>Manage Artworks</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs">
            <Link href="/admin/artworks/new">
              <Plus className="w-3.5 h-3.5 mr-1" />
              <span>Add Piece</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Curatorial Headline & Statement */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Gallery Entrance &amp; Statement
        </h4>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Catalogue Eyebrow / Subtitle
            </label>
            <Input
              value={cfg.subtitle || ""}
              onChange={(e) => onUpdateConfig("subtitle", e.target.value)}
              placeholder="e.g. The Studio Catalogue"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Primary Headline / Title
            </label>
            <Input
              value={cfg.title || ""}
              onChange={(e) => onUpdateConfig("title", e.target.value)}
              placeholder="e.g. Original Canvases & Mineral Glazes"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Curatorial Statement / Description
            </label>
            <Textarea
              rows={3}
              value={cfg.description || ""}
              onChange={(e) => onUpdateConfig("description", e.target.value)}
              placeholder="Provide context regarding the media, pigments, provenance, and spatial preview options..."
              className="bg-[#181920] border-[#262833] text-xs text-zinc-300 focus:border-[#d1a86e] leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Grid Layout Preset Selection */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
          Default Artwork Layout Preset
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              id: "grid",
              title: "Classic Grid",
              desc: "Balanced 3-column museum proportioned cards.",
            },
            {
              id: "masonry",
              title: "Masonry Wall",
              desc: "Dynamic aspect ratio pinboard preserving canvas ratios.",
            },
            {
              id: "editorial",
              title: "Editorial Stagger",
              desc: "Generous whitespace with alternating focal pieces.",
            },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onUpdateConfig("defaultLayout", item.id)}
              className={`p-3 rounded-xl border text-left transition-all ${
                cfg.defaultLayout === item.id
                  ? "bg-[#d1a86e]/10 border-[#d1a86e] text-white shadow-sm"
                  : "bg-[#181920] border-[#262833] text-zinc-400 hover:border-zinc-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white">{item.title}</span>
                {cfg.defaultLayout === item.id && (
                  <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
                )}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{item.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Storefront Filters & Badges */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Storefront Card Options &amp; Filters
        </h4>

        <div className="space-y-2.5">
          {[
            {
              key: "price",
              label: "Display Acquisition Prices",
              desc: "Show prices and currency on public artwork cards.",
            },
            {
              key: "medium",
              label: "Filter by Medium / Category",
              desc: "Allow collectors to filter canvases, oils, watercolors, sculptures.",
            },
            {
              key: "availability",
              label: "Filter by Availability Status",
              desc: "Show Available, Reserved, and Archive filter options.",
            },
            {
              key: "collection",
              label: "Filter by Curated Series",
              desc: "Enable series/collection dropdown in the gallery navigation bar.",
            },
          ].map((toggle) => {
            const isChecked = Boolean(cfg.enabledFilters?.[toggle.key as keyof typeof cfg.enabledFilters]);
            return (
              <div
                key={toggle.key}
                className="flex items-center justify-between p-3 rounded-xl bg-[#181920] border border-[#262833]"
              >
                <div>
                  <span className="text-xs font-medium text-white block">{toggle.label}</span>
                  <span className="text-[11px] text-zinc-400">{toggle.desc}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleFilterToggle(toggle.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d1a86e]"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
