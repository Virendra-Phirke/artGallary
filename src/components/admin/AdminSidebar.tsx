"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ExternalLink,
  Shield,
  Sparkles,
  Menu,
  LayoutDashboard,
  Palette,
  FolderKanban,
  Calendar,
  Mail,
  LayoutTemplate,
  Settings,
  UserCog,
  LogOut,
  ChevronRight,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
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
  "/admin/artworks": "Artworks Inventory",
  "/admin/collections": "Series & Collections",
  "/admin/exhibitions": "Gallery Exhibitions",
  "/admin/inquiries": "Collector Inquiries",
  "/admin/homepage": "Landing Page Studio",
  "/admin/ar-studio": "Spatial WebAR Studio",
  "/admin/settings": "Storefront Settings",
  "/admin/profile": "Admin Account",
};

const navigationGroups = [
  {
    group: "Curation & Inventory",
    items: [
      {
        label: "Executive Overview",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        label: "Artworks Inventory",
        href: "/admin/artworks",
        icon: Palette,
      },
      {
        label: "Curated Series",
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
        hasBadge: true,
      },
    ],
  },
  {
    group: "Studio & Systems",
    items: [
      {
        label: "Landing Page Studio",
        href: "/admin/homepage",
        icon: LayoutTemplate,
      },
      {
        label: "Spatial & QR Studio",
        href: "/admin/ar-studio",
        icon: Sparkles,
      },
      {
        label: "CMS & Storefront Settings",
        href: "/admin/settings",
        icon: Settings,
      },
      {
        label: "Admin Profile & Credentials",
        href: "/admin/profile",
        icon: UserCog,
      },
    ],
  },
];

