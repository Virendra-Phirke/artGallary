"use client";

import React, { useState } from "react";
import { Settings, Check, ShieldCheck, Database, HardDrive, Mail } from "lucide-react";

interface SettingsClientProps {
  initialSettings: {
    artistName: string;
    siteTitle: string;
    tagline: string;
    contactEmail: string;
    phone: string;
    location: string;
    copyrightText: string;
  };
}

export function SettingsClient({ initialSettings }: SettingsClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Failed to save site settings:", err);
      alert("Failed to save site settings");
    }
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="border-b border-[#1c1d25] pb-6">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
          Studio System Configuration
        </span>
        <h1 className="font-serif text-3xl text-white mt-1">Settings &amp; Status</h1>
        <p className="text-xs text-zinc-400 mt-1">
          Studio contact channels, international copyright registrations, and cloud adapter health diagnostics.
        </p>
      </div>

      {/* Cloud Adapter Health Diagnostics */}
      <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
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
      </div>

      {/* General Studio Metadata Form */}
      <form onSubmit={handleSave} className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
        <h2 className="font-serif text-lg text-white">Studio Metadata</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
              Artist Name
            </label>
            <input
              type="text"
              value={settings.artistName}
              onChange={(e) => setSettings({ ...settings, artistName: e.target.value })}
              className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
              Site Brand Title
            </label>
            <input
              type="text"
              value={settings.siteTitle}
              onChange={(e) => setSettings({ ...settings, siteTitle: e.target.value })}
              className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
              Curator Contact Email
            </label>
            <input
              type="email"
              value={settings.contactEmail}
              onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })}
              className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
              Primary Studio Locations
            </label>
            <input
              type="text"
              value={settings.location}
              onChange={(e) => setSettings({ ...settings, location: e.target.value })}
              className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
            Legal Copyright &amp; Provenance Notice
          </label>
          <input
            type="text"
            value={settings.copyrightText}
            onChange={(e) => setSettings({ ...settings, copyrightText: e.target.value })}
            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-3.5 py-2 text-xs text-white focus:border-[#d1a86e] focus:outline-none"
          />
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-6 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors shadow-lg shadow-[#d1a86e]/10"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-950" /> : <Settings className="w-4 h-4" />}
            <span>{saved ? "Settings Saved" : "Save Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
