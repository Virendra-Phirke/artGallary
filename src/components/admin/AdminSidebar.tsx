"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Palette,
  FolderKanban,
  Calendar,
  Home,
  Sparkles,
  QrCode,
  Paintbrush,
  Accessibility,
  Image as ImageIcon,
  Mail,
  BarChart3,
  Search,
  Activity,
  Settings,
  ExternalLink,
  Shield,
  LogOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AdminSidebarProps {
  user: {
    name: string;
    email: string;
    role?: string;
  };
  pendingInquiriesCount?: number;
  children: React.ReactNode;
}

const navSections: Array<{
  title: string;
  items: Array<{
    label: string;
    href: string;
    icon: any;
    matchPrefixes?: string[];
    showBadge?: boolean;
  }>;
}> = [
  {
    title: "DESK",
    items: [
      { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "COLLECTION & CURATION",
    items: [
      { label: "Artworks Inventory", href: "/admin/artworks", icon: Palette },
      { label: "Series & Collections", href: "/admin/collections", icon: FolderKanban },
      { label: "Exhibitions", href: "/admin/exhibitions", icon: Calendar },
    ],
  },
  {
    title: "CLIENTELE",
    items: [
      {
        label: "Collector Inquiries",
        href: "/admin/inquiries",
        icon: Mail,
        matchPrefixes: ["/admin/analytics"],
        showBadge: true,
      },
    ],
  },
  {
    title: "STUDIO & PRESENCE",
    items: [
      {
        label: "Spatial & QR Studio",
        href: "/admin/ar-studio",
        icon: Sparkles,
        matchPrefixes: ["/admin/qr-codes"],
      },
      {
        label: "Public Storefront",
        href: "/admin/homepage",
        icon: Home,
      },
      {
        label: "Studio Settings",
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
    ],
  },
];

function AdminSidebarInner({ user, pendingInquiriesCount, children }: AdminSidebarProps) {
  const pathname = usePathname();
  const { state } = useSidebar();

  return (
    <>
      <Sidebar collapsible="icon">
        {/* Brand Header */}
        <SidebarHeader>
          <div className="flex items-center justify-between">
            <Link
              href="/admin/dashboard"
              className="flex flex-col overflow-hidden transition-all"
            >
              <span className="font-serif text-base font-semibold tracking-[0.15em] text-white uppercase truncate">
                {state === "collapsed" ? "LA" : "L'Atelier"}
              </span>
              {state !== "collapsed" && (
                <span className="text-[9px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                  Studio Console
                </span>
              )}
            </Link>
            {state !== "collapsed" && (
              <Badge variant="warning" className="text-[9px] font-mono font-bold">
                ADMIN
              </Badge>
            )}
          </div>
        </SidebarHeader>

        {/* Content Navigation */}
        <SidebarContent>
          {navSections.map((group) => (
            <SidebarGroup key={group.title}>
              <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/admin/dashboard" && pathname?.startsWith(item.href)) ||
                    Boolean(item.matchPrefixes?.some((p) => pathname?.startsWith(p)));

                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                      >
                        <Link href={item.href} className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon className="w-4 h-4 shrink-0 text-[#d1a86e]" />
                            {state !== "collapsed" && <span className="truncate">{item.label}</span>}
                          </div>
                          {state !== "collapsed" && item.showBadge && typeof pendingInquiriesCount === "number" && pendingInquiriesCount > 0 && (
                            <Badge variant="warning" className="text-[9px] px-1.5 py-0 h-4 font-mono font-bold shrink-0">
                              {pendingInquiriesCount}
                            </Badge>
                          )}
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        {/* Footer */}
        <SidebarFooter>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-7 h-7 rounded-full bg-[#1a1c23] border border-[#262833] flex items-center justify-center text-xs font-serif text-[#d1a86e] shrink-0 font-semibold">
                {user.name?.[0] || "A"}
              </div>
              {state !== "collapsed" && (
                <div className="flex flex-col truncate">
                  <span className="text-xs text-white font-medium truncate">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 truncate">
                    {user.email}
                  </span>
                </div>
              )}
            </div>

            {state !== "collapsed" && (
              <Link
                href="/"
                target="_blank"
                className="p-1.5 text-zinc-500 hover:text-white transition-colors"
                title="View live public gallery"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </SidebarFooter>
      </Sidebar>

      {/* Main Workspace Inset */}
      <SidebarInset>
        {/* Top Header Bar with SidebarTrigger */}
        <header className="h-16 shrink-0 border-b border-[#1c1d25] px-6 md:px-10 flex items-center justify-between bg-[#0f1013]/80 backdrop-blur-md z-30">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div className="flex items-center gap-2 text-xs text-zinc-400">
              <Shield className="w-4 h-4 text-[#d1a86e]" />
              <span className="hidden sm:inline">
                Curator Administration Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/gallery"
              target="_blank"
              className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors"
            >
              <span>View Public Gallery</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>

        {/* Dynamic Route Children - Separate Independent Scroll Container */}
        <main className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-6 md:p-10">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}

export function AdminSidebar({ user, pendingInquiriesCount, children }: AdminSidebarProps) {
  return (
    <SidebarProvider>
      <AdminSidebarInner user={user} pendingInquiriesCount={pendingInquiriesCount}>{children}</AdminSidebarInner>
    </SidebarProvider>
  );
}
