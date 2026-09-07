"use client";

import React from "react";
import Image from "next/image";
import type { SiteSettingsData } from "@/db/mockData";
import {
  BookOpen,
  Upload,
  Layers,
  Sparkles,
  MapPin,
  Clock,
  User,
  Quote,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface AboutPageEditorProps {
  settings: SiteSettingsData;
  onUpdateSetting: <K extends keyof SiteSettingsData>(key: K, value: SiteSettingsData[K]) => void;
  onUpdateAboutConfig: (field: string, value: any) => void;
  onOpenMediaPicker: () => void;
}

export function AboutPageEditor({
  settings,
  onUpdateSetting,
  onUpdateAboutConfig,
  onOpenMediaPicker,
}: AboutPageEditorProps) {
  const cfg = settings.aboutPageConfig || {};
  const portraitUrl = cfg.artistImageUrl || "";

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#14151a] border border-[#262833] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#d1a86e] font-semibold">
              Artist Monologue &amp; Biography
            </span>
            <Badge className="bg-[#d1a86e]/15 text-[#d1a86e] border-[#d1a86e]/30 text-[10px]">
              The Artist Page
            </Badge>
          </div>
          <h3 className="font-serif text-lg text-white font-medium mt-0.5">
            About the Artist &amp; Studio
          </h3>
          <p className="text-xs text-zinc-400">
            Control the biographical story, artist statement, and portrait image on <code className="text-[#d1a86e] font-mono">/about</code>.
          </p>
        </div>
      </div>

      {/* Artist Portrait Setup */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Artist Studio Portrait
        </h4>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="relative w-24 h-28 sm:w-28 sm:h-32 rounded-xl overflow-hidden border border-[#262833] bg-black/40 shrink-0 shadow-lg">
            {portraitUrl ? (
              <Image
                src={portraitUrl}
                alt={settings.artistName || "Artist"}
                fill
                sizes="120px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600">
                <User className="w-8 h-8" />
                <span className="text-[9px] mt-1">No Image</span>
              </div>
            )}
          </div>

          <div className="space-y-2 flex-1 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                onClick={onOpenMediaPicker}
                size="sm"
                className="bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs gap-1.5"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Select from Media Library</span>
              </Button>
              {portraitUrl && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onUpdateAboutConfig("artistImageUrl", "")}
                  className="border-[#262833] text-xs text-zinc-400 hover:text-rose-400"
                >
                  Clear Image
                </Button>
              )}
            </div>
            <div>
              <Input
                value={portraitUrl}
                onChange={(e) => onUpdateAboutConfig("artistImageUrl", e.target.value)}
                placeholder="Or paste direct image URL (ImageKit / CDN)..."
                className="bg-[#181920] border-[#262833] text-xs text-zinc-300 focus:border-[#d1a86e]"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Artist Identity & Monologue */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Artist Credentials &amp; Statement
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Artist Display Name
            </label>
            <Input
              value={settings.artistName}
              onChange={(e) => onUpdateSetting("artistName", e.target.value)}
              placeholder="Elena Vance"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Headline / Intro
            </label>
            <Input
              value={cfg.intro || settings.tagline || ""}
              onChange={(e) => {
                onUpdateAboutConfig("intro", e.target.value);
                onUpdateSetting("tagline", e.target.value);
              }}
              placeholder="Contemporary Fine Artist"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
            Short Biographical Summary
          </label>
          <Textarea
            rows={2}
            value={cfg.bio || settings.bioSummary || ""}
            onChange={(e) => {
              onUpdateAboutConfig("bio", e.target.value);
              onUpdateSetting("bioSummary", e.target.value);
            }}
            placeholder="A concise synopsis of the artist's training, medium specialization, and creative vision..."
            className="bg-[#181920] border-[#262833] text-xs text-zinc-300 focus:border-[#d1a86e]"
          />
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
            Curatorial Artist Statement
          </label>
          <Textarea
            rows={4}
            value={cfg.story || settings.statement || ""}
            onChange={(e) => {
              onUpdateAboutConfig("story", e.target.value);
              onUpdateSetting("statement", e.target.value);
            }}
            placeholder="Elena Vance explores the threshold where mineral glazes, raw Belgian linen, and oceanic quietude meet..."
            className="bg-[#181920] border-[#262833] text-xs text-zinc-300 focus:border-[#d1a86e] leading-relaxed"
          />
        </div>
      </div>

      {/* Studio Location & Presences */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Studio Atelier &amp; Appointments
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Studio Location
            </label>
            <Input
              value={settings.location || ""}
              onChange={(e) => onUpdateSetting("location", e.target.value)}
              placeholder="Paris & Brittany, France"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Visiting &amp; Viewing Hours
            </label>
            <Input
              value={settings.businessHours || ""}
              onChange={(e) => onUpdateSetting("businessHours", e.target.value)}
              placeholder="Monday – Saturday (By Appointment)"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
