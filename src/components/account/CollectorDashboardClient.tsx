"use client";

import React from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Shield,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  MockArtwork,
  MockCollection,
  MockExhibition,
  MockInquiry,
} from "@/db/mockData";
import { CollectorTab, CollectorDock } from "@/components/account/CollectorDock";
import { ArtworkQuickViewModal } from "@/components/public/ArtworkQuickViewModal";
import { AcquisitionCartModal } from "@/components/account/AcquisitionCartModal";
import { SalonAuthGateModal } from "@/components/account/modals/SalonAuthGateModal";
import {
  CollectorProvider,
  useCollector,
  CollectorUser,
} from "@/components/account/context/CollectorContext";

// Modular Domain Tabs
import { OverviewTab } from "@/components/account/tabs/OverviewTab";
import { CatalogueTab } from "@/components/account/tabs/CatalogueTab";
import { SeriesTab } from "@/components/account/tabs/SeriesTab";
import { ExhibitionsTab } from "@/components/account/tabs/ExhibitionsTab";
import { SpatialStudioTab } from "@/components/account/tabs/SpatialStudioTab";
import { InquiriesTab } from "@/components/account/tabs/InquiriesTab";
import { ProfileTab } from "@/components/account/tabs/ProfileTab";

interface CollectorDashboardClientProps {
  user: CollectorUser | null;
  artworks: MockArtwork[];
  collections: MockCollection[];
  exhibitions: MockExhibition[];
  userInquiries: MockInquiry[];
  marketingSubscribed: boolean;
  initialTab?: CollectorTab;
}

const TAB_METADATA: Record<CollectorTab, { title: string; subtitle: string; tag: string }> = {
  overview: {
    tag: "Collector Suite",
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
    tag: "Spatial Reality",
    title: "Spatial AR Showroom",
    subtitle: "Preview authentic physical artwork dimensions in your private interior.",
  },
  profile: {
    tag: "Verified Collector",
    title: "Collector Profile & Settings",
    subtitle: "Credentials, authentication status, and dispatch subscriptions.",
  },
};

function CollectorDashboardContent() {
  const {
    user,
    artworks,
    collections,
    exhibitions,
    userInquiries,
    activeTab,
    setActiveTab,
    cartArtworkIds,
    toggleCartArtwork,
    removeFromCart,
    clearCart,
    isCartOpen,
    setIsCartOpen,
    savedArtworkIds,
    toggleSaveArtwork,
    inspectArtwork,
    setInspectArtwork,
  } = useCollector();

  const currentMeta = TAB_METADATA[activeTab] || TAB_METADATA.overview;

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {/* 1. HERO TAB BANNER WITH CURATORIAL CHIPS */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#181920] via-[#121318] to-[#0d0e12] border border-[#262833] p-6 sm:p-8 lg:p-10 shadow-2xl space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d1a86e]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#d1a86e]/10 border border-[#d1a86e]/30 text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e] animate-pulse" />
                {currentMeta.tag}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-wider uppercase">
                {user ? `Verified Collector (${user.name})` : "Guest Salon Access"}
              </span>
            </div>

            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-white font-normal tracking-tight">
              {currentMeta.title}
            </h1>

            <p className="text-xs sm:text-sm text-[#9ca3af] max-w-2xl leading-relaxed font-light">
              {currentMeta.subtitle}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => setActiveTab("ar")}
              variant="outline"
              className="rounded-full border-[#2b2e3d] bg-[#14151c] hover:bg-[#1d1f2b] hover:border-[#d1a86e]/50 text-white text-xs font-semibold uppercase tracking-wider px-5 h-10 shadow-lg cursor-pointer transition-all active:scale-[0.98]"
            >
              <Sparkles className="w-3.5 h-3.5 mr-2 text-[#d1a86e]" />
              <span>Launch AR Studio</span>
            </Button>

            {user?.role === "ADMIN" && (
              <Button
                asChild
                className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] font-semibold text-xs uppercase tracking-wider px-5 h-10 shadow-md shadow-[#d1a86e]/15 transition-all active:scale-[0.98]"
              >
                <Link href="/admin/dashboard" className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#0d0e12]" />
                  <span>Studio CMS</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#0d0e12]" />
                </Link>
              </Button>
            )}
          </div>
        </div>

        {/* Curatorial Status Bar */}
        <div className="relative z-10 pt-5 border-t border-[#22242f] flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14151a] border border-[#262833] text-xs text-zinc-300">
              <span className="text-[#d1a86e] font-semibold font-mono">{artworks.length}</span> Originals
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14151a] border border-[#262833] text-xs text-zinc-300">
              <span className="text-[#d1a86e] font-semibold font-mono">{collections.length}</span> Curatorial Series
            </span>
            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14151a] hover:bg-[#1a1b24] border border-[#262833] hover:border-[#d1a86e]/50 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3 h-3 text-[#d1a86e]" />
              <span className="text-[#d1a86e] font-semibold font-mono">{cartArtworkIds.length}</span> in Dossier
            </button>
            <button
              onClick={() => setActiveTab("inquiries")}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#14151a] hover:bg-[#1a1b24] border border-[#262833] hover:border-[#d1a86e]/50 text-xs text-zinc-300 hover:text-white transition-all cursor-pointer"
            >
              <span className="text-[#d1a86e] font-semibold font-mono">{userInquiries.length}</span> Ledger Inquiries
            </button>
          </div>

          <div className="text-[11px] text-zinc-500 font-mono hidden sm:flex items-center gap-2">
            <span>Room:</span>
            <span className="text-[#d1a86e] uppercase tracking-wider">{currentMeta.title}</span>
          </div>
        </div>
      </div>

      {/* 2. MODULAR DOMAIN TAB ROUTING */}
      {activeTab === "overview" && <OverviewTab />}
      {activeTab === "gallery" && <CatalogueTab />}
      {activeTab === "collections" && <SeriesTab />}
      {activeTab === "exhibitions" && <ExhibitionsTab />}
      {activeTab === "ar" && <SpatialStudioTab />}
      {activeTab === "inquiries" && <InquiriesTab />}
      {activeTab === "profile" && <ProfileTab />}

      {/* 3. FLOATING INTERACTIVE MAGICUI DOCK */}
      <CollectorDock
        activeTab={activeTab}
        onTabChange={setActiveTab}
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
          setActiveTab("inquiries");
        }}
      />

      {/* 6. CONTEXT-AWARE SALON AUTH GATE MODAL */}
      <SalonAuthGateModal />
    </div>
  );
}

export function CollectorDashboardClient(props: CollectorDashboardClientProps) {
  return (
    <CollectorProvider {...props}>
      <CollectorDashboardContent />
    </CollectorProvider>
  );
}
