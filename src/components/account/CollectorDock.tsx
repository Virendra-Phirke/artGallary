"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
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
  Menu,
  X,
  ArrowLeft,
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
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

  // Listen for mobile toggle event from CollectorNav
  useEffect(() => {
    const handleToggle = () => setIsMobileOpen((prev) => !prev);
    window.addEventListener("atelier-toggle-mobile-sidebar", handleToggle);
    return () => window.removeEventListener("atelier-toggle-mobile-sidebar", handleToggle);
  }, []);

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

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

  const handleMobileTabSelect = (tab: CollectorTab) => {
    onTabChange(tab);
    setIsMobileOpen(false);
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
          className="bg-[#111218] shadow-2xl shadow-black/90 rounded-2xl py-2.5 px-2 gap-1 border-0"
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
                        "relative transition-all duration-200 rounded-xl",
                        isActive
                          ? "bg-[#222432] text-white shadow-md shadow-black/40"
                          : "bg-[#161720] text-zinc-400 hover:text-white hover:bg-[#1d1f2b]"
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
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#d1a86e] text-[9px] font-bold text-[#0d0e12] ring-2 ring-[#111218]">
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
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-0 bg-[#222432] text-[#d1a86e]">
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
                    "relative transition-all duration-200 rounded-xl",
                    cartCount > 0
                      ? "bg-[#202230] text-white shadow-md shadow-black/40"
                      : "bg-[#161720] text-zinc-400 hover:text-white hover:bg-[#1d1f2b]"
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
                    <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#d1a86e] text-[9px] font-bold text-[#0d0e12] ring-2 ring-[#111218]">
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
                  <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 border-0 bg-[#222432] text-[#d1a86e]">
                    {cartCount} selected
                  </Badge>
                ) : (
                  <span className="text-[10px] text-zinc-400">Empty</span>
                )}
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Subtle Spacer Inset */}
          <div className="w-5 h-0.5 rounded-full bg-[#1c1d27] my-1" />

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
                        "relative transition-all duration-200 rounded-xl",
                        isActive
                          ? "bg-[#222432] text-white shadow-md shadow-black/40"
                          : "bg-[#161720] text-zinc-400 hover:text-white hover:bg-[#1d1f2b]"
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

          {/* Subtle Spacer Inset */}
          <div className="w-5 h-0.5 rounded-full bg-[#1c1d27] my-1" />

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
                    "transition-all duration-200 rounded-xl",
                    isPinned
                      ? "bg-[#222432] text-[#d1a86e]"
                      : "bg-[#161720] text-zinc-500 hover:text-zinc-300 hover:bg-[#1d1f2b]"
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

      {/* 4. Floating Mobile Trigger Button (< 768px) */}
      <div className="md:hidden fixed bottom-4 right-4 z-40">
        <button
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-[#151620]/95 backdrop-blur-md border border-white/15 active:scale-95 shadow-2xl shadow-black/90 text-white font-medium text-[11px] tracking-wider uppercase transition-all cursor-pointer group"
          aria-label={isMobileOpen ? "Close Salon Navigation" : "Open Salon Navigation"}
        >
          {isMobileOpen ? (
            <X className="w-3.5 h-3.5 text-[#d1a86e] transition-transform group-hover:rotate-90" />
          ) : (
            <Menu className="w-3.5 h-3.5 text-[#d1a86e]" />
          )}
          <span className="text-[11px] font-semibold text-zinc-200 group-hover:text-white">
            {isMobileOpen ? "Close" : "Menu"}
          </span>
          {inquiriesCount > 0 && (
            <span className="flex h-3.5 min-w-3.5 px-1 items-center justify-center rounded-full bg-[#d1a86e] text-[8px] font-bold text-[#0d0e12]">
              {inquiriesCount}
            </span>
          )}
        </button>
      </div>

      {/* 5. Mobile Sliding Sidebar Drawer & Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop Blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              onClick={() => setIsMobileOpen(false)}
              className="md:hidden fixed inset-0 bg-black/85 backdrop-blur-md z-[100] pointer-events-auto"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.85)" }}
              aria-hidden="true"
            />

            {/* Sliding Sidebar Panel */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 320 }}
              className="md:hidden fixed inset-y-0 left-0 w-[82%] max-w-[290px] bg-[#0d0e14] border-r border-white/10 z-[101] p-4 sm:p-5 flex flex-col justify-between shadow-2xl shadow-black overflow-y-auto"
              style={{ backgroundColor: "#0d0e14", opacity: 1 }}
              aria-label="Mobile Navigation Sidebar"
            >
              {/* Top Cluster & Navigation */}
              <div className="space-y-5">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-[#181923] flex items-center justify-center text-[#d1a86e] shadow-inner">
                      <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-serif text-xs tracking-[0.12em] font-medium text-white uppercase">
                        L&apos;Atelier
                      </span>
                      <span className="text-[8px] tracking-[0.2em] text-[#d1a86e] uppercase font-semibold">
                        Collector Suite
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="w-7 h-7 rounded-lg bg-[#181923] hover:bg-[#222430] flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                    aria-label="Close Navigation"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Primary Rooms List */}
                <div className="space-y-1">
                  <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-mono px-3 block mb-2">
                    Curatorial Rooms
                  </span>
                  {PRIMARY_NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;
                    const badgeCount = item.id === "inquiries" ? inquiriesCount : undefined;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMobileTabSelect(item.id)}
                        className={cn(
                          "w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
                          isActive
                            ? "bg-[#222432] text-[#d1a86e] font-semibold shadow-sm"
                            : "text-zinc-300 hover:text-white hover:bg-[#181923]"
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={cn("w-4 h-4", isActive ? "text-[#d1a86e]" : "text-zinc-400")} />
                          <span>{item.label}</span>
                        </div>
                        {badgeCount !== undefined && badgeCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-[#d1a86e] text-[10px] font-mono font-bold text-[#0d0e12]">
                            {badgeCount}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Secondary Studio Options */}
                <div className="space-y-1 pt-3">
                  <span className="text-[10px] tracking-[0.2em] text-zinc-500 uppercase font-mono px-3 block mb-2">
                    Studio Spatial
                  </span>
                  {SECONDARY_NAV_ITEMS.map((item) => {
                    const isActive = activeTab === item.id;
                    const Icon = item.icon;

                    return (
                      <button
                        key={item.id}
                        onClick={() => handleMobileTabSelect(item.id)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-xs font-medium transition-all text-left cursor-pointer",
                          isActive
                            ? "bg-[#222432] text-[#d1a86e] font-semibold shadow-sm"
                            : "text-zinc-300 hover:text-white hover:bg-[#181923]"
                        )}
                      >
                        <Icon className={cn("w-4 h-4", isActive ? "text-[#d1a86e]" : "text-zinc-400")} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Acquisition Dossier Trigger in Sidebar */}
                <div className="pt-2">
                  <button
                    onClick={() => {
                      setIsMobileOpen(false);
                      onOpenCart?.();
                    }}
                    className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl bg-[#181923] hover:bg-[#202230] text-xs font-medium text-zinc-200 hover:text-white transition-all cursor-pointer shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <ShoppingBag className="w-4 h-4 text-[#d1a86e]" />
                      <span>Acquisition Dossier</span>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-0.5 rounded-full text-[10px] font-mono font-bold",
                        cartCount > 0 ? "bg-[#d1a86e] text-[#0d0e12]" : "bg-[#222432] text-zinc-400"
                      )}
                    >
                      {cartCount}
                    </span>
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-6 space-y-3">
                <Link
                  href="/"
                  onClick={() => setIsMobileOpen(false)}
                  className="w-full h-10 rounded-full bg-[#181923] hover:bg-[#222430] text-zinc-300 hover:text-white text-xs font-medium uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <ArrowLeft className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>Return to Gallery</span>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </TooltipProvider>
  );
}
