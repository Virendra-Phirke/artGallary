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
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c1d25] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Studio Command Center
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">Curator Dashboard</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Real-time catalog readiness, collector inquiries ledger, and studio operational telemetry.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm" className="gap-2 border-[#262833] text-zinc-300 hover:text-white">
            <Link href="/gallery" target="_blank">
              <ExternalLink className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>Live Storefront</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold">
            <Link href="/admin/artworks/new">
              <Palette className="w-3.5 h-3.5" />
              <span>New Artwork</span>
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm" className="gap-2 border border-[#262833]">
            <Link href="/admin/ar-studio">
              <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>AR Studio</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Metrics Row: 4 Full-Width Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        <Card className="p-5 space-y-1.5 bg-[#14151a] border-[#262833] shadow-md hover:border-[#d1a86e]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
              Total Artworks
            </span>
            <Palette className="w-4 h-4 text-zinc-600" />
          </div>
          <div className="font-serif text-3xl text-white font-medium">{totalArtworks}</div>
          <span className="text-xs text-zinc-400 block">
            {publishedArtworks} published • {draftArtworks} drafts
          </span>
        </Card>

        <Card className="p-5 space-y-1.5 bg-[#14151a] border-[#262833] shadow-md hover:border-[#d1a86e]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
              Collector Inquiries
            </span>
            <Mail className="w-4 h-4 text-[#d1a86e]" />
          </div>
          <div className="font-serif text-3xl text-[#d1a86e] font-medium">{inquiries.length}</div>
          <span className="text-xs text-emerald-400 font-medium block">
            {newInquiries} pending collector reply
          </span>
        </Card>

        <Card className="p-5 space-y-1.5 bg-[#14151a] border-[#262833] shadow-md hover:border-[#d1a86e]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
              Spatial AR Sessions
            </span>
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="font-serif text-3xl text-white font-medium">1:1 Scale</div>
          <span className="text-xs text-zinc-400 block">WebXR & Three.js active</span>
        </Card>

        <Card className="p-5 space-y-1.5 bg-[#14151a] border-[#262833] shadow-md hover:border-[#d1a86e]/30 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
              Acquisitions / Sold
            </span>
            <ShieldCheck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="font-serif text-3xl text-white font-medium">{soldArtworks}</div>
          <span className="text-xs text-zinc-400 block">Private museum collections</span>
        </Card>
      </div>

      {/* Readiness & Attention Required Panel: 4 Balanced Cards */}
      <Card className="p-6 space-y-4 bg-[#14151a] border-[#262833] shadow-md w-full">
        <div className="flex items-center justify-between border-b border-[#1f212b] pb-4">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <h2 className="font-serif text-xl text-white">
              Readiness & Attention Required ({totalWarnings})
            </h2>
          </div>
          <Link
            href="/admin/accessibility"
            className="text-xs uppercase tracking-widest text-[#d1a86e] hover:underline"
          >
            Audit WCAG Score →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {/* Inquiry alert */}
          {newInquiries > 0 ? (
            <Link
              href="/admin/inquiries"
              className="p-4 bg-[#1a1c23] hover:bg-[#22242e] border border-amber-900/50 rounded-xl transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <span className="text-amber-300 font-semibold text-xs block group-hover:text-amber-200">
                  {newInquiries} Unreplied Inquiry
                </span>
                <span className="text-[11px] text-zinc-400">
                  Prospective collectors waiting
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-300 transition-colors" />
            </Link>
          ) : (
            <div className="p-4 bg-[#1a1c23]/60 border border-[#262833] rounded-xl flex items-center gap-2.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All inquiries replied</span>
            </div>
          )}

          {/* Alt text check */}
          {missingAltText.length > 0 ? (
            <Link
              href="/admin/artworks"
              className="p-4 bg-[#1a1c23] hover:bg-[#22242e] border border-red-900/50 rounded-xl transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <span className="text-red-300 font-semibold text-xs block group-hover:text-red-200">
                  {missingAltText.length} Missing Alt Text
                </span>
                <span className="text-[11px] text-zinc-400">
                  Screen reader accessibility
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-red-300 transition-colors" />
            </Link>
          ) : (
            <div className="p-4 bg-[#1a1c23]/60 border border-[#262833] rounded-xl flex items-center gap-2.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>All artworks have alt text</span>
            </div>
          )}

          {/* AR readiness check */}
          {arIncomplete.length > 0 ? (
            <Link
              href="/admin/ar-studio"
              className="p-4 bg-[#1a1c23] hover:bg-[#22242e] border border-amber-900/50 rounded-xl transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <span className="text-amber-300 font-semibold text-xs block group-hover:text-amber-200">
                  {arIncomplete.length} AR Needs Calibration
                </span>
                <span className="text-[11px] text-zinc-400">
                  Missing physical scale dimensions
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-amber-300 transition-colors" />
            </Link>
          ) : (
            <div className="p-4 bg-[#1a1c23]/60 border border-[#262833] rounded-xl flex items-center gap-2.5 text-xs text-emerald-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>AR spatial scale calibrated</span>
            </div>
          )}

          {/* Unpublished drafts */}
          {unpublishedDrafts.length > 0 ? (
            <Link
              href="/admin/artworks"
              className="p-4 bg-[#1a1c23] hover:bg-[#22242e] border border-[#262833] hover:border-zinc-500 rounded-xl transition-all flex items-center justify-between group shadow-sm"
            >
              <div>
                <span className="text-zinc-200 font-semibold text-xs block group-hover:text-white">
                  {unpublishedDrafts.length} Unpublished Drafts
                </span>
                <span className="text-[11px] text-zinc-400">
                  Awaiting publication approval
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors" />
            </Link>
          ) : (
            <div className="p-4 bg-[#1a1c23]/60 border border-[#262833] rounded-xl flex items-center gap-2.5 text-xs text-zinc-400">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Catalog current (no drafts)</span>
            </div>
          )}
        </div>
      </Card>

      {/* Executive 3-Column Studio Grid (100% Width) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
        {/* Column 1 (5 Cols): Recent Collector Inquiries */}
        <Card className="lg:col-span-5 p-6 space-y-4 bg-[#14151a] border-[#262833] shadow-md">
          <div className="flex items-center justify-between border-b border-[#1f212b] pb-3">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#d1a86e]" />
              <h2 className="font-serif text-xl text-white">Recent Inquiries</h2>
            </div>
            <Link
              href="/admin/inquiries"
              className="text-xs uppercase tracking-widest text-[#d1a86e] hover:underline"
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
                  className="p-4 bg-[#1a1c23] border border-[#262833] rounded-xl space-y-2 hover:border-[#d1a86e]/30 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          inq.status === "new"
                            ? "warning"
                            : inq.status === "read"
                            ? "secondary"
                            : "success"
                        }
                        className="text-[9px] uppercase font-mono"
                      >
                        {inq.status}
                      </Badge>
                      <span className="text-xs text-white font-medium">
                        {inq.name}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {new Date(inq.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#a6aabf] line-clamp-2 leading-relaxed">
                    {inq.message}
                  </p>
                  {inq.email && (
                    <span className="text-[10px] text-zinc-500 block truncate font-mono">
                      {inq.email}
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Column 2 (4 Cols): Curated Catalog Highlights */}
        <Card className="lg:col-span-4 p-6 space-y-4 bg-[#14151a] border-[#262833] shadow-md">
          <div className="flex items-center justify-between border-b border-[#1f212b] pb-3">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-[#d1a86e]" />
              <h2 className="font-serif text-xl text-white">Catalog Highlights</h2>
            </div>
            <Link
              href="/admin/artworks"
              className="text-xs uppercase tracking-widest text-[#d1a86e] hover:underline"
            >
              All Artworks ({artworks.length})
            </Link>
          </div>

          <div className="space-y-3">
            {artworks.slice(0, 4).map((art) => (
              <Link
                key={art.id}
                href={`/admin/artworks/${art.id}`}
                className="p-3 bg-[#1a1c23] border border-[#262833] rounded-xl flex items-center gap-3.5 hover:border-[#d1a86e]/40 transition-colors group"
              >
                <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-black/40 border border-[#262833] shrink-0">
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
                    <Badge
                      variant={
                        art.status === "published"
                          ? "success"
                          : art.status === "sold"
                          ? "gold"
                          : "secondary"
                      }
                      className="text-[9px] uppercase font-mono px-1.5 py-0 h-4"
                    >
                      {art.status}
                    </Badge>
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
        </Card>

        {/* Column 3 (3 Cols): Studio Infrastructure & Live Activity */}
        <div className="lg:col-span-3 space-y-6">
          {/* Infrastructure Health Status */}
          <Card className="p-5 space-y-3.5 bg-[#14151a] border-[#262833] shadow-md">
            <div className="flex items-center justify-between border-b border-[#1f212b] pb-2.5">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                System Infrastructure
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-[#181a22] border border-[#222430]">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Database className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Neon PostgreSQL</span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400">Connected</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#181a22] border border-[#222430]">
                <div className="flex items-center gap-2 text-zinc-300">
                  <HardDrive className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Cloudflare R2 CDN</span>
                </div>
                <span className="text-[10px] font-mono text-cyan-400">Operational</span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-[#181a22] border border-[#222430]">
                <div className="flex items-center gap-2 text-zinc-300">
                  <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>Spatial AR Engine</span>
                </div>
                <span className="text-[10px] font-mono text-[#d1a86e]">Three.js WebXR</span>
              </div>
            </div>
          </Card>

          {/* Activity Log Trail */}
          <Card className="p-5 space-y-3.5 bg-[#14151a] border-[#262833] shadow-md">
            <div className="flex items-center justify-between border-b border-[#1f212b] pb-2.5">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                Activity Trail
              </span>
              <Link
                href="/admin/activity"
                className="text-[10px] uppercase tracking-widest text-[#d1a86e] hover:underline"
              >
                Log
              </Link>
            </div>

            <div className="space-y-2.5">
              {activityLogs.slice(0, 4).map((act) => (
                <div
                  key={act.id}
                  className="p-2.5 bg-[#181a22] border border-[#222430] rounded-lg text-xs space-y-1"
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
          </Card>
        </div>
      </div>
    </div>
  );
}
