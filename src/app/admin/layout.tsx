import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
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

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login?redirect=/admin/dashboard");
  }

  const navSections = [
    {
      title: "DASHBOARD",
      items: [
        { label: "Overview", href: "/admin/dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "CONTENT",
      items: [
        { label: "Artworks CMS", href: "/admin/artworks", icon: Palette },
        { label: "Collections", href: "/admin/collections", icon: FolderKanban },
        { label: "Exhibitions", href: "/admin/exhibitions", icon: Calendar },
        { label: "Homepage Builder", href: "/admin/homepage", icon: Home },
      ],
    },
    {
      title: "EXPERIENCE",
      items: [
        { label: "AR Studio", href: "/admin/ar-studio", icon: Sparkles },
        { label: "QR Code Tags", href: "/admin/qr-codes", icon: QrCode },
      ],
    },
    {
      title: "DESIGN",
      items: [
        { label: "Appearance / Theme", href: "/admin/appearance", icon: Paintbrush },
        { label: "Accessibility (WCAG)", href: "/admin/accessibility", icon: Accessibility },
      ],
    },
    {
      title: "MEDIA",
      items: [
        { label: "Media Library", href: "/admin/media", icon: ImageIcon },
      ],
    },
    {
      title: "BUSINESS",
      items: [
        { label: "Inquiries", href: "/admin/inquiries", icon: Mail },
        { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      ],
    },
    {
      title: "DISCOVERY",
      items: [
        { label: "SEO & Meta", href: "/admin/seo", icon: Search },
      ],
    },
    {
      title: "SYSTEM",
      items: [
        { label: "Activity Audit Log", href: "/admin/activity", icon: Activity },
        { label: "Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0b0d] text-[#f4f4f6] flex flex-col md:flex-row font-sans antialiased">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-[#0f1013] border-r border-[#1c1d25] flex flex-col shrink-0">
        {/* Sidebar Brand Header */}
        <div className="p-6 border-b border-[#1c1d25] flex items-center justify-between">
          <Link href="/admin/dashboard" className="flex flex-col">
            <span className="font-serif text-lg tracking-[0.15em] font-medium text-white uppercase">
              L&apos;Atelier CMS
            </span>
            <span className="text-[9px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
              Studio Curator Console
            </span>
          </Link>
          <div className="px-2 py-0.5 rounded bg-amber-950/60 border border-amber-800/80 text-[10px] text-amber-300 font-mono">
            ADMIN
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-6">
          {navSections.map((group) => (
            <div key={group.title} className="space-y-1">
              <span className="text-[9px] tracking-[0.25em] text-zinc-500 uppercase font-semibold px-3 block mb-1.5">
                {group.title}
              </span>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-zinc-400 hover:text-white hover:bg-[#1a1c23] transition-colors"
                  >
                    <Icon className="w-4 h-4 text-[#d1a86e] shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User Footer in Sidebar */}
        <div className="p-4 border-t border-[#1c1d25] bg-[#0d0e12] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full bg-[#1a1c23] border border-[#262833] flex items-center justify-center text-xs font-serif text-[#d1a86e]">
              {session.user.name[0]}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-white font-medium truncate max-w-[110px]">
                {session.user.name}
              </span>
              <span className="text-[10px] text-zinc-500 truncate max-w-[110px]">
                {session.user.email}
              </span>
            </div>
          </div>

          <Link
            href="/"
            target="_blank"
            className="p-1.5 text-zinc-500 hover:text-white transition-colors"
            title="View live public gallery"
          >
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Workspace */}
      <main className="flex-1 min-w-0 flex flex-col bg-[#0d0e12]">
        {/* Top Operational Bar */}
        <div className="h-16 border-b border-[#1c1d25] px-6 md:px-10 flex items-center justify-between bg-[#0f1013]/80 backdrop-blur-md">
          <div className="flex items-center gap-3 text-xs text-zinc-400">
            <Shield className="w-4 h-4 text-[#d1a86e]" />
            <span>Secure Admin Session • 2FA Ready</span>
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
        </div>

        {/* Dynamic Route Content */}
        <div className="flex-1 p-6 md:p-10 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
