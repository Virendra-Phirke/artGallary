"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  MockArtwork,
  MockCollection,
  MockExhibition,
  MockInquiry,
} from "@/db/mockData";
import { CollectorTab } from "@/components/account/CollectorDock";

export interface CollectorUser {
  id: string;
  name: string;
  email: string;
  role: string;
  image?: string | null;
}

interface CollectorContextValue {
  user: CollectorUser | null;
  artworks: MockArtwork[];
  collections: MockCollection[];
  exhibitions: MockExhibition[];
  userInquiries: MockInquiry[];
  marketingSubscribed: boolean;

  // Active Tab
  activeTab: CollectorTab;
  setActiveTab: (tab: CollectorTab) => void;

  // Shortlist / Liked works
  savedArtworkIds: string[];
  toggleSaveArtwork: (artworkId: string) => void;
  isArtworkSaved: (artworkId: string) => boolean;
  addAllLikedToCart: () => void;

  // Acquisition Cart / Dossier
  cartArtworkIds: string[];
  toggleCartArtwork: (artworkId: string) => void;
  removeFromCart: (artworkId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;

  // Quick View / Inspect
  inspectArtwork: MockArtwork | null;
  setInspectArtwork: (art: MockArtwork | null) => void;

  // Intent-Gated Login Prompt
  loginPromptReason: "like" | "add" | "contact" | "inquiries" | "profile" | null;
  setLoginPromptReason: (reason: "like" | "add" | "contact" | "inquiries" | "profile" | null) => void;
  triggerContact: (artworkTitle?: string) => void;

  // Auth Actions
  handleSignOut: () => Promise<void>;
}

const CollectorContext = createContext<CollectorContextValue | undefined>(undefined);

export interface CollectorProviderProps {
  children: React.ReactNode;
  user: CollectorUser | null;
  artworks?: MockArtwork[];
  collections?: MockCollection[];
  exhibitions?: MockExhibition[];
  userInquiries?: MockInquiry[];
  marketingSubscribed?: boolean;
  initialTab?: CollectorTab;
}

export function CollectorProvider({
  children,
  user,
  artworks = [],
  collections = [],
  exhibitions = [],
  userInquiries = [],
  marketingSubscribed = true,
  initialTab = "overview",
}: CollectorProviderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Tab State with URL synchronization
  const urlTab = searchParams.get("tab") as CollectorTab | null;
  const [activeTab, setActiveTabState] = useState<CollectorTab>(
    urlTab && ["overview", "gallery", "collections", "exhibitions", "inquiries", "ar", "profile"].includes(urlTab)
      ? urlTab
      : initialTab
  );

  const setActiveTab = useCallback(
    (tab: CollectorTab) => {
      setActiveTabState(tab);
      const params = new URLSearchParams(window.location.search);
      params.set("tab", tab);
      router.replace(`/account?${params.toString()}`, { scroll: false });
    },
    [router]
  );

  // Sync tab with external navigation or back/forward buttons
  useEffect(() => {
    if (urlTab && ["overview", "gallery", "collections", "exhibitions", "inquiries", "ar", "profile"].includes(urlTab)) {
      setActiveTabState(urlTab);
    }
  }, [urlTab]);

  // Inspect Modal
  const [inspectArtwork, setInspectArtwork] = useState<MockArtwork | null>(null);

  // Cart / Dossier State
  const [cartArtworkIds, setCartArtworkIds] = useState<string[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Saved / Liked works state
  const [savedArtworkIds, setSavedArtworkIds] = useState<string[]>([]);

  // Intent-Gated Login Prompt
  const [loginPromptReason, setLoginPromptReason] = useState<"like" | "add" | "contact" | "inquiries" | "profile" | null>(null);

  // Intent-Gated Contact Trigger
  const triggerContact = useCallback((artworkTitle?: string) => {
    if (!user) {
      setLoginPromptReason("contact");
    } else {
      window.location.href = artworkTitle
        ? `/#contact?artwork=${encodeURIComponent(artworkTitle)}`
        : "/#contact";
    }
  }, [user]);

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

    const handleOpenCart = () => setIsCartOpen(true);
    const handleViewLiked = () => {
      setActiveTab("gallery");
    };

    window.addEventListener("atelier:open-cart", handleOpenCart);
    window.addEventListener("atelier:view-liked", handleViewLiked);

    return () => {
      window.removeEventListener("atelier:open-cart", handleOpenCart);
      window.removeEventListener("atelier:view-liked", handleViewLiked);
    };
  }, [setActiveTab]);

