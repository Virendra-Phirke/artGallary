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
import { CollectorAuthGateModal } from "@/components/account/modals/CollectorAuthGateModal";
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
    tag: "Vernissages & Previews",
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
    <div className="w-full max-w-full overflow-x-hidden space-y-4 sm:space-y-8 animate-in fade-in duration-300">
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

      {/* 6. CONTEXT-AWARE COLLECTOR AUTH GATE MODAL */}
      <CollectorAuthGateModal />
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