export function AdminSidebar({
  user,
  pendingInquiriesCount = 0,
  children,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const isStudio = pathname === "/admin/homepage";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Determine current section title
  const currentTitle =
    Object.entries(routeTitles).find(([prefix]) =>
      pathname === prefix || (prefix !== "/admin/dashboard" && pathname?.startsWith(prefix))
    )?.[1] || "Curator Workspace";

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <div className="flex h-screen w-screen max-w-full overflow-hidden bg-[#090a0f] text-[#f4f4f6]">
      {/* Magic UI Vertical Dock (Desktop only: reveals on hover or left-edge proximity) */}
      <AdminVerticalDock
        user={user}
        pendingInquiriesCount={pendingInquiriesCount}
      />

      {/* 100% Full Width Workspace Container */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        {/* Top Header Bar - Solid Elevated Block with Mobile Menu */}
        <header
          className={cn(
            "shrink-0 flex items-center justify-between bg-[#121319] shadow-md shadow-black/40 z-30 transition-all duration-200",
            isStudio ? "h-12 px-3 sm:px-6" : "h-13 sm:h-14 px-3 sm:px-6 md:px-10"
          )}
        >
          {/* Left: Mobile Menu Trigger + Monogram + Section Breadcrumb */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            {/* Mobile Navigation Drawer Trigger (<md) */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button
                    type="button"
                    aria-label="Open Admin Navigation Menu"
                    className="relative w-8 h-8 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 hover:text-white flex items-center justify-center transition-colors focus:outline-none"
                  >
                    <Menu className="w-4 h-4" />
                    {pendingInquiriesCount > 0 && (
                      <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-black ring-2 ring-[#121319]">
                        {pendingInquiriesCount}
                      </span>
                    )}
                  </button>
                </SheetTrigger>

                <SheetContent
                  side="left"
                  className="w-[85vw] max-w-xs bg-[#121319] text-[#f4f4f6] p-0 flex flex-col justify-between shadow-2xl shadow-black/80 border-none"
                >
                  <div className="flex flex-col h-full overflow-y-auto">
                    {/* Drawer Header */}
                    <SheetHeader className="p-5 pb-3 bg-[#0d0e12] text-left">
                      <div className="flex items-center justify-between">
                        <div>
                          <SheetTitle className="font-serif text-lg tracking-[0.15em] text-white uppercase font-bold">
                            L&apos;Atelier
                          </SheetTitle>
                          <span className="text-[9px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold block mt-0.5">
                            Curator CMS
                          </span>
                        </div>
                        <div className="w-7 h-7 rounded-full bg-[#251e16] flex items-center justify-center text-[10px] font-serif text-[#d1a86e] font-semibold">
                          {user.name?.[0] || "C"}
                        </div>
                      </div>
                    </SheetHeader>

                    {/* Navigation Groups */}
                    <div className="p-3 space-y-4 flex-1">
                      {navigationGroups.map((grp) => (
                        <div key={grp.group} className="space-y-1">
                          <span className="px-3 text-[9px] uppercase tracking-[0.2em] font-semibold text-zinc-500 block">
                            {grp.group}
                          </span>
                          <div className="space-y-1 pt-1">
                            {grp.items.map((item) => {
                              const isActive =
                                pathname === item.href ||
                                (item.href !== "/admin/dashboard" && pathname.startsWith(item.href));
                              const Icon = item.icon;

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() => setMobileMenuOpen(false)}
                                  className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors",
                                    isActive
                                      ? "bg-[#1a1b26] text-[#d1a86e] font-medium shadow-sm"
                                      : "text-zinc-400 hover:text-white hover:bg-[#161722]"
                                  )}
                                >
                                  <div className="flex items-center gap-2.5">
                                    <Icon
                                      className={cn(
                                        "w-4 h-4",
                                        isActive ? "text-[#d1a86e]" : "text-zinc-500"
                                      )}
                                    />
                                    <span>{item.label}</span>
                                  </div>

                                  {item.hasBadge && pendingInquiriesCount > 0 && (
                                    <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-black text-[9px] font-mono font-bold">
                                      {pendingInquiriesCount}
                                    </span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Drawer Footer Actions */}
                    <div className="p-4 bg-[#0d0e12] space-y-2">
                      <Link
                        href="/gallery"
                        target="_blank"
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-xs text-zinc-300 hover:text-white transition-colors"
                      >
                        <span className="flex items-center gap-2">
                          <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
                          <span>View Live Storefront</span>
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />
                      </Link>

                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center justify-center gap-2 py-2 text-xs text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            <Link
              href="/admin/dashboard"
              className="flex items-center gap-1.5 group shrink-0"
              title="Return to Dashboard Overview"
            >
              <span className="font-serif text-xs sm:text-sm font-bold tracking-[0.16em] text-white uppercase group-hover:text-[#d1a86e] transition-colors">
                L&apos;Atelier
              </span>
              <span className="text-[8px] sm:text-[9px] tracking-[0.2em] text-[#d1a86e] uppercase font-semibold px-1.5 py-0.5 rounded-full bg-[#251e16]">
                Studio
              </span>
            </Link>

            <span className="text-zinc-600 font-light text-xs hidden xs:inline">/</span>

            <div className="flex items-center gap-1.5 text-xs text-zinc-300 min-w-0">
              <span className="font-medium truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none text-[11px] sm:text-xs">
                {currentTitle}
              </span>
              {isStudio && (
                <span className="text-[9px] text-[#d1a86e] bg-[#1a1b26] font-mono px-2 py-0.5 rounded-full hidden md:inline-flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" />
                  Canvas Mode
                </span>
              )}
            </div>
          </div>

          {/* Right: Compact Quick Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            {/* Quick left edge dock hover hint (Desktop Only) */}
            <div className="hidden lg:flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono bg-[#161720] px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e]/60 animate-pulse" />
              <span>Hover left edge for dock</span>
            </div>

            <Link
              href="/gallery"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white bg-[#1a1b26] hover:bg-[#222432] transition-colors py-1.5 px-2.5 sm:px-3 rounded-xl shadow-sm"
              title="Open live storefront"
            >
              <span className="hidden sm:inline">Live Store</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
            </Link>

            <Link
              href="/admin/profile"
              className="flex items-center gap-1.5 bg-[#1a1b26] hover:bg-[#222432] py-1 px-1.5 sm:px-2.5 rounded-xl shadow-sm transition-colors"
              title="Manage Admin Profile"
            >
              <div className="w-6 h-6 rounded-full bg-[#251e16] flex items-center justify-center text-[10px] font-serif text-[#d1a86e] font-semibold">
                {user.name?.[0] || "C"}
              </div>
              <span className="text-xs text-zinc-300 truncate max-w-[80px] hidden md:inline">
                {user.name}
              </span>
            </Link>
          </div>
        </header>

        {/* Dynamic Route Children - Responsive Padding Scroll Container */}
        <main
          className={cn(
            "flex-1 min-h-0 transition-all max-w-full",
            isStudio ? "p-0 overflow-hidden flex flex-col h-full" : "overflow-y-auto overscroll-contain p-3 sm:p-5 md:p-8 lg:p-10"
          )}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
