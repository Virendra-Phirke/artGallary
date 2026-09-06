"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, User, Shield, LogOut } from "lucide-react";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
}

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [scrolled, setScrolled] = useState(false);

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

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", { method: "POST" });
    setUser(null);
    window.location.reload();
  };

  const navLinks = [
    { label: "Gallery", href: "/gallery" },
    { label: "Collections", href: "/collections" },
    { label: "Exhibitions", href: "/exhibitions" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0d0e12]/90 backdrop-blur-md border-b border-[#262833]/80 py-4 shadow-xl"
          : "bg-gradient-to-b from-[#0d0e12]/80 to-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex items-center justify-between">
        {/* Gallery Brand Title */}
        <Link
          href="/"
          className="group flex flex-col items-start focus-visible:outline-none"
        >
          <span className="font-serif text-xl md:text-2xl tracking-[0.2em] font-medium text-white group-hover:text-[#d1a86e] transition-colors uppercase">
            L&apos;Atelier Lumineux
          </span>
          <span className="text-[10px] tracking-[0.3em] text-[#8e92a4] uppercase font-light -mt-0.5">
            Elena Vance Studio
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
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

        {/* Right CTA / Auth Status */}
        <div className="hidden md:flex items-center space-x-5">
          <Link
            href="/gallery"
            className="flex items-center gap-1.5 text-xs tracking-widest uppercase text-[#d1a86e] border border-[#d1a86e]/40 hover:border-[#d1a86e] px-3.5 py-1.5 rounded-full transition-all hover:bg-[#d1a86e]/10"
          >
            <Sparkles className="w-3 h-3" />
            <span>AR Preview</span>
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === "ADMIN" && (
                <Link
                  href="/admin/dashboard"
                  className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-amber-300 bg-amber-950/40 border border-amber-800/60 px-3 py-1.5 rounded-full hover:bg-amber-900/60 transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>Admin CMS</span>
                </Link>
              )}
              <Link
                href="/account"
                className="flex items-center gap-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
                title={user.email}
              >
                <div className="w-7 h-7 rounded-full bg-[#1a1c23] border border-[#262833] flex items-center justify-center text-xs font-serif text-[#d1a86e]">
                  {user.name[0]}
                </div>
              </Link>
              <button
                onClick={handleSignOut}
                className="text-zinc-500 hover:text-red-400 transition-colors p-1"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="text-xs uppercase tracking-[0.15em] text-[#a6aabf] hover:text-white transition-colors flex items-center gap-1.5"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </Link>
          )}
        </div>

        {/* Mobile Hamburger Toggle */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-white p-2 focus-visible:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0d0e12] border-b border-[#262833] px-6 py-8 space-y-6 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm tracking-[0.2em] uppercase font-medium text-zinc-300 hover:text-[#d1a86e] transition-colors py-1"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="pt-4 border-t border-[#262833] flex flex-col gap-3">
            <Link
              href="/gallery"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 text-xs tracking-widest uppercase text-[#d1a86e] border border-[#d1a86e]/40 py-2.5 rounded-full"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Explore AR Studio</span>
            </Link>

            {user ? (
              <div className="flex flex-col gap-2 pt-2">
                {user.role === "ADMIN" && (
                  <Link
                    href="/admin/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 text-xs uppercase tracking-wider text-amber-300 bg-amber-950/40 border border-amber-800/60 py-2.5 rounded-full"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Admin CMS</span>
                  </Link>
                )}
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-2 text-xs text-zinc-300 py-2"
                >
                  <User className="w-4 h-4" />
                  <span>My Account ({user.name})</span>
                </Link>
                <button
                  onClick={handleSignOut}
                  className="text-xs text-red-400 py-1"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center text-xs uppercase tracking-widest text-zinc-400 hover:text-white py-2"
              >
                Sign In / Register
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
