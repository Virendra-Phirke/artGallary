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
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="bg-[#121319] rounded-3xl p-6 sm:p-8 shadow-xl shadow-black/40 space-y-2">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
          Collector Dossier
        </span>
        <h2 className="font-serif text-3xl sm:text-4xl text-white">
          Account &amp; Preferences
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xl font-light leading-relaxed">
          Manage your verified credentials and authentication settings.
        </p>
      </div>

      {!user ? (
        <div className="p-10 sm:p-12 text-center bg-[#121319] rounded-3xl space-y-4 max-w-xl mx-auto my-6 shadow-xl shadow-black/40">
          <div className="w-14 h-14 rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] mx-auto shadow-inner">
            <User className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl text-white">Collector Profile Locked</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
            Create an account or sign in to configure your acquisition preferences, save personal delivery information, and manage curatorial communications.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="h-10 px-5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow-md shadow-[#d1a86e]/15 transition-all active:scale-[0.98]">
              <Link href="/login?redirect=/account?tab=profile">
                <span>Sign In with Email</span>
              </Link>
            </Button>
            <Button asChild className="h-10 px-5 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-md">
              <Link href="/register?redirect=/account?tab=profile">
                <span>Register Account</span>
              </Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          <div className="bg-[#121319] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-black/40">
            <h3 className="font-serif text-xl text-white">Personal Information</h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-mono">
                  Full Name
                </span>
                <div className="flex items-center gap-2 text-zinc-200 bg-[#1a1b26] p-3.5 rounded-xl shadow-inner">
                  <User className="w-4 h-4 text-[#d1a86e]" />
                  <span>{user.name}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-mono">
                  Email Address
                </span>
                <div className="flex items-center gap-2 text-zinc-200 bg-[#1a1b26] p-3.5 rounded-xl shadow-inner">
                  <Mail className="w-4 h-4 text-[#d1a86e]" />
                  <span>{user.email}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-zinc-500 uppercase tracking-wider text-[10px] font-mono">
                  Collector ID
                </span>
                <div className="text-zinc-400 font-mono bg-[#1a1b26] p-3.5 rounded-xl shadow-inner truncate">
                  {user.id}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#121319] rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl shadow-black/40 flex flex-col justify-between">
            <div className="space-y-6">
              <h3 className="font-serif text-xl text-white">Security &amp; Authentication</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1a1b26] shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-[#d1a86e]" />
                    <span className="text-xs text-zinc-300">Session Tier:</span>
                  </div>
                  <Badge variant="gold" className="text-[10px] font-mono uppercase border-0">
                    Verified {user.role}
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#1a1b26] shadow-inner">
                  <span className="text-xs text-zinc-300">Authentication Method:</span>
                  <span className="text-xs text-zinc-400 font-mono">Email / Password</span>
                </div>
              </div>
            </div>

            <div className="pt-6 space-y-3">
              <div>
                <span className="text-xs text-zinc-400 font-medium block">Active Session</span>
                <p className="text-[11px] text-zinc-500 mt-0.5">
                  Sign out of your active private collector salon session.
                </p>
              </div>
              <Button
                onClick={handleSignOut}
                className="w-full h-10 rounded-full bg-[#1c1d28] hover:bg-rose-950/50 hover:text-rose-300 text-zinc-300 text-xs font-semibold uppercase tracking-wider cursor-pointer transition-all active:scale-[0.98] shadow-md"
              >
                <LogOut className="w-3.5 h-3.5 mr-2" />
                <span>Sign Out of Collector Salon</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
