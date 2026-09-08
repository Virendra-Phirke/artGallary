"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Shield,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AdminVerticalDock } from "@/components/admin/AdminVerticalDock";

export interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    role?: string;
  };
  pendingInquiriesCount?: number;
  children: React.ReactNode;
}

const routeTitles: Record<string, string> = {
  "/admin/dashboard": "Curator Executive Overview",
  "/admin/artworks": "Artworks Inventory Management",
  "/admin/collections": "Curated Series & Collections",
  "/admin/exhibitions": "Museum & Gallery Exhibitions",
  "/admin/inquiries": "Collector Inquiries & Acquisitions",
  "/admin/homepage": "Landing Page Visual Studio",
  "/admin/ar-studio": "Spatial Augmented Reality Studio",
  "/admin/settings": "Storefront Settings & CMS Configuration",
  "/admin/profile": "Admin Account & Security Credentials",
};

export function AdminSidebar({
  user,
  pendingInquiriesCount = 0,
  children,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const isStudio = pathname === "/admin/homepage";

  // Determine current section title
  const currentTitle =
    Object.entries(routeTitles).find(([prefix]) =>
      pathname === prefix || (prefix !== "/admin/dashboard" && pathname?.startsWith(prefix))
    )?.[1] || "Curator Administration Workspace";

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#090a0f] text-[#f4f4f6]">
      {/* Magic UI Vertical Dock (Left side, reveals on hover or left-edge proximity) */}
      <AdminVerticalDock
        user={user}
        pendingInquiriesCount={pendingInquiriesCount}
      />

      {/* 100% Full Width Workspace Container */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header Bar - Solid Elevated Block */}
        <header
          className={cn(
            "shrink-0 flex items-center justify-between bg-[#121319] shadow-md shadow-black/40 z-30 transition-all duration-200",
            isStudio ? "h-12 px-4 md:px-6" : "h-14 px-6 md:px-10"
          )}
        >
          {/* Left: Studio Monogram + Current Section Breadcrumb */}
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2 group"
              title="Return to Dashboard Overview"
            >
              <span className="font-serif text-sm font-bold tracking-[0.18em] text-white uppercase group-hover:text-[#d1a86e] transition-colors">
                L&apos;Atelier
              </span>
              <span className="text-[9px] tracking-[0.2em] text-[#d1a86e] uppercase font-semibold hidden sm:inline px-2 py-0.5 rounded-full bg-[#251e16]">
                Studio
              </span>
            </Link>

            <span className="text-zinc-600 font-light">/</span>

            <div className="flex items-center gap-2 text-xs text-zinc-300">
              <span className="font-medium truncate max-w-[200px] sm:max-w-none">
                {currentTitle}
              </span>
              {isStudio && (
                <span className="text-[10px] text-[#d1a86e] bg-[#1a1b26] font-mono px-2 py-0.5 rounded-full hidden md:inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  100% Canvas Mode
                </span>
              )}
            </div>
          </div>

          {/* Right: Quick actions */}
          <div className="flex items-center gap-3">
            {/* Quick left edge dock hover hint */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono bg-[#161720] px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e]/60 animate-pulse" />
              <span>Hover left edge for dock</span>
            </div>

            <Link
              href="/gallery"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-[#1a1b26] hover:bg-[#222432] transition-colors py-1.5 px-3 rounded-xl shadow-sm"
              title="Open public gallery in new tab"
            >
              <span className="hidden sm:inline">View Live Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
            </Link>

            <Link
              href="/admin/profile"
              className="hidden sm:flex items-center gap-2 bg-[#1a1b26] hover:bg-[#222432] py-1 px-2.5 rounded-xl shadow-sm transition-colors"
              title="Manage Admin Profile & Credentials"
            >
              <div className="w-6 h-6 rounded-full bg-[#251e16] flex items-center justify-center text-[10px] font-serif text-[#d1a86e] font-semibold">
                {user.name?.[0] || "C"}
              </div>
              <span className="text-xs text-zinc-300 truncate max-w-[100px]">
                {user.name}
              </span>
            </Link>
          </div>
        </header>

        {/* Dynamic Route Children - 100% Full Width Scroll Container */}
        <main
          className={cn(
            "flex-1 min-h-0 overflow-y-auto overscroll-contain transition-all",
            isStudio ? "p-3 sm:p-4 md:p-5" : "p-6 md:p-10"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
