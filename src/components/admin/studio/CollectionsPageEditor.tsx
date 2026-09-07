"use client";

import React from "react";
import Link from "next/link";
import type { SiteSettingsData } from "@/db/mockData";
import {
  FolderKanban,
  ExternalLink,
  Plus,
  Layers,
  Sparkles,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CollectionsPageEditorProps {
  settings: SiteSettingsData;
  onUpdateConfig: (field: string, value: any) => void;
  collectionsCount: number;
}

export function CollectionsPageEditor({
  settings,
  onUpdateConfig,
  collectionsCount,
}: CollectionsPageEditorProps) {
  const cfg = settings.collectionsPageConfig || {
    title: "Curated Series",
    subtitle: "Thematic Bodies of Work",
    description: "Elena Vance groups her artistic inquiries into multi-year cycles. Each series represents a focused exploration of specific pigments, geological binders, and spatial tensions.",
    eyebrow: "Thematic Bodies of Work",
  };

  return (
    <div className="space-y-5">
      {/* Top Banner & Quick Actions */}
      <div className="p-4 rounded-2xl bg-[#14151a] border border-[#262833] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#d1a86e] font-semibold">
              Curated Series Hub
            </span>
            <Badge className="bg-emerald-950/60 text-emerald-400 border-emerald-800/50 text-[10px]">
              {collectionsCount} Active Series
            </Badge>
          </div>
          <h3 className="font-serif text-lg text-white font-medium mt-0.5">
            Collections Page Parameters
          </h3>
          <p className="text-xs text-zinc-400">
            Control the editorial framing for public collections at <code className="text-[#d1a86e] font-mono">/collections</code>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" variant="outline" className="border-[#262833] text-xs text-zinc-300 hover:text-white">
            <Link href="/admin/collections">
              <FolderKanban className="w-3.5 h-3.5 mr-1.5 text-[#d1a86e]" />
              <span>Series Manager</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Hero Headline & Statement */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Curatorial Intro &amp; Statement
        </h4>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Eyebrow / Sub-headline
            </label>
            <Input
              value={cfg.eyebrow || ""}
              onChange={(e) => onUpdateConfig("eyebrow", e.target.value)}
              placeholder="e.g. Thematic Cycles & Explorations"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Page Title
            </label>
            <Input
              value={cfg.title || ""}
              onChange={(e) => onUpdateConfig("title", e.target.value)}
              placeholder="e.g. Curated Series"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Curatorial Description
            </label>
            <Textarea
              rows={3}
              value={cfg.description || ""}
              onChange={(e) => onUpdateConfig("description", e.target.value)}
              placeholder="Explain the artistic inquiries, cycles, and shared themes spanning the collections..."
              className="bg-[#181920] border-[#262833] text-xs text-zinc-300 focus:border-[#d1a86e] leading-relaxed"
            />
          </div>
        </div>
      </div>

      {/* Series Presentation Style */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-3">
        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300 block">
          Curated Series Presentation Style
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {[
            {
              id: "banner",
              title: "Cinematic Banners",
              desc: "Full-width immersive cover cards with overlay titles.",
            },
            {
              id: "grid",
              title: "2-Column Grid",
              desc: "Symmetric high-density showcase of all series.",
            },
            {
              id: "minimal",
              title: "Minimalist Catalogue",
              desc: "Understated typographic list with artwork thumbnails.",
            },
          ].map((item, idx) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border text-left transition-all ${
                idx === 0
                  ? "bg-[#d1a86e]/10 border-[#d1a86e] text-white shadow-sm"
                  : "bg-[#181920] border-[#262833] text-zinc-400"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-white">{item.title}</span>
                {idx === 0 && <Check className="w-3.5 h-3.5 text-[#d1a86e]" />}
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-snug">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
