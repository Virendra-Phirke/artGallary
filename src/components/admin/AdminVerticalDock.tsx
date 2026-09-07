"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  motion,
  AnimatePresence,
} from "motion/react";
import {
  LayoutDashboard,
  Palette,
  FolderKanban,
  Calendar,
  Mail,
  Home,
  Sparkles,
  Settings,
  ExternalLink,
  Pin,
  PinOff,
  ChevronRight,
  Shield,
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

interface AdminVerticalDockProps {
  user: {
    name: string;
    email: string;
    role?: string;
  };
  pendingInquiriesCount?: number;
}

interface NavItemConfig {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  matchPrefixes?: string[];
  badge?: number;
  highlight?: boolean;
}

export function AdminVerticalDock({
  user,
  pendingInquiriesCount = 0,
}: AdminVerticalDockProps) {
  const pathname = usePathname();
  const [isHovered, setIsHovered] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const exitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Restore pinned preference from localStorage
  useEffect(() => {
    try {
      const savedPin = localStorage.getItem("atelier-dock-pinned");
      if (savedPin === "true") {
        setIsPinned(true);
      }
    } catch {
      // ignore SSR or localStorage access restriction
    }
  }, []);

  const togglePin = () => {
    setIsPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("atelier-dock-pinned", String(next));
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
    }, 320); // Smooth grace window
  };

  const isVisible = isPinned || isHovered;

  const mainNavItems: NavItemConfig[] = [
    {
      label: "Overview",
      href: "/admin/dashboard",
      icon: LayoutDashboard,
    },
    {
      label: "Artworks Inventory",
      href: "/admin/artworks",
      icon: Palette,
    },
    {
      label: "Series & Collections",
      href: "/admin/collections",
      icon: FolderKanban,
    },
    {
      label: "Exhibitions",
      href: "/admin/exhibitions",
      icon: Calendar,
    },
    {
      label: "Collector Inquiries",
      href: "/admin/inquiries",
      icon: Mail,
      badge: pendingInquiriesCount,
      matchPrefixes: ["/admin/analytics"],
    },
  ];

  const studioNavItems: NavItemConfig[] = [
    {
      label: "Landing Page Studio",
      href: "/admin/homepage",
      icon: Home,
      highlight: true,
    },
    {
      label: "Spatial & QR Studio",
      href: "/admin/ar-studio",
      icon: Sparkles,
      matchPrefixes: ["/admin/qr-codes"],
    },
    {
      label: "Storefront Settings & CMS",
      href: "/admin/settings",
      icon: Settings,
      matchPrefixes: [
        "/admin/appearance",
        "/admin/accessibility",
        "/admin/seo",
        "/admin/activity",
        "/admin/media",
      ],
    },
  ];

  const isItemActive = (item: NavItemConfig) => {
    if (!pathname) return false;
    if (pathname === item.href) return true;
    if (item.href !== "/admin/dashboard" && pathname.startsWith(item.href)) return true;
    return Boolean(item.matchPrefixes?.some((prefix) => pathname.startsWith(prefix)));
  };

  return (
    <TooltipProvider>
      {/* 1. Invisible Left-Edge Hit Sensor Zone */}
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="fixed left-0 top-0 bottom-0 w-4 md:w-5 z-40 pointer-events-auto"
        aria-hidden="true"
      />

      {/* 2. Visual Peek Tab Indicator when Hidden */}
      <AnimatePresence>
        {!isVisible && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            onMouseEnter={handleMouseEnter}
            className="fixed left-0 top-1/2 -translate-y-1/2 z-40 flex items-center group cursor-pointer"
            title="Hover to reveal navigation dock"
          >
            <div className="h-16 w-2 bg-[#d1a86e]/30 group-hover:bg-[#d1a86e] rounded-r-md transition-all duration-200 group-hover:w-3 shadow-lg shadow-black/50 flex items-center justify-center">
              <ChevronRight className="w-2.5 h-2.5 text-black opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Floating Vertical Dock Container */}
      <motion.nav
        aria-label="Admin Navigation Dock"
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
        className="fixed left-3 top-1/2 -translate-y-1/2 z-50 flex flex-col items-center select-none"
      >
        <Dock
          orientation="vertical"
          iconSize={42}
          iconMagnification={58}
          iconDistance={110}
          className="bg-[#0b0c0f]/95 border-[#262833] backdrop-blur-2xl shadow-2xl shadow-black/80 rounded-2xl py-3 px-2 gap-1.5"
        >
          {/* Brand Monogram */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link href="/admin/dashboard" className="mb-1 focus:outline-none">
                <DockIcon className="bg-[#14151b] border border-[#2b2d38] hover:border-[#d1a86e]/60 group">
                  <div className="flex flex-col items-center justify-center">
                    <span className="font-serif font-bold text-xs tracking-wider text-[#d1a86e] group-hover:scale-110 transition-transform">
                      LA
                    </span>
                  </div>
                </DockIcon>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="flex flex-col">
                <span className="font-semibold text-white">L&apos;Atelier Studio</span>
                <span className="text-[10px] text-zinc-400">Curator Workspace</span>
              </div>
            </TooltipContent>
          </Tooltip>

          {/* Primary Desk & Curation Nav Items */}
          {mainNavItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href} className="focus:outline-none">
                    <DockIcon
                      className={cn(
                        "relative border transition-all duration-200",
                        active
                          ? "bg-[#1f212a] border-[#d1a86e] text-white shadow-lg shadow-[#d1a86e]/10"
                          : "bg-[#121318] border-transparent text-zinc-400 hover:text-white hover:bg-[#1a1c24] hover:border-[#2b2d38]"
                      )}
                    >
                      {/* Active indicator dot on left */}
                      {active && (
                        <span className="absolute left-1 w-1 h-3 bg-[#d1a86e] rounded-full" />
                      )}

                      <Icon
                        className={cn(
                          "w-5 h-5 transition-colors",
                          active ? "text-[#d1a86e]" : "text-zinc-400 group-hover:text-white"
                        )}
                      />

                      {/* Inquiry notification pill */}
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-amber-500 text-[9px] font-bold text-black ring-2 ring-[#0b0c0f]">
                          {item.badge}
                        </span>
                      )}
                    </DockIcon>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <div className="flex items-center gap-2">
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <Badge variant="warning" className="text-[9px] px-1 py-0 h-4">
                        {item.badge} new
                      </Badge>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Subtle Divider */}
          <div className="w-7 h-[1px] bg-[#22242e] my-1" />

          {/* Studio & Settings Items */}
          {studioNavItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link href={item.href} className="focus:outline-none">
                    <DockIcon
                      className={cn(
                        "relative border transition-all duration-200",
                        active
                          ? "bg-[#1f212a] border-[#d1a86e] text-white shadow-lg shadow-[#d1a86e]/10"
                          : "bg-[#121318] border-transparent text-zinc-400 hover:text-white hover:bg-[#1a1c24] hover:border-[#2b2d38]"
                      )}
                    >
                      {active && (
                        <span className="absolute left-1 w-1 h-3 bg-[#d1a86e] rounded-full" />
                      )}

                      <Icon
                        className={cn(
                          "w-5 h-5 transition-colors",
                          active ? "text-[#d1a86e]" : "text-zinc-400 group-hover:text-white"
                        )}
                      />
                    </DockIcon>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right">
                  <span>{item.label}</span>
                </TooltipContent>
              </Tooltip>
            );
          })}

          {/* Subtle Divider */}
          <div className="w-7 h-[1px] bg-[#22242e] my-1" />

          {/* Live Storefront External Link */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/gallery"
                target="_blank"
                className="focus:outline-none"
              >
                <DockIcon className="bg-[#121318] border-transparent text-zinc-400 hover:text-white hover:bg-[#1a1c24] hover:border-[#2b2d38]">
                  <ExternalLink className="w-4 h-4 text-[#d1a86e]" />
                </DockIcon>
              </Link>
            </TooltipTrigger>
            <TooltipContent side="right">
              <span>View Live Storefront (New Tab)</span>
            </TooltipContent>
          </Tooltip>

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

          {/* Curator Avatar Info */}
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="focus:outline-none">
                <DockIcon className="bg-[#151720] border border-[#262833] text-[#d1a86e] font-serif font-semibold text-xs">
                  {user.name?.[0] || "C"}
                </DockIcon>
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 font-medium text-white">
                  <Shield className="w-3 h-3 text-[#d1a86e]" />
                  <span>{user.name}</span>
                </div>
                <span className="text-[10px] text-zinc-400">{user.email}</span>
                <span className="text-[9px] text-[#d1a86e] font-mono mt-0.5 uppercase">
                  {user.role || "ADMIN"}
                </span>
              </div>
            </TooltipContent>
          </Tooltip>
        </Dock>
      </motion.nav>
    </TooltipProvider>
  );
}
