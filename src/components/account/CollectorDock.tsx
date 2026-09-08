"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  AnimatePresence,
} from "motion/react";
import {
  LayoutDashboard,
  Palette,
  Layers,
  Calendar,
  Mail,
  Sparkles,
  User,
  Pin,
  PinOff,
  ChevronRight,
  ShoppingBag,
} from "lucide-react";
import { Dock, DockIcon } from "@/components/magicui/dock";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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
  cartCount?: number;
  onOpenCart?: () => void;
}

interface DockItemConfig {
  id: CollectorTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const PRIMARY_NAV_ITEMS: DockItemConfig[] = [
  { id: "overview", label: "Collector Overview", icon: LayoutDashboard },
  { id: "gallery", label: "Private Catalogue", icon: Palette },
  { id: "collections", label: "Curated Series & Suites", icon: Layers },
  { id: "exhibitions", label: "Exhibitions & Vernissages", icon: Calendar },
  { id: "inquiries", label: "Acquisition Inquiries", icon: Mail },
];

const SECONDARY_NAV_ITEMS: DockItemConfig[] = [
  { id: "ar", label: "Spatial AR Showroom", icon: Sparkles },
  { id: "profile", label: "Collector Profile & Settings", icon: User },
];

export function CollectorDock({
  activeTab,
  onTabChange,
  inquiriesCount = 0,
  cartCount = 0,
  onOpenCart,
}: CollectorDockProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(true);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Restore pinned preference from localStorage
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem("atelier-collector-dock-pinned");
      if (savedPin !== null) {
        setIsPinned(savedPin === "true");
      }
    } catch {
      // ignore SSR
    }
  }, []);

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("atelier-collector-dock-pinned", String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  const handleMouseEnter = () => {
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current);
      exitTimeoutRef.current = null;
    }
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    exitTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 320); // Grace window
  };

  const isVisible = isPinned || isHovered;

  return (
    <TooltipProvider>
      {/* 1. Invisible Left-Edge Hit Sensor Zone (Desktop only) */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden md:block fixed left-0 top-0 bottom-0 w-4 md:w-5 z-40 pointer-events-auto"
        aria-hidden="true"
      />

      {/* 2. Visual Peek Tab Indicator when Hidden (Desktop only) */}
      <AnimatePresence>
        {!isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={handleMouseEnter}
            className="hidden md:flex fixed left-0 top-1/2 -translate-y-1/2 z-40 items-center group cursor-pointer"
            title="Hover to reveal navigation dock"
          >
            <div className="h-16 w-2.5 bg-[#d1a86e]/30 group-hover:bg-[#d1a86e] rounded-r-md transition-all duration-200 group-hover:w-3.5 shadow-lg shadow-black/60 flex items-center justify-center">
              <ChevronRight className="w-2.5 h-2.5 text-[#0d0e12] opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Floating Vertical Dock on Left */}
      <motion.nav
        aria-label="Collector Navigation Dock"
        initial={false}
        animate={{
          x: isVisible ? 0 : -140,
          opacity: isVisible ? 1 : 0,
          pointerEvents: isVisible ? "auto" : "none",
        }}
        transition={{
          type: "spring",
          stiffness: 340,
          damping: 30,
        }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="hidden md:flex fixed left-3 sm:left-4 top-1/2 -translate-y-1/2 z-50 flex-col items-center select-none"
      >
        <Dock
          orientation="vertical"
          iconSize={40}
          iconMagnification={46}
          iconDistance={65}
          className="bg-[#0b0c10]/95 border-[#262835] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-2xl py-2.5 px-2 gap-1"
        >
          {/* Primary Hub Items */}
          {PRIMARY_NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            const badgeCount = item.id === "inquiries" ? inquiriesCount : undefined;

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className="focus:outline-none"
                    aria-label={item.label}
                    aria-pressed={isActive}
                  >
                    <DockIcon
                      className={cn(
                        "relative border transition-all duration-200",
                        isActive
                          ? "bg-[#1f212c] border-[#d1a86e] text-white shadow-lg shadow-[#d1a86e]/15"
                          : "bg-[#121318] border-transparent text-zinc-400 hover:text-white hover:bg-[#1a1c24] hover:border-[#2b2d38]"
                      )}
                    >
                      {/* Active indicator dot on left edge of icon */}
                      {isActive && (
                        <span className="absolute left-1 w-1 h-3.5 bg-[#d1a86e] rounded-full" />
                      )}

                      <Icon
                        className={cn(
                          "w-4.5 h-4.5 transition-colors",
                          isActive ? "text-[#d1a86e]" : "text-zinc-400 hover:text-white"
                        )}
                      />

                      {/* Inquiry notification badge pill */}
                      {badgeCount !== undefined && badgeCount > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#d1a86e] text-[9px] font-bold text-[#0d0e12] ring-2 ring-[#0b0c10]">
                          {badgeCount}
                        </span>
                      )}
                    </DockIcon>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.label}</span>
                    {badgeCount !== undefined && badgeCount > 0 && (
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-[#d1a86e]/40 text-[#d1a86e]">
                        {badgeCount} active
                      </Badge>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Acquisition Dossier (Cart) Trigger */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={onOpenCart}
                className="focus:outline-none"
                aria-label="Acquisition Portfolio Dossier"
              >
                <DockIcon
                  className={cn(
                    "relative border transition-all duration-200",
                    cartCount > 0
                      ? "bg-[#181a24] border-[#d1a86e]/60 text-white shadow-lg shadow-[#d1a86e]/20"
                      : "bg-[#121318] border-transparent text-zinc-400 hover:text-white hover:bg-[#1a1c24] hover:border-[#2b2d38]"
                  )}
                >
                  <ShoppingBag
                    className={cn(
                      "w-4.5 h-4.5 transition-colors",
                      cartCount > 0 ? "text-[#d1a86e]" : "text-zinc-400 hover:text-white"
                    )}
                  />

                  {/* Cart count badge */}
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#d1a86e] text-[9px] font-bold text-[#0d0e12] ring-2 ring-[#0b0c10]">
                      {cartCount}
                    </span>
                  )}
                </DockIcon>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="flex items-center gap-2">
                <span className="font-medium">Acquisition Dossier (Cart)</span>
                {cartCount > 0 ? (
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-[#d1a86e]/40 text-[#d1a86e]">
                    {cartCount} selected
                  </Badge>
                ) : (
                  <span className="text-[10px] text-zinc-400">Empty</span>
                )}
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Subtle Divider */}
          <div className="w-6 h-[1px] bg-[#22242e] my-1" />

          {/* Secondary Studio Items (AR & Profile) */}
          {SECONDARY_NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <Tooltip key={item.id}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => onTabChange(item.id)}
                    className="focus:outline-none"
                    aria-label={item.label}
                    aria-pressed={isActive}
                  >
                    <DockIcon
                      className={cn(
                        "relative border transition-all duration-200",
                        isActive
                          ? "bg-[#1f212c] border-[#d1a86e] text-white shadow-lg shadow-[#d1a86e]/15"
                          : "bg-[#121318] border-transparent text-zinc-400 hover:text-white hover:bg-[#1a1c24] hover:border-[#2b2d38]"
                      )}
                    >
                      {isActive && (
                        <span className="absolute left-1 w-1 h-3.5 bg-[#d1a86e] rounded-full" />
                      )}

                      <Icon
                        className={cn(
                          "w-4.5 h-4.5 transition-colors",
                          isActive ? "text-[#d1a86e]" : "text-zinc-400 hover:text-white"
                        )}
                      />
                    </DockIcon>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span className="font-medium">{item.label}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Subtle Divider */}
          <div className="w-6 h-[1px] bg-[#22242e] my-1" />

          {/* Pin / Auto-Hide Lock Toggle */}
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={togglePin}
                className="focus:outline-none"
                aria-label={isPinned ? "Unpin Dock (Auto-hide on hover)" : "Pin Dock (Keep visible)"}
              >
                <DockIcon
                  className={cn(
                    "border transition-all duration-200",
                    isPinned
                      ? "bg-[#d1a86e]/15 border-[#d1a86e]/40 text-[#d1a86e]"
                      : "bg-[#121318] border-transparent text-zinc-500 hover:text-zinc-300 hover:bg-[#1a1c24]"
                  )}
                >
                  {isPinned ? (
                    <PinOff className="w-3.5 h-3.5" />
                  ) : (
                    <Pin className="w-3.5 h-3.5" />
                  )}
                </DockIcon>
              </button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>{isPinned ? "Unpin (Auto-hide when unhovered)" : "Pin Dock (Keep visible)"}</span>
            </TooltipContent>
          </Tooltip>
        </Dock>
      </motion.nav>

      {/* 4. Mobile Floating Bottom Navigation Dock (< 768px) */}
      <nav
        aria-label="Mobile Collector Navigation"
        className="md:hidden fixed bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-lg bg-[#0c0d12]/92 backdrop-blur-2xl border border-[#262835] rounded-2xl p-1.5 shadow-2xl shadow-black/90 flex items-center justify-between"
      >
        {[...PRIMARY_NAV_ITEMS, ...SECONDARY_NAV_ITEMS].map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          const badgeCount = item.id === "inquiries" ? inquiriesCount : undefined;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "relative flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer",
                isActive
                  ? "bg-[#1f212c] text-[#d1a86e] font-semibold shadow-sm shadow-[#d1a86e]/10"
                  : "text-zinc-400 hover:text-zinc-200"
              )}
              aria-label={item.label}
              title={item.label}
            >
              <div className="relative">
                <Icon className={cn("w-4 h-4 transition-transform", isActive && "scale-110 text-[#d1a86e]")} />
                {badgeCount !== undefined && badgeCount > 0 && (
                  <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-[#d1a86e] text-[8px] font-bold text-[#0d0e12]">
                    {badgeCount}
                  </span>
                )}
              </div>
              {isActive && (
                <span className="w-1 h-1 rounded-full bg-[#d1a86e] mt-1" />
              )}
            </button>
          );
        })}

        {/* Mobile Dossier / Cart Trigger */}
        <button
          onClick={onOpenCart}
          className={cn(
            "relative flex-1 py-2 px-1 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer",
            cartCount > 0 ? "text-[#d1a86e]" : "text-zinc-400 hover:text-zinc-200"
          )}
          aria-label="Acquisition Dossier"
          title="Acquisition Dossier"
        >
          <div className="relative">
            <ShoppingBag className={cn("w-4 h-4", cartCount > 0 && "text-[#d1a86e]")} />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1.5 flex h-3.5 min-w-3.5 px-0.5 items-center justify-center rounded-full bg-[#d1a86e] text-[8px] font-bold text-[#0d0e12]">
                {cartCount}
              </span>
            )}
          </div>
        </button>
      </nav>
    </TooltipProvider>
  );
}
