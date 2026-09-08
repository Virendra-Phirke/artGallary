"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  User,
  Mail,
  Shield,
  Sparkles,
  Layers,
  Palette,
  Calendar,
  Heart,
  Search,
  Eye,
  ArrowRight,
  Check,
  Clock,
  MapPin,
  Package,
  Award,
  LogOut,
  ExternalLink,
  ShieldCheck,
  Ruler,
  ShoppingBag,
} from "lucide-react";
import {
  MockArtwork,
  MockCollection,
  MockExhibition,
  MockInquiry,
} from "@/db/mockData";
import { formatCurrency, formatDimensions, cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressiveImage } from "@/components/ui/progressive-image";
import { CollectorDock, CollectorTab } from "@/components/account/CollectorDock";
import { MarketingPreferenceToggle } from "@/components/account/MarketingPreferenceToggle";
import { ArtworkQuickViewModal } from "@/components/public/ArtworkQuickViewModal";
import { InteractiveRoomPreviewer } from "@/components/public/InteractiveRoomPreviewer";
import { AcquisitionCartModal } from "@/components/account/AcquisitionCartModal";

interface CollectorDashboardClientProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  } | null;
  artworks: MockArtwork[];
  collections: MockCollection[];
  exhibitions: MockExhibition[];
  userInquiries: MockInquiry[];
  marketingSubscribed: boolean;
  initialTab?: CollectorTab;
}

