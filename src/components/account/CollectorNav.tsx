"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Shield,
  LogOut,
  User as UserIcon,
  ChevronDown,
  Layers,
  Heart,
  ShoppingBag,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface CollectorNavProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    image?: string | null;
  } | null;
  inquiriesCount?: number;
}

export function CollectorNav({ user, inquiriesCount = 0 }: CollectorNavProps) {
  const [cartCount, setCartCount] = useState(0);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    // Initial sync from localStorage
    try {
      const saved = localStorage.getItem("atelier_collector_saved_works");
      if (saved) setSavedCount(JSON.parse(saved).length);
      const cart = localStorage.getItem("atelier_collector_cart_works");
      if (cart) setCartCount(JSON.parse(cart).length);
    } catch {
      // ignore SSR
    }

    const handleCartUpdated = (e: any) => {
      const count = Array.isArray(e.detail) ? e.detail.length : typeof e.detail === "number" ? e.detail : 0;
      setCartCount(count);
    };

    const handleSavedUpdated = (e: any) => {
      const count = Array.isArray(e.detail) ? e.detail.length : typeof e.detail === "number" ? e.detail : 0;
      setSavedCount(count);
    };

    window.addEventListener("atelier-cart-updated", handleCartUpdated);
    window.addEventListener("atelier-saved-updated", handleSavedUpdated);

    return () => {
      window.removeEventListener("atelier-cart-updated", handleCartUpdated);
      window.removeEventListener("atelier-saved-updated", handleSavedUpdated);
    };
  }, []);

  const handleOpenCart = () => {
    window.dispatchEvent(new CustomEvent("atelier-open-cart"));
  };

  const handleViewLiked = () => {
    window.dispatchEvent(new CustomEvent("atelier-view-liked"));
  };

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    window.location.href = "/";
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0d0e12]/95 backdrop-blur-xl border-b border-[#22242f] px-4 sm:px-6 md:pl-20 md:pr-8 lg:pl-24 lg:pr-10 xl:pl-28 xl:pr-12 py-3.5 shadow-lg shadow-black/40">
      <div className="w-full flex items-center justify-between gap-4">
        {/* Left: Brand Identity & Portal Pill */}
        <div className="flex items-center gap-3.5">
          <Link
            href="/account"
            className="flex items-center gap-2.5 group focus-visible:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d1a86e] to-[#8d6f3e] p-[1px] shadow-sm">
              <div className="w-full h-full rounded-[7px] bg-[#0d0e12] flex items-center justify-center text-[#d1a86e] group-hover:bg-[#151720] transition-colors">
                <Sparkles className="w-4 h-4 text-[#d1a86e]" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-serif text-sm sm:text-base tracking-[0.15em] font-medium text-white group-hover:text-[#d1a86e] transition-colors uppercase">
                L&apos;Atelier Lumineux
              </span>
              <span className="text-[9px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
                Collector Portal
              </span>
            </div>
          </Link>

          {/* Verification Badge */}
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#161720] border border-[#2b2e3c] text-[10px] uppercase tracking-wider text-zinc-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Private Salon</span>
          </div>
        </div>

        {/* Center / Link to Public Showcase & Left Dock Hint */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#14151c] border border-[#262833] hover:border-[#3d4052] text-xs text-zinc-300 hover:text-white transition-all shadow-sm group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#d1a86e] transition-transform group-hover:-translate-x-1" />
            <span className="text-[11px] uppercase tracking-wider font-medium">
              Exit to Public Gallery &amp; Landing
            </span>
          </Link>

          <div className="hidden xl:flex items-center gap-1.5 text-[11px] text-zinc-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e]/60 animate-pulse" />
            <span>Hover left edge for dock</span>
          </div>
        </div>

        {/* Right Actions & User Menu */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Liked / Saved Works Trigger */}
          <button
            onClick={handleViewLiked}
            className={cn(
              "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all shadow-sm group border",
              savedCount > 0
                ? "bg-[#161722] border-[#d1a86e]/30 hover:border-[#d1a86e] text-zinc-300 hover:text-white"
                : "bg-[#14151c] border-[#262833] text-zinc-400 hover:text-zinc-200"
            )}
            title="View Liked Paintings in Catalogue"
            aria-label="View liked artworks"
          >
            <Heart
              className={cn(
                "w-3.5 h-3.5 transition-transform group-hover:scale-110",
                savedCount > 0 ? "text-[#d1a86e] fill-[#d1a86e]" : "text-zinc-500"
              )}
            />
            <span className="hidden xs:inline text-[11px] font-medium tracking-wide">
              Liked
            </span>
            <span
              className={cn(
                "text-[10px] font-mono px-1 rounded",
                savedCount > 0 ? "text-[#d1a86e] font-bold" : "text-zinc-500"
              )}
            >
              {savedCount}
            </span>
          </button>

          {/* Acquisition Dossier (Cart) Trigger */}
          <button
            onClick={handleOpenCart}
            className={cn(
              "relative inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs transition-all shadow-md group border",
              cartCount > 0
                ? "bg-[#181a24] border-[#d1a86e]/60 hover:border-[#d1a86e] text-white hover:bg-[#202330] shadow-[#d1a86e]/10"
                : "bg-[#14151c] border-[#262833] text-zinc-300 hover:text-white hover:border-[#383b4b]"
            )}
            title="Open Acquisition Dossier"
            aria-label="Open Acquisition Cart"
          >
            <ShoppingBag
              className={cn(
                "w-3.5 h-3.5 transition-transform group-hover:scale-110",
                cartCount > 0 ? "text-[#d1a86e]" : "text-zinc-400"
              )}
            />
            <span className="hidden sm:inline text-[11px] font-medium tracking-wide">
              Dossier
            </span>
            <span
              className={cn(
                "flex h-4 min-w-4 px-1 items-center justify-center rounded-full text-[10px] font-bold font-mono transition-colors",
                cartCount > 0
                  ? "bg-[#d1a86e] text-[#0d0e12]"
                  : "bg-zinc-800 text-zinc-400"
              )}
            >
              {cartCount}
            </span>
          </button>

          {/* Quick exit on mobile */}
          <Link
            href="/"
            className="md:hidden inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#14151c] border border-[#262833] text-[10px] text-zinc-300 hover:text-white"
          >
            <ArrowLeft className="w-3 h-3 text-[#d1a86e]" />
            <span>Exit</span>
          </Link>

          {/* Authenticated User Actions or Guest Sign In */}
          {user ? (
            <>
              {/* Admin Switcher */}
              {user.role === "ADMIN" && (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="hidden lg:inline-flex h-8 px-3 rounded-full border-amber-900/60 bg-amber-950/30 hover:bg-amber-900/50 text-amber-200 text-xs font-medium uppercase tracking-wider"
                >
                  <Link href="/admin/dashboard" className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Studio CMS</span>
                  </Link>
                </Button>
              )}

              {/* Collector User Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full bg-[#15161f] border border-[#2b2e3c] hover:border-[#404457] transition-all focus:outline-none"
                  >
                    <Avatar size="sm" className="h-7 w-7 border border-[#d1a86e]/30">
                      <AvatarFallback className="text-xs text-[#d1a86e] font-serif bg-[#1c1e28]">
                        {user.name?.[0]?.toUpperCase() || "C"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden sm:flex flex-col text-left">
                      <span className="text-xs text-white font-medium max-w-[110px] truncate leading-tight">
                        {user.name}
                      </span>
                      <span className="text-[9px] text-[#d1a86e] uppercase tracking-wider">
                        {user.role === "ADMIN" ? "Curator / Admin" : "VIP Collector"}
                      </span>
                    </div>
                    <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2 bg-[#121319] border-[#2b2e3c]">
                  <DropdownMenuLabel className="px-2 py-1.5">
                    <div className="flex flex-col space-y-0.5">
                      <span className="text-xs font-semibold text-white truncate">
                        {user.name}
                      </span>
                      <span className="text-[11px] text-zinc-500 font-mono truncate">
                        {user.email}
                      </span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#242633]" />

                  <DropdownMenuItem asChild>
                    <Link
                      href="/account?tab=profile"
                      className="flex items-center gap-2 text-zinc-300 hover:text-white cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Profile &amp; Preferences</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleViewLiked}
                    className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer w-full"
                  >
                    <div className="flex items-center gap-2">
                      <Heart className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>Liked Paintings</span>
                    </div>
                    {savedCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-[#1e202c] text-[#d1a86e] border border-[#d1a86e]/30">
                        {savedCount}
                      </span>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem
                    onClick={handleOpenCart}
                    className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer w-full"
                  >
                    <div className="flex items-center gap-2">
                      <ShoppingBag className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>Acquisition Dossier</span>
                    </div>
                    {cartCount > 0 && (
                      <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-[#d1a86e] text-[#0d0e12]">
                        {cartCount}
                      </span>
                    )}
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/account?tab=inquiries"
                      className="flex items-center justify-between text-zinc-300 hover:text-white cursor-pointer w-full"
                    >
                      <div className="flex items-center gap-2">
                        <Layers className="w-3.5 h-3.5 text-zinc-400" />
                        <span>My Inquiries</span>
                      </div>
                      {inquiriesCount > 0 && (
                        <span className="px-1.5 py-0.5 text-[9px] font-mono font-semibold rounded-full bg-[#d1a86e] text-[#0d0e12]">
                          {inquiriesCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>

                  {user.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator className="bg-[#242633]" />
                      <DropdownMenuItem asChild>
                        <Link
                          href="/admin/dashboard"
                          className="flex items-center gap-2 text-amber-300 hover:text-amber-200 cursor-pointer"
                        >
                          <Shield className="w-3.5 h-3.5 text-amber-400" />
                          <span>Studio Admin CMS</span>
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}

                  <DropdownMenuSeparator className="bg-[#242633]" />
                  <DropdownMenuItem asChild>
                    <Link
                      href="/"
                      className="flex items-center gap-2 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>View Public Landing Page</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator className="bg-[#242633]" />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/40 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button
                asChild
                size="sm"
                className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] font-semibold text-xs tracking-wider uppercase px-4 h-8 shadow-md shadow-[#d1a86e]/15"
              >
                <Link href="/login?redirect=/account">
                  <span>Sign In</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