  // Cart mutations
  const toggleCartArtwork = useCallback((id: string) => {
    if (!user) {
      setLoginPromptReason("add");
      return;
    }
    setCartArtworkIds((prev) => {
      const next = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      try {
        localStorage.setItem("atelier_collector_cart_works", JSON.stringify(next));
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent("atelier:cart-updated", { detail: { count: next.length } }));
      return next;
    });
  }, [user]);

  const removeFromCart = useCallback((id: string) => {
    setCartArtworkIds((prev) => {
      const next = prev.filter((item) => item !== id);
      try {
        localStorage.setItem("atelier_collector_cart_works", JSON.stringify(next));
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent("atelier:cart-updated", { detail: { count: next.length } }));
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCartArtworkIds([]);
    try {
      localStorage.removeItem("atelier_collector_cart_works");
    } catch {
      // ignore
    }
    window.dispatchEvent(new CustomEvent("atelier:cart-updated", { detail: { count: 0 } }));
  }, []);

  // Save / Bookmark mutations
  const toggleSaveArtwork = useCallback(
    (id: string) => {
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
        window.dispatchEvent(new CustomEvent("atelier:saved-updated", { detail: { count: next.length } }));
        return next;
      });
    },
    [user]
  );

  const isArtworkSaved = useCallback(
    (id: string) => savedArtworkIds.includes(id),
    [savedArtworkIds]
  );

  const addAllLikedToCart = useCallback(() => {
    if (!user) {
      setLoginPromptReason("add");
      return;
    }
    setCartArtworkIds((prev) => {
      const set = new Set([...prev, ...savedArtworkIds]);
      const next = Array.from(set);
      try {
        localStorage.setItem("atelier_collector_cart_works", JSON.stringify(next));
      } catch {
        // ignore
      }
      window.dispatchEvent(new CustomEvent("atelier:cart-updated", { detail: { count: next.length } }));
      return next;
    });
    setIsCartOpen(true);
  }, [user, savedArtworkIds]);

  const handleSignOut = useCallback(async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/";
  }, []);

  const value = useMemo(
    () => ({
      user,
      artworks,
      collections,
      exhibitions,
      userInquiries,
      marketingSubscribed,
      activeTab,
      setActiveTab,
      savedArtworkIds,
      toggleSaveArtwork,
      isArtworkSaved,
      addAllLikedToCart,
      cartArtworkIds,
      toggleCartArtwork,
      removeFromCart,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      inspectArtwork,
      setInspectArtwork,
      loginPromptReason,
      setLoginPromptReason,
      triggerContact,
      handleSignOut,
    }),
    [
      user,
      artworks,
      collections,
      exhibitions,
      userInquiries,
      marketingSubscribed,
      activeTab,
      setActiveTab,
      savedArtworkIds,
      toggleSaveArtwork,
      isArtworkSaved,
      addAllLikedToCart,
      cartArtworkIds,
      toggleCartArtwork,
      removeFromCart,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      inspectArtwork,
      setInspectArtwork,
      loginPromptReason,
      setLoginPromptReason,
      triggerContact,
      handleSignOut,
    ]
  );

  return <CollectorContext.Provider value={value}>{children}</CollectorContext.Provider>;
}

export function useCollector() {
  const context = useContext(CollectorContext);
  if (!context) {
    throw new Error("useCollector must be used within a CollectorProvider");
  }
  return context;
}