export function CollectorDashboardClient({
  user,
  artworks = [],
  collections = [],
  exhibitions = [],
  userInquiries = [],
  marketingSubscribed = true,
  initialTab = "overview",
}: CollectorDashboardClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab State with URL query syncing
  const urlTab = searchParams.get("tab") as CollectorTab | null;
  const [activeTab, setActiveTab] = useState<CollectorTab>(
    urlTab && ["overview", "gallery", "collections", "exhibitions", "inquiries", "ar", "profile"].includes(urlTab)
      ? urlTab
      : initialTab
  );

  // Quick View Modal
  const [inspectArtwork, setInspectArtwork] = useState<MockArtwork | null>(null);

  // Cart / Acquisition Dossier State
  const [cartArtworkIds, setCartArtworkIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Login Requirement Prompt State (triggered on Like or Contact without auth)
  const [loginPromptReason, setLoginPromptReason] = useState<"like" | "contact" | "inquiries" | "profile" | null>(null);

  // Gallery Search & Filters
  const [gallerySearch, setGallerySearch] = useState("");
  const [galleryCategory, setGalleryCategory] = useState<"all" | "available" | "monumental" | "mineral" | "saved">("all");
  const [savedArtworkIds, setSavedArtworkIds] = useState<string[]>([]);

  // Load saved bookmarks and cart from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("atelier_collector_saved_works");
      if (saved) {
        setSavedArtworkIds(JSON.parse(saved));
      }
      const cart = localStorage.getItem("atelier_collector_cart_works");
      if (cart) {
        setCartArtworkIds(JSON.parse(cart));
      }
    } catch {
      // ignore
    }

    // Nav header listeners
    const handleOpenCart = () => setIsCartOpen(true);
    const handleViewLiked = () => {
      setActiveTab("gallery");
      setGalleryCategory("saved");
      const params = new URLSearchParams(window.location.search);
      params.set("tab", "gallery");
      window.history.replaceState(null, "", `/account?${params.toString()}`);
    };

    window.addEventListener("atelier-open-cart", handleOpenCart);
    window.addEventListener("atelier-view-liked", handleViewLiked);

    return () => {
      window.removeEventListener("atelier-open-cart", handleOpenCart);
      window.removeEventListener("atelier-view-liked", handleViewLiked);
    };
  }, []);

  const toggleSaveArtwork = (id: string) => {
    // Only ask for login when the collector wants to like/save a painting or contact
    if (!user) {
      setLoginPromptReason("like");
      return;
    }

    setSavedArtworkIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("atelier_collector_saved_works", JSON.stringify(next));
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent("atelier-saved-updated", { detail: next }));
      return next;
    });
  };

  const toggleCartArtwork = (id: string) => {
    setCartArtworkIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("atelier_collector_cart_works", JSON.stringify(next));
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent("atelier-cart-updated", { detail: next }));
      return next;
    });
  };

  const removeFromCart = (id: string) => {
    setCartArtworkIds((prev) => {
      const next = prev.filter((item) => item !== id);
      try {
        localStorage.setItem("atelier_collector_cart_works", JSON.stringify(next));
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent("atelier-cart-updated", { detail: next }));
      return next;
    });
  };

  const clearCart = () => {
    setCartArtworkIds([]);
    try {
      localStorage.removeItem("atelier_collector_cart_works");
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent("atelier-cart-updated", { detail: [] }));
  };

  const addAllLikedToCart = () => {
    setCartArtworkIds((prev) => {
      const combined = Array.from(new Set([...prev, ...savedArtworkIds]));
      try {
        localStorage.setItem("atelier_collector_cart_works", JSON.stringify(combined));
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent("atelier-cart-updated", { detail: combined }));
      return combined;
    });
    setIsCartOpen(true);
  };

  const handleTabChange = (tab: CollectorTab) => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.replace(`/account?${params.toString()}`, { scroll: false });
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/";
  };

  // Filtered artworks for Gallery tab
  const filteredArtworks = useMemo(() => {
    return artworks.filter((art) => {
      const matchesSearch =
        !gallerySearch ||
        art.title.toLowerCase().includes(gallerySearch.toLowerCase()) ||
        (art.medium && art.medium.toLowerCase().includes(gallerySearch.toLowerCase()));

      if (!matchesSearch) return false;

      if (galleryCategory === "available") return art.status === "published";
      if (galleryCategory === "monumental") {
        return (art.widthCm && art.widthCm >= 100) || (art.heightCm && art.heightCm >= 100);
      }
      if (galleryCategory === "mineral") {
        const m = (art.medium || "").toLowerCase();
        const d = (art.description || "").toLowerCase();
        return m.includes("lapis") || m.includes("mineral") || d.includes("lapis") || d.includes("mineral");
      }
      if (galleryCategory === "saved") {
        return savedArtworkIds.includes(art.id);
      }
      return true;
    });
  }, [artworks, gallerySearch, galleryCategory, savedArtworkIds]);

  const spotlightArtwork = artworks[0];

  const tabMetadata: Record<CollectorTab, { title: string; subtitle: string; tag: string }> = {
    overview: {
      tag: "Private Salon",
      title: "Collector Overview",
      subtitle: "Acquisition portfolio, curatorial invitations, and active requests.",
    },
    gallery: {
      tag: "Permanent Collection",
      title: "Private Catalogue",
      subtitle: "Direct access to original paintings, archival editions, and acquisition inquiries.",
    },
    collections: {
      tag: "Curatorial Cycles",
      title: "Curated Series & Suites",
      subtitle: "Thematic bodies of work directly from the artist atelier.",
    },
    exhibitions: {
      tag: "Vernissages & Salons",
      title: "Exhibitions & Retrospectives",
      subtitle: "Upcoming museum retrospectives, gallery booths, and VIP opening receptions.",
    },
    inquiries: {
      tag: "Acquisition Ledger",
      title: "Private Inquiries",
      subtitle: "Direct correspondence ledger between you and the curatorial team.",
    },
    ar: {
      tag: "Architectural Studio",
      title: "Spatial AR Showroom",
      subtitle: "Real-scale artwork placement in curated room spaces with ambient wall controls.",
    },
    profile: {
      tag: "Account & Dispatch",
      title: "Collector Profile",
      subtitle: "Account credentials and private vernissage dispatch preferences.",
    },
  };

  const currentTabInfo = tabMetadata[activeTab] || tabMetadata.overview;

  return (
    <div className="space-y-10 pb-16">
      {/* 1. EDITORIAL HUB BANNER */}
      <div className="border-b border-[#22242f] pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
              {currentTabInfo.tag}
            </span>
            <span className="text-zinc-600">•</span>
            <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-mono">
              Collector Portal
            </span>
          </div>

          <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl text-white font-medium">
            {currentTabInfo.title}
          </h1>
          <p className="text-xs sm:text-sm text-[#8e92a4] max-w-2xl">
            {currentTabInfo.subtitle}
          </p>
        </div>

        {/* Quick Hub State Indicators */}
        <div className="flex items-center gap-3">
          {savedArtworkIds.length > 0 && (
            <button
              onClick={() => {
                setActiveTab("gallery");
                setGalleryCategory("saved");
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#15161f] border border-[#2b2e3c] text-xs text-zinc-300 hover:text-white transition-colors"
            >
              <Heart className="w-3.5 h-3.5 text-[#d1a86e] fill-[#d1a86e]" />
              <span>{savedArtworkIds.length} Liked Works</span>
            </button>
          )}

          {cartArtworkIds.length > 0 && (
            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#181a24] border border-[#d1a86e]/50 text-xs text-[#d1a86e] hover:text-white transition-colors shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-[#d1a86e]" />
              <span>{cartArtworkIds.length} in Dossier</span>
            </button>
          )}

          {activeTab !== "overview" && (
            <button
              onClick={() => handleTabChange("overview")}
              className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-full bg-[#15161f] border border-[#2b2e3c] hover:border-[#3d4052] transition-colors"
            >
              Overview
            </button>
          )}
        </div>
      </div>

      {/* =========================================================================
          TAB 1: OVERVIEW / SALON HOME
      ========================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-10 animate-in fade-in duration-200">
          {/* 4 Primary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="p-5 sm:p-6 bg-[#14151a] border-[#262833] rounded-2xl space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                Active Inquiries
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-3xl text-white font-medium">
                  {userInquiries.length}
                </span>
                <Badge variant={userInquiries.length > 0 ? "success" : "secondary"}>
                  {userInquiries.length > 0 ? "In Studio Ledger" : "No Pending"}
                </Badge>
              </div>
              <p className="text-[11px] text-zinc-400 pt-1">
                Recorded in Elena Vance's private studio archive
              </p>
            </Card>

            <Card className="p-5 sm:p-6 bg-[#14151a] border-[#262833] rounded-2xl space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                Curated Canvases
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-3xl text-[#d1a86e] font-medium">
                  {artworks.length}
                </span>
                <span className="text-[11px] font-mono text-zinc-400">Published</span>
              </div>
              <p className="text-[11px] text-zinc-400 pt-1">
                Available for private acquisition or curatorial viewing
              </p>
            </Card>

            <Card className="p-5 sm:p-6 bg-[#14151a] border-[#262833] rounded-2xl space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                Active Exhibitions
              </span>
              <div className="flex items-baseline justify-between">
                <span className="font-serif text-3xl text-white font-medium">
                  {exhibitions.length}
                </span>
                <Badge variant="gold">VIP Access</Badge>
              </div>
              <p className="text-[11px] text-zinc-400 pt-1">
                Solo shows in Paris &amp; Manhattan Contemporary
              </p>
            </Card>

            <Card className="p-5 sm:p-6 bg-[#14151a] border-[#262833] rounded-2xl space-y-2">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
                Spatial WebAR
              </span>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#d1a86e]" />
                <span className="font-serif text-xl text-white">1:1 Calibrated</span>
              </div>
              <p className="text-[11px] text-zinc-400 pt-1">
                Camera WebXR preview enabled on your browser &amp; phone
              </p>
            </Card>
          </div>

          {/* Acquisition Dossier Readiness Banner */}
          {cartArtworkIds.length > 0 && (
            <div className="bg-gradient-to-r from-[#171822] via-[#1a1c26] to-[#171822] border border-[#d1a86e]/40 rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl shadow-black/40">
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#d1a86e]/15 border border-[#d1a86e]/40 flex items-center justify-center text-[#d1a86e]">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg text-white font-medium">
                      Acquisition Portfolio Dossier
                    </h3>
                    <Badge variant="gold">{cartArtworkIds.length} Paintings Selected</Badge>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Your multi-artwork portfolio is ready. Submit a consolidated inquiry directly to Elena Vance's studio team.
                  </p>
                </div>
              </div>

              <Button
                onClick={() => setIsCartOpen(true)}
                className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs uppercase tracking-wider px-6 h-10 shadow-lg shadow-[#d1a86e]/20 flex items-center gap-2 shrink-0"
              >
                <span>Review &amp; Inquire Dossier</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}

          {/* Curated Masterpiece Spotlight + Curator Liaison */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Masterpiece Spotlight */}
            {spotlightArtwork && (
              <div className="lg:col-span-7 bg-[#14151a] border border-[#262833] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                    Curator's Spotlight
                  </span>
                  <Badge variant="success">Available for Acquisition</Badge>
                </div>

                <div className="relative aspect-[16/10] rounded-xl overflow-hidden border border-[#262833] bg-[#0d0e12] group">
                  <ProgressiveImage
                    src={spotlightArtwork.coverImageUrl}
                    alt={spotlightArtwork.title}
                    fill
                    optimizeWidth={900}
                    optimizeQuality={85}
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-5">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <h3 className="font-serif text-xl text-white">
                          {spotlightArtwork.title}
                        </h3>
                        <p className="text-xs text-zinc-300">
                          {spotlightArtwork.year} • {formatDimensions(spotlightArtwork.widthCm, spotlightArtwork.heightCm)}
                        </p>
                      </div>
                      <span className="font-serif text-lg text-[#d1a86e]">
                        {formatCurrency(spotlightArtwork.price, spotlightArtwork.currency)}
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed line-clamp-2">
                  {spotlightArtwork.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <Button
                    onClick={() => setInspectArtwork(spotlightArtwork)}
                    className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-6"
                  >
                    <Eye className="w-3.5 h-3.5 mr-2" />
                    <span>Inspect Details</span>
                  </Button>

                  <Button
                    onClick={() => toggleCartArtwork(spotlightArtwork.id)}
                    className={cn(
                      "rounded-full text-xs font-semibold uppercase tracking-wider px-5 border transition-all",
                      cartArtworkIds.includes(spotlightArtwork.id)
                        ? "bg-[#1f2230] text-[#d1a86e] border-[#d1a86e]"
                        : "bg-[#181920] hover:bg-[#22242e] text-zinc-200 hover:text-white border-[#262833]"
                    )}
                  >
                    <ShoppingBag className="w-3.5 h-3.5 mr-2 text-[#d1a86e]" />
                    <span>
                      {cartArtworkIds.includes(spotlightArtwork.id)
                        ? "In Dossier"
                        : "+ Add to Dossier"}
                    </span>
                  </Button>

                  <Button
                    asChild
                    variant="outline"
                    className="rounded-full border-[#262833] bg-[#181920] hover:bg-[#22242e] text-white text-xs uppercase tracking-wider"
                  >
                    <Link href={`/ar/${spotlightArtwork.slug}`} className="flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>View in Your Space (AR)</span>
                    </Link>
                  </Button>
                </div>
              </div>
            )}

            {/* Right: Studio Concierge & Private Liaison */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-[#14151a] border border-[#262833] rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
                <div className="w-10 h-10 rounded-full bg-[#1c1d25] border border-[#262833] flex items-center justify-center text-[#d1a86e]">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-serif text-xl text-white">
                    Direct Studio Liaison
                  </h3>
                  <p className="text-xs text-[#8e92a4] mt-1 leading-relaxed">
                    As a verified collector, you have direct priority correspondence with Elena Vance's studio team for bespoke acquisitions, framing advice, or private Paris viewing appointments.
                  </p>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-[#1c1d25] text-xs text-zinc-300">
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Liaison Hours:</span>
                    <span className="font-mono">Mon – Sat (10:00 – 19:00 CET)</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Studio Location:</span>
                    <span>1st Arrondissement, Paris</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-zinc-500">Handling Protocol:</span>
                    <span className="text-[#d1a86e]">Custom Archival Crate</span>
                  </div>
                </div>

                <div className="pt-2">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full rounded-full border-[#262833] bg-[#181920] hover:bg-[#22242e] text-[#d1a86e] hover:text-white text-xs uppercase tracking-wider"
                  >
                    <Link href="/contact" className="flex items-center justify-center gap-2">
                      <Mail className="w-3.5 h-3.5" />
                      <span>Start Acquisition Inquiry</span>
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Collector Email Preferences */}
              {user ? (
                <MarketingPreferenceToggle initialSubscribed={marketingSubscribed} />
              ) : (
                <Card className="p-6 bg-[#14151a] border-[#262833] rounded-3xl space-y-3 shadow-xl">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-[#1c1d25] border border-[#262833] flex items-center justify-center text-[#d1a86e] shrink-0">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-serif text-lg text-white">Studio Dispatches &amp; Releases</h3>
                      <p className="text-xs text-[#8e92a4] leading-relaxed">
                        Sign in to receive private VIP invitations to solo retrospectives, vernissage releases, and acquisition catalogues.
                      </p>
                    </div>
                  </div>
                  <div className="pt-1">
                    <Button
                      asChild
                      variant="outline"
                      className="w-full rounded-full border-[#262833] bg-[#181920] hover:bg-[#22242e] text-[#d1a86e] text-xs uppercase tracking-wider"
                    >
                      <Link href="/login?redirect=/account">
                        <span>Sign In to Subscribe</span>
                      </Link>
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Recent Inquiries Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#262833] pb-3">
              <h2 className="font-serif text-xl text-white">Recent Studio Inquiries</h2>
              <button
                onClick={() => handleTabChange("inquiries")}
                className="text-xs text-[#d1a86e] hover:underline uppercase tracking-wider flex items-center gap-1"
              >
                <span>View Full Ledger ({userInquiries.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {userInquiries.length === 0 ? (
              <Card className="p-8 text-center bg-[#14151a]/50 border-[#262833] rounded-2xl space-y-2">
                <Mail className="w-6 h-6 text-zinc-600 mx-auto" />
                <p className="text-sm text-zinc-400">No inquiries placed yet</p>
                <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                  When you inquire about an original canvas or request a private viewing, your studio correspondence is tracked here.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userInquiries.slice(0, 2).map((inq) => (
                  <Card key={inq.id} className="p-5 bg-[#14151a] border-[#262833] rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge
                        variant={
                          inq.status === "replied"
                            ? "success"
                            : inq.status === "read"
                            ? "gold"
                            : "warning"
                        }
                      >
                        {inq.status}
                      </Badge>
                      <span className="text-[11px] text-zinc-500 font-mono">
                        {new Date(inq.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <h4 className="font-serif text-base text-white truncate">{inq.subject}</h4>
                    <p className="text-xs text-zinc-400 line-clamp-2 bg-[#101116] p-3 rounded-lg border border-[#22242f]">
                      {inq.message}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 2: GALLERY / VIEWING ROOM
      ========================================================================= */}
      {activeTab === "gallery" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* Header & Filter Controls */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#262833] pb-6">
            <div>
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
                Private Viewing Room
              </span>
              <h2 className="font-serif text-3xl text-white mt-1">
                Studio Artwork Catalog
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Browse original works with true dimensions, provenance notes, and 1:1 WebAR preview.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title or medium..."
                value={gallerySearch}
                onChange={(e) => setGallerySearch(e.target.value)}
                className="w-full bg-[#14151a] border border-[#262833] rounded-full pl-10 pr-4 py-2 text-xs text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#d1a86e]/70"
              />
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "All Works" },
              { id: "available", label: "Available for Acquisition" },
              { id: "monumental", label: "Monumental Canvases" },
              { id: "mineral", label: "Mineral & Lapis Series" },
              { id: "saved", label: `Saved Wishlist (${savedArtworkIds.length})` },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setGalleryCategory(cat.id as any)}
                className={`px-4 py-1.5 rounded-full text-xs transition-all uppercase tracking-wider font-medium ${
                  galleryCategory === cat.id
                    ? "bg-[#d1a86e] text-[#0d0e12] font-semibold shadow-md shadow-[#d1a86e]/20"
                    : "bg-[#14151a] text-zinc-400 hover:text-white border border-[#262833]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Liked Works Action Bar */}
          {galleryCategory === "saved" && (
            <div className="bg-[#15161f] border border-[#2b2e3c] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Heart className="w-4 h-4 fill-rose-400" />
                </div>
                <div>
                  <h3 className="font-serif text-base text-white">
                    Private Shortlist ({savedArtworkIds.length} Liked Paintings)
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Paintings you have shortlisted. Add them to your Acquisition Dossier to inquire in a single consolidated submission.
                  </p>
                </div>
              </div>

              {savedArtworkIds.length > 0 && (
                <div className="flex items-center gap-2.5 w-full sm:w-auto">
                  <Button
                    onClick={addAllLikedToCart}
                    className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs tracking-wider uppercase px-4 h-9 shadow-md shadow-[#d1a86e]/15 flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Add All to Acquisition Dossier</span>
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Artworks Grid */}
          {filteredArtworks.length === 0 ? (
            <Card className="p-12 text-center bg-[#14151a]/50 border-[#262833] rounded-2xl space-y-3">
              {galleryCategory === "saved" ? (
                <>
                  <Heart className="w-8 h-8 text-rose-500/50 mx-auto" />
                  <p className="font-serif text-lg text-white">Your shortlist is currently empty</p>
                  <p className="text-xs text-zinc-500 max-w-sm mx-auto">
                    Click the heart icon on any artwork while exploring the catalogue to save paintings to your personal portfolio.
                  </p>
                  <Button
                    onClick={() => setGalleryCategory("all")}
                    className="mt-2 rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-5"
                  >
                    Explore Catalogue
                  </Button>
                </>
              ) : (
                <>
                  <Palette className="w-8 h-8 text-zinc-600 mx-auto" />
                  <p className="font-serif text-lg text-white">No matching paintings found</p>
                  <p className="text-xs text-zinc-500">
                    Try adjusting your search query or filter selection.
                  </p>
                </>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
              {filteredArtworks.map((art) => {
                const isSaved = savedArtworkIds.includes(art.id);

                return (
                  <div
                    key={art.id}
                    className="group bg-[#14151a] border border-[#262833] rounded-2xl overflow-hidden p-4 space-y-4 hover:border-[#d1a86e]/40 transition-all duration-300 shadow-xl"
                  >
                    <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-[#0d0e12]">
                      <ProgressiveImage
                        src={art.coverImageUrl}
                        alt={art.title}
                        fill
                        optimizeWidth={650}
                        optimizeQuality={85}
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />

                      {/* Status Badge */}
                      <div className="absolute top-3 left-3 z-10">
                        <Badge
                          variant={
                            art.status === "published"
                              ? "success"
                              : art.status === "reserved"
                              ? "warning"
                              : "secondary"
                          }
                          className="backdrop-blur-md bg-black/60 border border-white/10"
                        >
                          {art.status === "published" ? "Available" : art.status}
                        </Badge>
                      </div>

                      {/* Save / Bookmark Button */}
                      <button
                        onClick={() => toggleSaveArtwork(art.id)}
                        className={`absolute top-3 right-3 z-10 p-2 rounded-full backdrop-blur-md border transition-all ${
                          isSaved
                            ? "bg-[#d1a86e] text-[#0d0e12] border-[#d1a86e]"
                            : "bg-black/60 text-zinc-400 hover:text-white border-white/10"
                        }`}
                        title={isSaved ? "Remove from Saved" : "Save to Private Portfolio"}
                        aria-label="Bookmark artwork"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-[#0d0e12]" : ""}`} />
                      </button>

                      {/* Hover Overlay Buttons */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <button
                          onClick={() => setInspectArtwork(art)}
                          className="p-3 bg-white text-black rounded-full hover:bg-zinc-200 transition-colors shadow-lg"
                          title="Inspect Details"
                          aria-label="Inspect artwork"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <Link
                          href={`/ar/${art.slug}`}
                          className="p-3 bg-[#d1a86e] text-[#0d0e12] rounded-full hover:bg-[#e2c18d] transition-colors shadow-lg"
                          title="View in Your Space (AR)"
                          aria-label="View in AR"
                        >
                          <Sparkles className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <h4 className="font-serif text-lg text-white group-hover:text-[#d1a86e] transition-colors line-clamp-1">
                          {art.title}
                        </h4>
                        {art.price && (
                          <span className="text-sm font-mono text-[#d1a86e] shrink-0">
                            {formatCurrency(art.price, art.currency)}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-1">{art.medium}</p>

                      <div className="pt-2 border-t border-[#1c1d25] flex items-center justify-between text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Ruler className="w-3 h-3 text-[#d1a86e]" />
                          {formatDimensions(art.widthCm, art.heightCm)}
                        </span>

                        <button
                          onClick={() => setInspectArtwork(art)}
                          className="text-[#d1a86e] hover:underline uppercase tracking-wider text-[10px]"
                        >
                          Details &rarr;
                        </button>
                      </div>

                      {/* Add to Acquisition Dossier Button */}
                      <button
                        onClick={() => toggleCartArtwork(art.id)}
                        className={cn(
                          "w-full py-2 px-3 rounded-xl text-xs font-semibold uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all mt-2 border",
                          cartArtworkIds.includes(art.id)
                            ? "bg-[#1f2230] text-[#d1a86e] border-[#d1a86e]/60 shadow-sm"
                            : "bg-[#181920] hover:bg-[#20222d] text-zinc-300 hover:text-white border-[#262833] hover:border-[#d1a86e]/30"
                        )}
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-[#d1a86e]" />
                        <span>
                          {cartArtworkIds.includes(art.id)
                            ? "In Dossier"
                            : "+ Add to Acquisition Dossier"}
                        </span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 3: COLLECTIONS / SERIES
      ========================================================================= */}
      {activeTab === "collections" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="border-b border-[#262833] pb-6">
            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
              Curatorial Cycles
            </span>
            <h2 className="font-serif text-3xl text-white mt-1">
              Elena Vance Artwork Series
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Elena Vance organizes her inquiries into multi-year cycles exploring mineral glazes and raw Belgian linen.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {collections.map((col) => (
              <div
                key={col.id}
                className="bg-[#14151a] border border-[#262833] rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
              >
                {col.coverImageUrl && (
                  <div className="relative aspect-[16/9] w-full bg-[#0d0e12]">
                    <ProgressiveImage
                      src={col.coverImageUrl}
                      alt={col.title}
                      fill
                      optimizeWidth={800}
                      optimizeQuality={85}
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#14151a] via-transparent to-transparent" />
                  </div>
                )}

                <div className="p-6 sm:p-8 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-semibold">
                      Featured Series
                    </span>
                    <h3 className="font-serif text-2xl text-white font-medium">
                      {col.title}
                    </h3>
                  </div>

                  <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed line-clamp-3">
                    {col.curatorialStatement || col.description}
                  </p>

                  <div className="pt-2 flex items-center justify-between border-t border-[#1c1d25]">
                    <span className="text-xs text-zinc-500 font-mono">
                      {col.artworkSlugs?.length || 1} Documented Canvases
                    </span>

                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-[#262833] bg-[#181920] hover:bg-[#22242e] text-[#d1a86e] hover:text-white text-xs uppercase tracking-wider"
                    >
                      <Link href={`/collections/${col.slug}`} className="flex items-center gap-1.5">
                        <span>Explore Series</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 4: EXHIBITIONS / VERNISSAGES
      ========================================================================= */}
      {activeTab === "exhibitions" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="border-b border-[#262833] pb-6">
            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
              Retrospectives &amp; Showcases
            </span>
            <h2 className="font-serif text-3xl text-white mt-1">
              Curated Exhibitions
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Chronology of museum installations, solo gallery shows, and private vernissages.
            </p>
          </div>

          <div className="space-y-6">
            {exhibitions.map((exh) => (
              <div
                key={exh.id}
                className="bg-[#14151a] border border-[#262833] rounded-3xl p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center shadow-xl"
              >
                {exh.coverImageUrl && (
                  <div className="lg:col-span-5 relative aspect-[16/10] rounded-2xl overflow-hidden border border-[#262833] bg-[#0d0e12]">
                    <ProgressiveImage
                      src={exh.coverImageUrl}
                      alt={exh.title}
                      fill
                      optimizeWidth={700}
                      optimizeQuality={85}
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge variant={exh.status === "current" ? "success" : "gold"}>
                        {exh.status === "current" ? "Currently Open" : "Upcoming"}
                      </Badge>
                    </div>
                  </div>
                )}

                <div className="lg:col-span-7 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] tracking-[0.2em] text-[#d1a86e] uppercase font-semibold">
                      {exh.subtitle || "Solo Exhibition"}
                    </span>
                    <h3 className="font-serif text-2xl sm:text-3xl text-white font-medium">
                      {exh.title}
                    </h3>
                  </div>

                  {exh.location && (
                    <div className="flex items-center gap-2 text-xs text-zinc-300">
                      <MapPin className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                      <span>{exh.location}</span>
                    </div>
                  )}

                  {exh.startDate && (
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
                      <Calendar className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                      <span>
                        {new Date(exh.startDate).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                        {exh.endDate && ` — ${new Date(exh.endDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`}
                      </span>
                    </div>
                  )}

                  <p className="text-xs sm:text-sm text-[#a6aabf] leading-relaxed">
                    {exh.description || exh.curatorNote}
                  </p>

                  <div className="pt-3 flex flex-wrap items-center gap-3">
                    <Button
                      asChild
                      className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-6"
                    >
                      <Link href={`/exhibitions/${exh.slug}`}>
                        <span>View Exhibition Catalog</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                      </Link>
                    </Button>

                    <Button
                      asChild
                      variant="outline"
                      className="rounded-full border-[#262833] bg-[#181920] hover:bg-[#22242e] text-zinc-300 text-xs uppercase tracking-wider"
                    >
                      <Link href={`/contact?subject=VIP%20Vernissage%20Request%20-%20${encodeURIComponent(exh.title)}`}>
                        <span>Request VIP Vernissage Pass</span>
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          TAB 5: INQUIRIES & ACQUISITIONS LEDGER
      ========================================================================= */}
      {activeTab === "inquiries" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262833] pb-6">
            <div>
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
                Studio Ledger
              </span>
              <h2 className="font-serif text-3xl text-white mt-1">
                Your Acquisition Inquiries
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                Direct correspondence recorded with Elena Vance's studio team.
              </p>
            </div>

            <Button
              asChild
              className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-6 self-start sm:self-auto"
            >
              <Link href="/contact">
                <Mail className="w-3.5 h-3.5 mr-1.5" />
                <span>Start New Inquiry</span>
              </Link>
            </Button>
          </div>

          {!user ? (
            <Card className="p-12 text-center bg-[#14151a] border-[#262833] rounded-3xl space-y-4 max-w-xl mx-auto my-6">
              <div className="w-14 h-14 rounded-full bg-[#1c1d25] border border-[#d1a86e]/30 flex items-center justify-center text-[#d1a86e] mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-white">Acquisition Ledger Locked</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Sign in to your collector account to review active inquiries, curatorial correspondence, and acquisition status.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-6">
                  <Link href="/login?redirect=/account?tab=inquiries">
                    <span>Sign In to Access Ledger</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-[#262833] text-zinc-300 text-xs uppercase tracking-wider px-6">
                  <Link href="/register?redirect=/account?tab=inquiries">
                    <span>Register Account</span>
                  </Link>
                </Button>
              </div>
            </Card>
          ) : userInquiries.length === 0 ? (
            <Card className="p-12 text-center bg-[#14151a]/50 border-[#262833] rounded-3xl space-y-4">
              <Mail className="w-10 h-10 text-zinc-600 mx-auto" />
              <h3 className="font-serif text-xl text-white">No active inquiries recorded</h3>
              <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
                When you inquire about acquiring an original painting or scheduling a private viewing, your studio correspondence will be tracked here in your private ledger.
              </p>
              <Button asChild className="rounded-full bg-[#d1a86e] text-[#0d0e12] text-xs uppercase tracking-wider">
                <Link href="/gallery">Browse Gallery to Inquire</Link>
              </Button>
            </Card>
          ) : (
            <div className="space-y-4">
              {userInquiries.map((inq) => (
                <Card
                  key={inq.id}
                  className="p-6 sm:p-8 bg-[#14151a] border-[#262833] rounded-3xl space-y-4 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1d25] pb-4">
                    <div className="flex items-center gap-3">
                      <Badge
                        variant={
                          inq.status === "replied"
                            ? "success"
                            : inq.status === "read"
                            ? "gold"
                            : "warning"
                        }
                      >
                        Status: {inq.status}
                      </Badge>
                      <h4 className="font-serif text-lg text-white font-medium">
                        {inq.subject}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                      <Clock className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>
                        {new Date(inq.createdAt).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#101116] p-4 sm:p-5 rounded-2xl border border-[#22242f] space-y-2">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                      Collector Message
                    </span>
                    <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                      {inq.message}
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                    <span>Studio ID: <span className="font-mono text-zinc-500">{inq.id}</span></span>
                    <Link
                      href={`/contact?subject=Follow-up%20re:%20${encodeURIComponent(inq.subject)}`}
                      className="text-[#d1a86e] hover:underline"
                    >
                      Send Follow-up Message &rarr;
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* =========================================================================
          TAB 6: SPATIAL AR SHOWROOM
      ========================================================================= */}
      {activeTab === "ar" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="border-b border-[#262833] pb-6">
            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
              Collector AR Studio
            </span>
            <h2 className="font-serif text-3xl text-white mt-1">
              In-Room Wall Simulator &amp; Spatial WebAR
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Test any painting calibrated to its exact centimeter dimensions against your living room or gallery wall.
            </p>
          </div>

          <InteractiveRoomPreviewer
            artworks={artworks}
            sectionTitle="Collector Interior Calibration Studio"
            sectionSubtitle="WebAR & Physical Scale Reference"
            sectionDescription="Choose from curated architectural walls and bespoke framing options, or scan the QR code to project live on your mobile device."
          />
        </div>
      )}

      {/* =========================================================================
          TAB 7: COLLECTOR PROFILE & SETTINGS
      ========================================================================= */}
      {activeTab === "profile" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="border-b border-[#262833] pb-6">
            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
              Account Dossier
            </span>
            <h2 className="font-serif text-3xl text-white mt-1">
              Collector Profile &amp; Preferences
            </h2>
            <p className="text-xs text-zinc-400 mt-1">
              Manage your verified credentials and studio dispatch preferences.
            </p>
          </div>

          {!user ? (
            <Card className="p-12 text-center bg-[#14151a] border-[#262833] rounded-3xl space-y-4 max-w-xl mx-auto my-6">
              <div className="w-14 h-14 rounded-full bg-[#1c1d25] border border-[#d1a86e]/30 flex items-center justify-center text-[#d1a86e] mx-auto">
                <User className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-2xl text-white">Collector Profile Locked</h3>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                Sign in to manage your collector profile, save fine art delivery destinations, and configure private vernissage invitations.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-6">
                  <Link href="/login?redirect=/account?tab=profile">
                    <span>Sign In to Profile</span>
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full border-[#262833] text-zinc-300 text-xs uppercase tracking-wider px-6">
                  <Link href="/register?redirect=/account?tab=profile">
                    <span>Register Account</span>
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Profile Card & White-Glove Shipping */}
              <div className="lg:col-span-7 space-y-6">
                {/* Profile Card */}
                <div className="bg-[#14151a] border border-[#262833] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-[#1c1d25] border border-[#262833] flex items-center justify-center font-serif text-2xl text-[#d1a86e]">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-serif text-2xl text-white">{user.name}</h3>
                      <p className="text-xs text-zinc-400 font-mono">{user.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="success">Verified Collector</Badge>
                        <span className="text-[10px] text-zinc-500 font-mono">Role: {user.role}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#1c1d25] text-xs">
                    <div className="space-y-1">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Collector ID</span>
                      <p className="font-mono text-zinc-300 truncate">{user.id}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-zinc-500 uppercase tracking-wider text-[10px]">Membership Tier</span>
                      <p className="text-zinc-300">Private Studio Client (Elena Vance Paris)</p>
                    </div>
                  </div>
                </div>

                {/* White-Glove Shipping & Delivery Info */}
                <div className="bg-[#14151a] border border-[#262833] rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-[#d1a86e] font-semibold">
                    <Package className="w-4 h-4" />
                    <span>Fine Art Delivery &amp; Crate Protocol</span>
                  </div>
                  <h4 className="font-serif text-lg text-white">
                    Insured International Transit Standards
                  </h4>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    All acquired canvases are encased in custom thermal-insulated wooden crates with hygrometric shock buffering. When you confirm an acquisition inquiry, your dedicated fine art courier details will appear here.
                  </p>
                </div>
              </div>

              {/* Right Column: Preferences & Sign Out */}
              <div className="lg:col-span-5 space-y-6">
                {/* Marketing & Vernissage Dispatch Toggle */}
                <MarketingPreferenceToggle initialSubscribed={marketingSubscribed} />

                <div className="p-6 rounded-3xl bg-[#14151a] border border-[#262833] space-y-4 shadow-xl">
                  <div className="space-y-1">
                    <h4 className="font-serif text-lg text-white">Session Management</h4>
                    <p className="text-xs text-zinc-400">
                      Sign out of your active private collector salon session.
                    </p>
                  </div>
                  <Button
                    onClick={handleSignOut}
                    variant="outline"
                    className="w-full rounded-full border-[#262833] bg-[#181920] hover:bg-rose-950/40 hover:text-rose-400 text-zinc-300 text-xs uppercase tracking-wider h-10"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    <span>Sign Out of Collector Salon</span>
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. FLOATING INTERACTIVE MAGICUI DOCK (THE DOCK) */}
      <CollectorDock
        activeTab={activeTab}
        onTabChange={handleTabChange}
        inquiriesCount={userInquiries.length}
        cartCount={cartArtworkIds.length}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* 4. HIGH-RESOLUTION ARTWORK QUICK VIEW MODAL */}
      <ArtworkQuickViewModal
        artwork={inspectArtwork}
        isOpen={!!inspectArtwork}
        onClose={() => setInspectArtwork(null)}
        onToggleCart={(art) => toggleCartArtwork(art.id)}
        isInCart={inspectArtwork ? cartArtworkIds.includes(inspectArtwork.id) : false}
        onToggleSave={(art) => toggleSaveArtwork(art.id)}
        isSaved={inspectArtwork ? savedArtworkIds.includes(inspectArtwork.id) : false}
      />

      {/* 5. ACQUISITION PORTFOLIO CART / DOSSIER MODAL */}
      <AcquisitionCartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartArtworkIds={cartArtworkIds}
        artworks={artworks}
        onRemoveItem={removeFromCart}
        onClearCart={clearCart}
        user={user}
        onInquirySubmitted={() => {
          handleTabChange("inquiries");
        }}
      />

      {/* 6. LOGIN REQUIRED MODAL (When liking paintings or contacting without an account) */}
      {loginPromptReason && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setLoginPromptReason(null)}
        >
          <div
            className="relative w-full max-w-md bg-[#14151a] border border-[#2b2e3c] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center text-[#f4f4f6]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-14 h-14 rounded-full bg-[#d1a86e]/15 border border-[#d1a86e]/30 flex items-center justify-center text-[#d1a86e] mx-auto">
              {loginPromptReason === "like" ? (
                <Heart className="w-6 h-6 fill-current" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
                Private Salon Protocol
              </span>
              <h3 className="font-serif text-2xl text-white font-medium">
                {loginPromptReason === "like"
                  ? "Sign In to Save Paintings"
                  : "Sign In to Contact Studio"}
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {loginPromptReason === "like"
                  ? "Sign in or create a complimentary collector account to curate your personal shortlist, synchronize liked works across devices, and request private studio viewings."
                  : "To correspond directly with Madame Vance's curatorial desk and inquire about original acquisitions, please sign in with your collector credentials."}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[#0f1015] border border-[#22242f] text-left text-xs text-zinc-300 space-y-2">
              <div className="flex items-center gap-2 text-zinc-300">
                <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
                <span>Private portfolio curation &amp; bookmarking</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
                <span>Priority response from gallery liaison</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
                <span>Preview paintings in AR without login</span>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <Button
                asChild
                className="w-full rounded-full bg-gradient-to-r from-[#d1a86e] via-[#e2c18d] to-[#b98e54] text-[#0d0e12] font-semibold text-xs tracking-wider uppercase h-11 shadow-lg shadow-[#d1a86e]/20"
              >
                <Link href={`/login?redirect=${encodeURIComponent("/account?tab=gallery")}`}>
                  <span>Sign In with Email &amp; Password</span>
                </Link>
              </Button>

              <Button
                asChild
                variant="outline"
                className="w-full rounded-full border-[#2b2e3c] bg-[#181920] hover:bg-[#22242e] text-zinc-200 text-xs tracking-wider uppercase h-11"
              >
                <Link href={`/register?redirect=${encodeURIComponent("/account?tab=gallery")}`}>
                  <span>Register Free Collector Account</span>
                </Link>
              </Button>

              <button
                onClick={() => setLoginPromptReason(null)}
                className="text-xs text-zinc-500 hover:text-zinc-300 pt-2 transition-colors uppercase tracking-wider"
              >
                Continue Browsing as Guest
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

