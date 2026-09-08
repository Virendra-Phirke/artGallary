"use client";

import React from "react";
import Link from "next/link";
import { User, Mail, Shield, LogOut } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCollector } from "@/components/account/context/CollectorContext";

export function ProfileTab() {
  const { user, handleSignOut } = useCollector();

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-4 sm:p-7 shadow-xl shadow-black/40 space-y-1.5 sm:space-y-2">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
          Collector Dossier
        </span>
        <h2 className="font-serif text-2xl sm:text-4xl text-white">
          Account &amp; Preferences
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-light leading-relaxed">
          Manage your verified credentials and authentication settings.
        </p>
      </div>

      {!user ? (
        <div className="p-6 sm:p-10 text-center bg-[#121319] rounded-2xl sm:rounded-3xl space-y-3.5 max-w-xl mx-auto my-4 shadow-xl shadow-black/40">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] mx-auto shadow-inner">
            <User className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-white">Collector Profile Locked</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
            Create an account or sign in to configure your acquisition preferences, save personal delivery information, and manage curatorial communications.
          </p>
          <div className="pt-2 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-center sm:gap-3">
            <Button asChild className="h-10 px-3 sm:px-5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-[11px] sm:text-xs font-semibold uppercase tracking-wider shadow-md shadow-[#d1a86e]/15 transition-all active:scale-[0.98]">
              <Link href="/login?redirect=/account?tab=profile" className="truncate">
                <span>Sign In</span>
              </Link>
            </Button>
            <Button asChild className="h-10 px-3 sm:px-5 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-[11px] sm:text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-md">
              <Link href="/register?redirect=/account?tab=profile" className="truncate">
                <span>Register</span>
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 max-w-4xl">
          <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4 sm:space-y-6 shadow-xl shadow-black/40">
            <h3 className="font-serif text-lg sm:text-xl text-white">Personal Information</h3>

            <div className="space-y-3 sm:space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider text-[9px] sm:text-[10px] font-mono">
                  Full Name
                </span>
                <div className="flex items-center gap-2 text-zinc-200 bg-[#1a1b26] p-2.5 sm:p-3.5 rounded-xl shadow-inner text-xs sm:text-sm">
                  <User className="w-4 h-4 text-[#d1a86e] shrink-0" />
                  <span className="truncate">{user.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider text-[9px] sm:text-[10px] font-mono">
                  Email Address
                </span>
                <div className="flex items-center gap-2 text-zinc-200 bg-[#1a1b26] p-2.5 sm:p-3.5 rounded-xl shadow-inner text-xs sm:text-sm">
                  <Mail className="w-4 h-4 text-[#d1a86e] shrink-0" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider text-[9px] sm:text-[10px] font-mono">
                  Collector ID
                </span>
                <div className="text-zinc-400 font-mono bg-[#1a1b26] p-2.5 sm:p-3.5 rounded-xl shadow-inner truncate text-xs">
                  {user.id}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#121319] rounded-2xl sm:rounded-3xl p-4 sm:p-7 space-y-4 sm:space-y-6 shadow-xl shadow-black/40 flex flex-col justify-between">
            <div className="space-y-4 sm:space-y-6">
              <h3 className="font-serif text-lg sm:text-xl text-white">Security &amp; Authentication</h3>

              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl bg-[#1a1b26] shadow-inner">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#d1a86e] shrink-0" />
                    <span className="text-xs text-zinc-300">Session Tier:</span>
                  </div>
                  <Badge variant="gold" className="text-[10px] font-mono uppercase border-0">
                    Verified {user.role}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-2.5 sm:p-3.5 rounded-xl bg-[#1a1b26] shadow-inner">
                  <span className="text-xs text-zinc-300">Authentication:</span>
                  <span className="text-xs text-zinc-400 font-mono">Email / Password</span>
                </div>
              </div>
            </div>

            <div className="pt-4 sm:pt-6 space-y-2.5">
              <div>
                <span className="text-xs text-zinc-400 font-medium block">Active Session</span>
                <p className="text-[10px] sm:text-[11px] text-zinc-500 mt-0.5 font-light">
                  Sign out of your active collector portal session.
                </p>
              </div>
              <Button
                onClick={handleSignOut}
                className="w-full h-10 rounded-full bg-[#1c1d28] hover:bg-rose-950/50 hover:text-rose-300 text-zinc-300 text-[11px] sm:text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all active:scale-[0.98] shadow-md"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                <span>Sign Out of Collector Portal</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
