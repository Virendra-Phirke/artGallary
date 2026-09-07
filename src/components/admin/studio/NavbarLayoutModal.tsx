"use client";

import React, { useState } from "react";
import type { SiteSettingsData } from "@/db/mockData";
import {
  X,
  MoveUp,
  MoveDown,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  Check,
  Compass,
  Layout,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface NavbarLayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteSettings: SiteSettingsData;
  onUpdateSettings: (settings: SiteSettingsData) => void;
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function NavbarLayoutModal({
  isOpen,
  onClose,
  siteSettings,
  onUpdateSettings,
  onSave,
  isSaving,
}: NavbarLayoutModalProps) {
  const [activeSubTab, setActiveSubTab] = useState<"items" | "layout" | "announcement">("items");

  if (!isOpen) return null;

  const navItems = siteSettings.navigationItems || [];

  const handleMove = (index: number, direction: "up" | "down") => {
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= navItems.length) return;

    const items = [...navItems];
    const temp = items[index]!;
    items[index] = items[target]!;
    items[target] = temp;

    const reordered = items.map((it, idx) => ({ ...it, order: idx + 1 }));
    onUpdateSettings({ ...siteSettings, navigationItems: reordered });
  };

  const handleToggleVisibility = (id: string) => {
    const updated = navItems.map((it) =>
      it.id === id ? { ...it, isEnabled: !it.isEnabled } : it
    );
    onUpdateSettings({ ...siteSettings, navigationItems: updated });
  };

  const handleUpdateItem = (
    id: string,
    updates: Partial<SiteSettingsData["navigationItems"][number]>
  ) => {
    const updated = navItems.map((it) =>
      it.id === id ? { ...it, ...updates } : it
    );
    onUpdateSettings({ ...siteSettings, navigationItems: updated });
  };

  const handleAddItem = () => {
    const newId = `nav-${Date.now()}`;
    const newItem = {
      id: newId,
      label: "New Page",
      href: "/custom",
      isEnabled: true,
      order: navItems.length + 1,
      openInNewTab: false,
    };
    onUpdateSettings({
      ...siteSettings,
      navigationItems: [...navItems, newItem],
    });
  };

  const handleDeleteItem = (id: string) => {
    const updated = navItems.filter((it) => it.id !== id);
    onUpdateSettings({ ...siteSettings, navigationItems: updated });
  };

  const handleHeaderConfigChange = (field: string, value: any) => {
    onUpdateSettings({
      ...siteSettings,
      headerConfig: {
        ...siteSettings.headerConfig,
        [field]: value,
      },
    });
  };

  const handleAnnouncementChange = (field: string, value: any) => {
    onUpdateSettings({
      ...siteSettings,
      announcementBar: {
        ...siteSettings.announcementBar,
        [field]: value,
      },
    });
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#121317] border border-[#262833] rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#262833] flex items-center justify-between bg-[#16171d]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#d1a86e]/10 border border-[#d1a86e]/30 flex items-center justify-center text-[#d1a86e]">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg text-white font-medium">
                  Navbar &amp; Header Architecture
                </h3>
                <Badge className="bg-[#d1a86e]/15 text-[#d1a86e] border-[#d1a86e]/30 text-[10px]">
                  Storefront Navigation
                </Badge>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Manage the order, visible links, and layout presentation of your customer-facing navigation bar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-tab Navigation */}
        <div className="flex border-b border-[#262833] bg-[#14151a] px-5 gap-4 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveSubTab("items")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === "items"
                ? "border-[#d1a86e] text-[#d1a86e] font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Navigation Links ({navItems.filter((i) => i.isEnabled).length}/{navItems.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("layout")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === "layout"
                ? "border-[#d1a86e] text-[#d1a86e] font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Navbar Layout &amp; Style</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab("announcement")}
            className={`py-3 border-b-2 transition-all flex items-center gap-1.5 ${
              activeSubTab === "announcement"
                ? "border-[#d1a86e] text-[#d1a86e] font-semibold"
                : "border-transparent text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <span>Announcement Bar</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* TAB 1: NAVIGATION ITEMS */}
          {activeSubTab === "items" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-white">Storefront Menu Links</h4>
                  <p className="text-xs text-zinc-400">
                    Arrange the items that appear in the public top bar. Move items up or down to reorder.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleAddItem}
                  size="sm"
                  variant="outline"
                  className="border-[#262833] hover:border-[#d1a86e] text-xs text-zinc-200 gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>Add Link</span>
                </Button>
              </div>

              {/* Items List */}
              <div className="space-y-2.5">
                {navItems.map((item, index) => (
                  <div
                    key={item.id}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                      item.isEnabled
                        ? "bg-[#161820] border-[#262833]"
                        : "bg-[#14151a]/60 border-[#1e2029] opacity-60"
                    }`}
                  >
                    {/* Reorder Buttons */}
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleMove(index, "up")}
                        disabled={index === 0}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Up"
                      >
                        <MoveUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMove(index, "down")}
                        disabled={index === navItems.length - 1}
                        className="p-1 rounded text-zinc-400 hover:text-white hover:bg-zinc-800 disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Down"
                      >
                        <MoveDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Order indicator */}
                    <span className="w-5 text-center text-xs font-mono text-zinc-500">
                      {index + 1}
                    </span>

                    {/* Label Input */}
                    <div className="flex-1 min-w-[120px]">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">
                        Label
                      </label>
                      <Input
                        value={item.label}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { label: e.target.value })
                        }
                        placeholder="Link Label"
                        className="h-8 bg-[#101115] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
                      />
                    </div>

                    {/* URL Route Input */}
                    <div className="flex-1 min-w-[140px]">
                      <label className="text-[10px] uppercase tracking-wider text-zinc-500 block mb-0.5">
                        Path / Route
                      </label>
                      <Input
                        value={item.href}
                        onChange={(e) =>
                          handleUpdateItem(item.id, { href: e.target.value })
                        }
                        placeholder="/route"
                        className="h-8 bg-[#101115] border-[#262833] text-xs text-zinc-300 font-mono focus:border-[#d1a86e]"
                      />
                    </div>

                    {/* Visibility Toggle */}
                    <div className="shrink-0 pt-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleVisibility(item.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          item.isEnabled
                            ? "bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900/80 border border-emerald-800/50"
                            : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                        }`}
                        title={item.isEnabled ? "Visible on Storefront" : "Hidden"}
                      >
                        {item.isEnabled ? (
                          <Eye className="w-3.5 h-3.5" />
                        ) : (
                          <EyeOff className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    {/* Delete button (for items after basic primary ones) */}
                    {navItems.length > 3 && (
                      <div className="shrink-0 pt-3.5">
                        <button
                          type="button"
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-rose-950/30 transition-colors"
                          title="Delete Link"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: NAVBAR LAYOUT & STYLE */}
          {activeSubTab === "layout" && (
            <div className="space-y-6">
              {/* Header Style Selector */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                  Storefront Header Presentation Preset
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    {
                      id: "transparent",
                      title: "Standard Editorial",
                      desc: "Brand on left, navigation on right, glass blur overlay on scroll.",
                    },
                    {
                      id: "sticky",
                      title: "Sticky Solid Bar",
                      desc: "High-contrast anchored bar with fine border line, permanently fixed.",
                    },
                    {
                      id: "solid",
                      title: "Minimalist Floating Pill",
                      desc: "Floating centered glass pill with rounded corners and subtle shadow.",
                    },
                  ].map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleHeaderConfigChange("style", preset.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all space-y-1.5 ${
                        siteSettings.headerConfig.style === preset.id
                          ? "bg-[#d1a86e]/10 border-[#d1a86e] text-white"
                          : "bg-[#161820] border-[#262833] text-zinc-400 hover:border-zinc-600"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-medium text-white">{preset.title}</span>
                        {siteSettings.headerConfig.style === preset.id && (
                          <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Inquiry Action Button on Navbar */}
              <div className="p-4 rounded-xl bg-[#161820] border border-[#262833] space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-white">Header Action Button (CTA)</h5>
                    <p className="text-[11px] text-zinc-400">
                      Show a prominent acquisition or contact button in the storefront header.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteSettings.headerConfig.showCta}
                      onChange={(e) =>
                        handleHeaderConfigChange("showCta", e.target.checked)
                      }
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d1a86e]"></div>
                  </label>
                </div>

                {siteSettings.headerConfig.showCta && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                        Button Label
                      </label>
                      <Input
                        value={siteSettings.headerConfig.ctaLabel || "Inquire"}
                        onChange={(e) =>
                          handleHeaderConfigChange("ctaLabel", e.target.value)
                        }
                        placeholder="Inquire / Private Viewing"
                        className="h-8 bg-[#101115] border-[#262833] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                        Target Destination URL
                      </label>
                      <Input
                        value={siteSettings.headerConfig.ctaUrl || "/contact"}
                        onChange={(e) =>
                          handleHeaderConfigChange("ctaUrl", e.target.value)
                        }
                        placeholder="/contact"
                        className="h-8 bg-[#101115] border-[#262833] text-xs text-zinc-300 font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ANNOUNCEMENT BAR */}
          {activeSubTab === "announcement" && (
            <div className="p-4 rounded-xl bg-[#161820] border border-[#262833] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h5 className="text-xs font-semibold text-white">Storefront Announcement Bar</h5>
                  <p className="text-[11px] text-zinc-400">
                    Display a subtle, high-priority announcement line above the main navbar.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={siteSettings.announcementBar.isEnabled}
                    onChange={(e) =>
                      handleAnnouncementChange("isEnabled", e.target.checked)
                    }
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d1a86e]"></div>
                </label>
              </div>

              {siteSettings.announcementBar.isEnabled && (
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                      Announcement Text
                    </label>
                    <Input
                      value={siteSettings.announcementBar.message}
                      onChange={(e) =>
                        handleAnnouncementChange("message", e.target.value)
                      }
                      placeholder="e.g. Spring 2026 Solo Exhibition Opening in Paris"
                      className="h-8 bg-[#101115] border-[#262833] text-xs text-white"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                        Optional Action Label
                      </label>
                      <Input
                        value={siteSettings.announcementBar.linkLabel || ""}
                        onChange={(e) =>
                          handleAnnouncementChange("linkLabel", e.target.value)
                        }
                        placeholder="View Catalogue"
                        className="h-8 bg-[#101115] border-[#262833] text-xs text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
                        Link Destination
                      </label>
                      <Input
                        value={siteSettings.announcementBar.link || ""}
                        onChange={(e) =>
                          handleAnnouncementChange("link", e.target.value)
                        }
                        placeholder="/gallery"
                        className="h-8 bg-[#101115] border-[#262833] text-xs text-zinc-300 font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#262833] bg-[#16171d] flex items-center justify-between">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-xs text-zinc-400 hover:text-white"
          >
            Cancel
          </Button>

          <Button
            type="button"
            onClick={async () => {
              await onSave();
              onClose();
            }}
            disabled={isSaving}
            size="sm"
            className="bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs gap-1.5 shadow-md shadow-[#d1a86e]/15"
          >
            {isSaving ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            <span>{isSaving ? "Saving..." : "Apply & Save Navbar Layout"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
