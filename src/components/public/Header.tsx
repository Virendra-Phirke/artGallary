"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  Sparkles,
  User,
  Shield,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Layers,
} from "lucide-react";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { SiteSettingsData } from "@/db/mockData";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

interface HeaderProps {
  settings?: SiteSettingsData;
}

export function Header({ settings }: HeaderProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    // Check active session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data?.session?.user) {
          setUser(data.session.user);
        }
      })
      .catch(() => {});

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (pathname !== "/") {
      setActiveSection("");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.2, rootMargin: "-80px 0px -40% 0px" }
    );

    const aboutEl = document.getElementById("about");
    const contactEl = document.getElementById("contact");
    if (aboutEl) observer.observe(aboutEl);
    if (contactEl) observer.observe(contactEl);

    return () => observer.disconnect();
  }, [pathname]);

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    setUser(null);
    window.location.reload();
  };

  const resolveHref = (href: string, label: string) => {
    if (href === "/about" || label.toLowerCase() === "about") return "/#about";
    if (href === "/contact" || label.toLowerCase() === "contact") return "/#contact";
    return href;
  };

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      const elem = document.getElementById(targetId);
      if (elem) {
        elem.scrollIntoView({ behavior: "smooth" });
        window.history.pushState(null, "", `#${targetId}`);
        setActiveSection(targetId);
      }
    }
  };

  const handleMobileNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    setMobileMenuOpen(false);
    if (href.startsWith("/#") && pathname === "/") {
      e.preventDefault();
      const targetId = href.replace("/#", "");
      setTimeout(() => {
        const elem = document.getElementById(targetId);
        if (elem) {
          elem.scrollIntoView({ behavior: "smooth" });
          window.history.pushState(null, "", `#${targetId}`);
          setActiveSection(targetId);
        }
      }, 200);
    }
  };

  // Public navbar displays exclusively About and Contact (all curation, catalog, series, and exhibitions are housed in the Collector Portal)
  const excludedNavPatterns = ["/gallery", "/collections", "/exhibitions"];
  const rawLinks = settings?.navigationItems
    ? settings.navigationItems.filter((i) => i.isEnabled).sort((a, b) => a.order - b.order)
    : [
        { label: "About", href: "/#about" },
        { label: "Contact", href: "/#contact" },
      ];
  const filteredLinks = rawLinks.filter(
    (l) =>
      !excludedNavPatterns.some((p) => l.href.startsWith(p)) &&
      !["gallery", "collection", "exhibition"].some((k) => l.label.toLowerCase().includes(k))
  );
  const navLinks = (filteredLinks.length > 0 ? filteredLinks : [
    { label: "About", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ]).map((item) => ({
    ...item,
    href: resolveHref(item.href, item.label),
  }));

  const brandTitle = settings?.siteTitle || "L'Atelier Lumineux";
  const brandSubtitle = settings?.shortBrandName
    ? `${settings.shortBrandName} Studio`
    : settings?.artistName
    ? `${settings.artistName} Studio`
    : "Elena Vance Studio";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 w-full max-w-full ${
        scrolled
          ? "bg-[#0d0e12]/95 backdrop-blur-md py-2.5 sm:py-3.5 shadow-xl shadow-black/40"
          : "bg-gradient-to-b from-[#0d0e12]/90 to-transparent py-3 sm:py-5 md:py-6"
      }`}
    >
      <div className="max-w-[1800px] mx-auto px-2.5 xs:px-3 sm:px-8 md:px-12 lg:px-16 flex items-center justify-between gap-2 w-full min-w-0">
        {/* Gallery Brand Title */}
        <Link
          href="/"
          className="group flex flex-col items-start focus-visible:outline-none min-w-0 shrink"
        >
          {settings?.headerConfig?.logoType === "image" && settings.logoUrl ? (
            <img src={settings.logoUrl} alt={brandTitle} className="h-7 sm:h-8 w-auto object-contain" />
          ) : (
            <>
              <span className="font-serif text-sm xs:text-base sm:text-xl md:text-2xl tracking-[0.1em] sm:tracking-[0.2em] font-medium text-white group-hover:text-[#d1a86e] transition-colors uppercase truncate max-w-[150px] xs:max-w-[220px] sm:max-w-none">
                {brandTitle}
              </span>
              <span className="text-[8px] sm:text-[10px] tracking-[0.2em] sm:tracking-[0.3em] text-[#8e92a4] uppercase font-light -mt-0.5 truncate max-w-[150px] xs:max-w-[220px] sm:max-w-none">
                {brandSubtitle}
              </span>
            </>
          )}
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
          {navLinks.map((link) => {
            const isAnchor = link.href.startsWith("/#");
            const anchorId = isAnchor ? link.href.replace("/#", "") : "";
            const isActive = isAnchor
              ? pathname === "/" && activeSection === anchorId
              : pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className={`text-xs uppercase tracking-[0.2em] font-medium transition-colors relative py-1 ${
                  isActive
                    ? "text-[#d1a86e]"
                    : "text-[#a6aabf] hover:text-white"
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-[1px] bg-[#d1a86e]" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Desktop CTA & Auth Dropdown */}
        <div className="hidden md:flex items-center space-x-3">
          {!user && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="rounded-full border-[#d1a86e]/40 text-[#d1a86e] hover:bg-[#d1a86e]/10 text-xs uppercase tracking-wider h-8 px-3.5"
            >
              <Link href="/account" className="flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-[#d1a86e]" />
                <span>Collector Portal</span>
              </Link>
            </Button>
          )}

          {user ? (
            <div className="flex items-center gap-2.5">
              <Button
                asChild
                size="sm"
                className="rounded-full h-8 px-3.5 bg-gradient-to-r from-[#d1a86e] to-[#b38947] text-[#0d0e12] font-semibold text-xs hover:opacity-95 shadow-md shadow-[#d1a86e]/20 tracking-wide"
              >
                <Link href="/account" className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Collector Portal</span>
                </Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full bg-[#14151a] hover:bg-[#1e2028] transition-all focus:outline-none shadow-sm"
                  >
                    <Avatar size="sm" className="h-6 w-6">
                      <AvatarFallback className="text-[11px] text-[#d1a86e] font-serif">
                        {user.name?.[0]?.toUpperCase() || "A"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-zinc-300 font-medium max-w-[90px] truncate">
                      {user.name}
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-500" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 p-2">
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
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link
                      href="/account"
                      className="flex items-center gap-2 cursor-pointer font-medium text-[#d1a86e]"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#d1a86e]" />
                      <span>Collector Portal</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link
                      href="/account?tab=inquiries"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <Layers className="w-3.5 h-3.5 text-zinc-400" />
                      <span>My Inquiries Ledger</span>
                    </Link>
                  </DropdownMenuItem>

                  {user.role === "ADMIN" && (
                    <>
                      <DropdownMenuSeparator />
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

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/40 cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5 mr-2" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <Button asChild variant="ghost" size="sm" className="rounded-full text-xs uppercase tracking-wider text-zinc-400 hover:text-white">
              <Link href="/login">
                <User className="w-3.5 h-3.5 mr-1.5" />
                <span>Collector Sign In</span>
              </Link>
            </Button>
          )}
        </div>

        {/* Mobile Navigation Trigger with shadcn Sheet */}
        <div className="flex items-center gap-1.5 xs:gap-2 md:hidden shrink-0">
          <Button asChild variant="ghost" size="sm" className="h-6.5 px-2 xs:px-2.5 text-[9px] xs:text-[10px] rounded-full bg-[#1c1e2b] hover:bg-[#252838] text-[#d1a86e]">
            <Link href="/account" className="flex items-center">
              <Sparkles className="w-2.5 h-2.5 mr-1 text-[#d1a86e]" />
              <span>Portal</span>
            </Link>
          </Button>

          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-white hover:bg-[#1a1c23]"
                aria-label="Open navigation menu"
              >
                <Menu className="w-3.5 h-3.5" />
              </Button>
            </SheetTrigger>

            <SheetContent
              side="right"
              className="w-[85vw] max-w-sm bg-[#0d0e12] border-l border-[#262833] p-5 sm:p-6 flex flex-col justify-between shadow-2xl shadow-black overflow-y-auto"
              style={{ backgroundColor: "#0d0e12", opacity: 1 }}
            >
              <div className="space-y-5 sm:space-y-6">
                <SheetHeader className="text-left pb-3 sm:pb-4">
                  <SheetTitle className="font-serif text-lg sm:text-xl tracking-[0.15em] text-white uppercase font-light">
                    {brandTitle}
                  </SheetTitle>
                  <span className="text-[9px] tracking-[0.3em] text-[#d1a86e] uppercase font-semibold">
                    {brandSubtitle}
                  </span>
                </SheetHeader>

                {/* Navigation Links */}
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link) => {
                    const isAnchor = link.href.startsWith("/#");
                    const anchorId = isAnchor ? link.href.replace("/#", "") : "";
                    const isActive = isAnchor
                      ? pathname === "/" && activeSection === anchorId
                      : pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={(e) => handleMobileNavClick(e, link.href)}
                        className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-xs uppercase tracking-[0.2em] font-medium transition-colors ${
                          isActive
                            ? "bg-[#1a1c23] text-[#d1a86e] font-semibold"
                            : "text-zinc-400 hover:text-white hover:bg-[#14151a]"
                        }`}
                      >
                        <span>{link.label}</span>
                        {isActive && (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#d1a86e]" />
                        )}
                      </Link>
                    );
                  })}
                </nav>

                {/* AR Studio CTA */}
                <div className="p-3.5 sm:p-4 bg-[#14151a] rounded-xl space-y-2 shadow-md">
                  <div className="flex items-center gap-2 text-xs font-semibold text-white">
                    <Sparkles className="w-4 h-4 text-[#d1a86e]" />
                    <span>WebAR Showroom</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    Preview original paintings in true 1:1 scale on your wall using device camera.
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="w-full text-xs uppercase tracking-wider rounded-full bg-[#d1a86e] text-[#0d0e12] hover:bg-[#dfba82]"
                  >
                    <Link
                      href="/gallery"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Browse in AR
                    </Link>
                  </Button>
                </div>
              </div>

              {/* User Session Footer */}
              <div className="pt-3 sm:pt-4 space-y-3">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-[#14151a]">
                      <Avatar size="sm" className="h-8 w-8">
                        <AvatarFallback className="text-xs text-[#d1a86e] font-serif">
                          {user.name?.[0]?.toUpperCase() || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-xs text-white font-medium truncate">
                          {user.name}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-mono truncate">
                          {user.email}
                        </span>
                      </div>
                      {user.role === "ADMIN" && (
                        <Badge variant="warning" className="text-[9px]">
                          ADMIN
                        </Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {user.role === "ADMIN" && (
                        <Button
                          asChild
                          variant="secondary"
                          size="sm"
                          className="h-8 text-[11px]"
                        >
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <LayoutDashboard className="w-3.5 h-3.5 mr-1" />
                            <span>CMS</span>
                          </Link>
                        </Button>
                      )}
                      <Button
                        asChild
                        size="sm"
                        className={`h-8 text-[11px] bg-[#d1a86e] text-[#0d0e12] font-semibold hover:opacity-90 ${user.role !== "ADMIN" ? "col-span-2" : ""}`}
                      >
                        <Link
                          href="/account"
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Collector Portal</span>
                        </Link>
                      </Button>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        handleSignOut();
                      }}
                      className="w-full text-xs text-red-400 hover:text-red-300 hover:bg-red-950/40 h-8"
                    >
                      <LogOut className="w-3.5 h-3.5 mr-1.5" />
                      <span>Sign Out</span>
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button
                      asChild
                      className="w-full text-xs uppercase tracking-wider"
                    >
                      <Link
                        href="/login"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Sign In / Register
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
