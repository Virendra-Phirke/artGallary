import React from "react";
import Link from "next/link";
import Image from "next/image";
import {
  getAllArtworksAdmin,
  getInquiries,
  getActivityLogs,
} from "@/db/repository";
import {
  Palette,
  Eye,
  Mail,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Layers,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Server,
  HardDrive,
  Database,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

export default async function AdminDashboardPage() {
  const [artworks, inquiries, activityLogs] = await Promise.all([
    getAllArtworksAdmin(),
    getInquiries(),
    getActivityLogs(),
  ]);

  const totalArtworks = artworks.length;
  const publishedArtworks = artworks.filter((a) => a.status === "published").length;
  const draftArtworks = artworks.filter((a) => a.status === "draft").length;
  const soldArtworks = artworks.filter((a) => a.status === "sold").length;
  const newInquiries = inquiries.filter((i) => i.status === "new").length;

  // Attention Required Audit
  const missingAltText = artworks.filter((a) => !a.altText || a.altText.trim().length < 5);
  const missingDimensions = artworks.filter((a) => !a.widthCm || !a.heightCm);
  const arIncomplete = artworks.filter(
    (a) => a.arConfig.arReadinessStatus === "needs_attention"
  );
  const unpublishedDrafts = artworks.filter((a) => a.status === "draft");

  const totalWarnings =
    missingAltText.length +
    missingDimensions.length +
    arIncomplete.length +
    newInquiries;

  return (
    <div className="space-y-8 w-full">
      {/* Page Title & Quick Actions - Solid Master Block */}
      <div className="bg-[#121319] p-6 sm:p-8 rounded-3xl shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Studio Command Center
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Curator Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time catalog readiness, collector inquiries ledger, and studio operational telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/gallery"
            target="_blank"
            className="flex items-center gap-2 bg-[#1a1b26] hover:bg-[#222432] text-xs text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl shadow-sm transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>Live Storefront</span>
          </Link>
          <Link
            href="/admin/artworks/new"
            className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs px-4 py-2 rounded-xl shadow-md shadow-[#d1a86e]/20 transition-colors"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>New Artwork</span>
          </Link>
          <Link
            href="/admin/ar-studio"
            className="flex items-center gap-2 bg-[#1a1b26] hover:bg-[#222432] text-xs text-zinc-300 hover:text-white px-3.5 py-2 rounded-xl shadow-sm transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>AR Studio</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row: 4 Solid Master Blocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        <div className="p-6 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-2 hover:bg-[#161722] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
              Total Artworks
            </span>
            <div className="w-8 h-8 rounded-full bg-[#1a1b26] flex items-center justify-center">
              <Palette className="w-4 h-4 text-zinc-400" />
            </div>
          </div>
          <div className="font-serif text-3xl text-white font-medium">{totalArtworks}</div>
          <span className="text-xs text-zinc-400 block pt-1">
            {publishedArtworks} published • {draftArtworks} drafts
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-2 hover:bg-[#161722] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
              Collector Inquiries
            </span>
            <div className="w-8 h-8 rounded-full bg-[#251e16] flex items-center justify-center">
              <Mail className="w-4 h-4 text-[#d1a86e]" />
            </div>
          </div>
          <div className="font-serif text-3xl text-[#d1a86e] font-medium">{inquiries.length}</div>
          <span className="text-xs text-emerald-400 font-medium block pt-1">
            {newInquiries} pending collector reply
          </span>
        </div>

        <div className="p-6 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-2 hover:bg-[#161722] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
              Spatial AR Sessions
            </span>
            <div className="w-8 h-8 rounded-full bg-[#16252b] flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="font-serif text-3xl text-white font-medium">1:1 Scale</div>
          <span className="text-xs text-zinc-400 block pt-1">WebXR & Three.js active</span>
        </div>

        <div className="p-6 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-2 hover:bg-[#161722] transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
              Acquisitions / Sold
            </span>
            <div className="w-8 h-8 rounded-full bg-[#262016] flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
            </div>
          </div>
          <div className="font-serif text-3xl text-white font-medium">{soldArtworks}</div>
          <span className="text-xs text-zinc-400 block pt-1">Private museum collections</span>
        </div>
      </div>

      {/* Readiness & Attention Required Panel: 4 Solid Cards */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-6 w-full">
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#2a1d14] flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="font-serif text-xl text-white">
              Readiness & Attention Required ({totalWarnings})
            </h2>
          </div>
          <Link
            href="/admin/accessibility"
            className="text-xs uppercase tracking-widest text-[#d1a86e] hover:text-[#e2c18d] bg-[#251e16] px-3.5 py-1.5 rounded-full transition-colors font-medium"
          >
            Audit WCAG Score →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Inquiry alert */}
          {newInquiries > 0 ? (
            <Link
              href="/admin/inquiries"
              className="p-5 bg-[#2a1d14] hover:bg-[#342419] rounded-2xl transition-all flex items-center justify-between group shadow-md shadow-black/20"
            >
              <div>
                <span className="text-amber-300 font-semibold text-xs block group-hover:text-amber-200">
                  {newInquiries} Unreplied Inquiry
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  Prospective collectors waiting
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-300 transition-colors" />
            </Link>
          ) : (
            <div className="p-5 bg-[#14231b] rounded-2xl flex items-center gap-3 text-xs text-emerald-400 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All inquiries replied</span>
            </div>
          )}

          {/* Alt text check */}
          {missingAltText.length > 0 ? (
            <Link
              href="/admin/artworks"
              className="p-5 bg-[#2d1616] hover:bg-[#3a1d1d] rounded-2xl transition-all flex items-center justify-between group shadow-md shadow-black/20"
            >
              <div>
                <span className="text-red-300 font-semibold text-xs block group-hover:text-red-200">
                  {missingAltText.length} Missing Alt Text
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  Screen reader accessibility
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-red-300 transition-colors" />
            </Link>
          ) : (
            <div className="p-5 bg-[#14231b] rounded-2xl flex items-center gap-3 text-xs text-emerald-400 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All artworks have alt text</span>
            </div>
          )}

          {/* AR readiness check */}
          {arIncomplete.length > 0 ? (
            <Link
              href="/admin/ar-studio"
              className="p-5 bg-[#2a1d14] hover:bg-[#342419] rounded-2xl transition-all flex items-center justify-between group shadow-md shadow-black/20"
            >
              <div>
                <span className="text-amber-300 font-semibold text-xs block group-hover:text-amber-200">
                  {arIncomplete.length} AR Needs Calibration
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  Missing physical scale dimensions
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-300 transition-colors" />
            </Link>
          ) : (
            <div className="p-5 bg-[#14231b] rounded-2xl flex items-center gap-3 text-xs text-emerald-400 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AR spatial scale calibrated</span>
            </div>
          )}

          {/* Unpublished drafts */}
          {unpublishedDrafts.length > 0 ? (
            <Link
              href="/admin/artworks"
              className="p-5 bg-[#1a1b26] hover:bg-[#222432] rounded-2xl transition-all flex items-center justify-between group shadow-md shadow-black/20"
            >
              <div>
                <span className="text-zinc-200 font-semibold text-xs block group-hover:text-white">
                  {unpublishedDrafts.length} Unpublished Drafts
                </span>
                <span className="text-[11px] text-zinc-400 mt-0.5 block">
                  Awaiting publication approval
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </Link>
          ) : (
            <div className="p-5 bg-[#1a1b26] rounded-2xl flex items-center gap-3 text-xs text-zinc-400 shadow-sm">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Catalog current (no drafts)</span>
            </div>
          )}
        </div>
      </div>

      {/* Executive 3-Column Studio Grid (100% Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Column 1 (5 Cols): Recent Collector Inquiries */}
        <div className="lg:col-span-5 p-6 sm:p-8 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-5">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#251e16] flex items-center justify-center">
                <Mail className="w-4 h-4 text-[#d1a86e]" />
              </div>
              <h2 className="font-serif text-xl text-white">Recent Inquiries</h2>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs uppercase tracking-widest text-[#d1a86e] hover:text-[#e2c18d] bg-[#251e16] px-3 py-1 rounded-full transition-colors font-medium"
            >
              View All ({inquiries.length})
            </Link>
          </div>

          <div className="space-y-3">
            {inquiries.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center">No collector inquiries received yet.</p>
            ) : (
              inquiries.slice(0, 4).map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 bg-[#1a1b26] rounded-2xl space-y-2 hover:bg-[#202230] transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full ${
                          inq.status === "new"
                            ? "bg-[#2a1d14] text-amber-300"
                            : inq.status === "read"
                            ? "bg-[#222432] text-zinc-300"
                            : "bg-[#14231b] text-emerald-300"
                        }`}
                      >
                        {inq.status}
                      </span>
                      <span className="text-xs text-white font-medium">
                        {inq.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#a6aabf] line-clamp-2 leading-relaxed bg-[#121319] p-2.5 rounded-xl shadow-inner">
                    {inq.message}
                  </p>
                  {inq.email && (
                    <span className="text-[10px] text-zinc-500 block truncate font-mono pt-0.5">
                      {inq.email}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2 (4 Cols): Curated Catalog Highlights */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-5">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#251e16] flex items-center justify-center">
                <Palette className="w-4 h-4 text-[#d1a86e]" />
              </div>
              <h2 className="font-serif text-xl text-white">Catalog Highlights</h2>
            </div>
            <Link
              href="/admin/artworks"
              className="text-xs uppercase tracking-widest text-[#d1a86e] hover:text-[#e2c18d] bg-[#251e16] px-3 py-1 rounded-full transition-colors font-medium"
            >
              All Artworks ({artworks.length})
            </Link>
          </div>

          <div className="space-y-3">
            {artworks.slice(0, 4).map((art) => (
              <Link
                key={art.id}
                href={`/admin/artworks/${art.id}`}
                className="p-3.5 bg-[#1a1b26] rounded-2xl flex items-center gap-3.5 hover:bg-[#202230] transition-colors group shadow-sm"
              >
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-black/40 shrink-0">
                  {art.coverImageUrl ? (
                    <Image
                      src={art.coverImageUrl}
                      alt={art.title}
                      fill
                      sizes="48px"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-700">
                      <Palette className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h3 className="text-xs font-medium text-white truncate group-hover:text-[#d1a86e] transition-colors">
                      {art.title}
                    </h3>
                    <span
                      className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-full ${
                        art.status === "published"
                          ? "bg-[#14231b] text-emerald-300"
                          : art.status === "sold"
                          ? "bg-[#251e16] text-[#d1a86e]"
                          : "bg-[#222432] text-zinc-400"
                      }`}
                    >
                      {art.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400 mt-1">
                    <span className="truncate">{art.medium} ({art.year})</span>
                    <span className="font-mono text-[#d1a86e] font-semibold shrink-0 ml-2">
                      {formatCurrency(art.price, art.currency)}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Column 3 (3 Cols): Studio Infrastructure & Live Activity */}
        <div className="lg:col-span-3 space-y-6">
          {/* Infrastructure Health Status */}
          <div className="p-6 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                System Infrastructure
              </span>
              <span className="inline-flex items-center gap-1.5 text-[10px] font-mono text-emerald-400 bg-[#14231b] px-2.5 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1a1b26] shadow-sm">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Neon PostgreSQL</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Connected</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1a1b26] shadow-sm">
                <div className="flex items-center gap-2 text-zinc-300">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cloudflare R2 CDN</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">Operational</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-2xl bg-[#1a1b26] shadow-sm">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>Spatial AR Engine</span>
                </div>
                <span className="text-[10px] font-mono text-[#d1a86e]">Three.js WebXR</span>
              </div>
            </div>
          </div>

          {/* Activity Log Trail */}
          <div className="p-6 rounded-3xl bg-[#121319] shadow-xl shadow-black/40 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                Activity Trail
              </span>
              <Link
                href="/admin/activity"
                className="text-[10px] uppercase tracking-widest text-[#d1a86e] hover:text-[#e2c18d] bg-[#251e16] px-2.5 py-1 rounded-full transition-colors font-medium"
              >
                Log
              </Link>
            </div>

            <div className="space-y-2.5">
              {activityLogs.slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  className="p-3 bg-[#1a1b26] rounded-2xl text-xs space-y-1 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono text-[#d1a86e] truncate max-w-[120px]">
                      {act.action}
                    </span>
                    <span className="text-[9px] text-zinc-500 font-mono">
                      {new Date(act.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-[11px] line-clamp-1">{act.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
