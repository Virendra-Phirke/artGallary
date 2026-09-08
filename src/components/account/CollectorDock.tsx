"use client";

import React from "react";
import {
  LayoutDashboard,
  Palette,
  Layers,
  Calendar,
  Mail,
  Sparkles,
  User,
} from "lucide-react";
import { Dock, DockIcon } from "@/components/magicui/dock";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type CollectorTab =
  | "overview"
  | "gallery"
  | "collections"
  | "exhibitions"
  | "inquiries"
  | "ar"
  | "profile";

interface CollectorDockProps {
  activeTab: CollectorTab;
  onTabChange: (tab: CollectorTab) => void;
  inquiriesCount?: number;
}

interface DockItemConfig {
  id: CollectorTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const DOCK_ITEMS: DockItemConfig[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "gallery", label: "Gallery Catalog", icon: Palette },
  { id: "collections", label: "Series & Collections", icon: Layers },
  { id: "exhibitions", label: "Exhibitions & Vernissages", icon: Calendar },
  { id: "inquiries", label: "Acquisitions Ledger", icon: Mail },
  { id: "ar", label: "Spatial AR Showroom", icon: Sparkles },
  { id: "profile", label: "Collector Profile", icon: User },
];

export function CollectorDock({
  activeTab,
  onTabChange,
  inquiriesCount = 0,
}: CollectorDockProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-[95vw]">
      <TooltipProvider>
        <Dock
          orientation="horizontal"
          iconSize={42}
          iconMagnification={54}
          iconDistance={65}
          className="bg-[#121318]/95 backdrop-blur-2xl border border-[#2b2e3c] shadow-[0_12px_40px_rgba(0,0,0,0.8)] px-3.5 py-2.5 rounded-2xl gap-2 sm:gap-3"
        >
          {DOCK_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const badgeCount = item.id === "inquiries" ? inquiriesCount : undefined;

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className={cn(
                      "relative flex items-center justify-center rounded-xl p-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d1a86e]",
                      isActive
                        ? "bg-[#d1a86e] text-[#0d0e12] shadow-lg shadow-[#d1a86e]/25 font-semibold"
                        : "text-zinc-400 hover:text-white hover:bg-[#1f212c]"
                    )}
                    aria-label={item.label}
                    aria-pressed={isActive}
                  >
                    <DockIcon
                      size={22}
                      magnification={28}
                      className={cn(
                        "transition-transform",
                        isActive ? "text-[#0d0e12]" : "text-zinc-300"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                    </DockIcon>

                    {/* Badge Count (e.g. Inquiries) */}
                    {badgeCount !== undefined && badgeCount > 0 && (
                      <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-[9px] font-mono font-bold rounded-full bg-[#d1a86e] text-[#0d0e12] border border-[#0d0e12] shadow-sm">
                        {badgeCount}
                      </span>
                    )}

                    {/* Active Indicator Pip */}
                    {isActive && (
                      <span className="absolute -bottom-1.5 w-1.5 h-1.5 rounded-full bg-[#d1a86e] shadow-sm" />
                    )}
                  </button>
                </TooltipTrigger>
                <TooltipContent
                  side="top"
                  className="bg-[#181920] border border-[#2b2e3c] text-zinc-200 text-xs px-3 py-1.5 rounded-lg shadow-xl font-medium tracking-wide uppercase text-[10px]"
                >
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </Dock>
      </TooltipProvider>
    </div>
  );
}
