"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  KeyRound,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  LogOut,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ProfileClientProps {
  initialUser: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export function ProfileClient({ initialUser }: ProfileClientProps) {
  const router = useRouter();

  // Profile fields
  const [name, setName] = useState(initialUser.name);
  const [email, setEmail] = useState(initialUser.email);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Status feedback
  const [profileSaving, setProfileSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  // Save Identity Details
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(null);
    setProfileError(null);

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setProfileSuccess("Admin credentials updated successfully!");
      router.refresh();
    } catch (err: any) {
      setProfileError(err.message || "Failed to update profile");
    } finally {
      setProfileSaving(false);
    }
  };

  // Update Password
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      setPasswordSaving(false);
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError("New password must be at least 4 characters.");
      setPasswordSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/admin/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to change password");
      }

      setPasswordSuccess("Master password updated successfully! Your active session is secured.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPasswordError(err.message || "Failed to change password");
    } finally {
      setPasswordSaving(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch("/api/auth/sign-out", { method: "POST" });
      router.push("/login");
    } catch {
      router.push("/login");
    }
  };

  return (
    <div className="w-full space-y-8 pb-16">
      {/* Editorial Header */}
      <div className="p-6 sm:p-8 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 flex flex-col md:flex-row md:items-center justify-between gap-4 border-none">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
              Personal Credentials &amp; Access
            </span>
            <Badge variant="warning" className="text-[9px] font-mono font-bold border-none">
              {initialUser.role}
            </Badge>
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl text-white font-normal tracking-wide mt-1">
            Admin Profile &amp; Security
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
            Manage your personal login credentials, identity identifier, and authentication master password.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            onClick={handleSignOut}
            disabled={signingOut}
            className="bg-[#2d1616] hover:bg-red-950 text-red-300 hover:text-red-200 text-xs gap-2 rounded-xl border-none h-9 px-4"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{signingOut ? "Signing Out..." : "Sign Out"}</span>
          </Button>
        </div>
      </div>

      {/* Scope Clarification Notice */}
      <div className="p-5 rounded-2xl bg-[#121319] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs border-none shadow-md">
        <div className="flex items-start sm:items-center gap-2.5 text-zinc-300">
          <Shield className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5 sm:mt-0" />
          <span>
            This workspace strictly controls <strong>your personal administrator credentials</strong>. To configure gallery details, store branding, or artist biography, visit Storefront Settings.
          </span>
        </div>
        <Link
          href="/admin/settings"
          className="inline-flex items-center gap-1 text-[#d1a86e] hover:text-[#e4be88] font-medium shrink-0 transition-colors"
        >
          <span>Storefront Settings</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* 2-Column Credentials Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Admin Identity */}
        <Card className="p-6 sm:p-8 bg-[#121319] rounded-3xl space-y-6 shadow-xl shadow-black/40 border-none">
          <div className="flex items-center gap-3 pb-2">
            <div className="w-9 h-9 rounded-xl bg-[#1a1b26] flex items-center justify-center text-[#d1a86e] border-none shadow-sm">
              <User className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-white font-medium">Administrator Identity</h2>
              <p className="text-[11px] text-zinc-400">Display name &amp; login account identifier</p>
            </div>
          </div>

          {profileSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 text-emerald-300 text-xs flex items-center gap-2 border-none shadow-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {profileError && (
            <div className="p-3 rounded-xl bg-red-950/80 text-red-300 text-xs flex items-center gap-2 border-none shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{profileError}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Admin Name</label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Admin Name"
                className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Login ID / Email</label>
              <Input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vishal or admin@gallery.art"
                className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                required
              />
              <span className="text-[10px] text-zinc-500">
                Used to log into the curator console.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-[#1a1b26] space-y-1.5 border-none">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400">System Role</span>
                <span className="font-mono text-xs text-[#d1a86e] font-semibold">ROOT ADMIN</span>
              </div>
              <p className="text-[10px] text-zinc-500">
                Full governance over inventory, auctions, landing page studio, and client inquiries.
              </p>
            </div>

            <Button
              type="submit"
              disabled={profileSaving}
              className="w-full bg-[#d1a86e] hover:bg-[#c49a5f] text-black font-semibold text-xs tracking-wide py-3 rounded-xl border-none shadow-md shadow-black/40"
            >
              {profileSaving ? "Saving..." : "Save Identity Changes"}
            </Button>
          </form>
        </Card>

        {/* Column 2: Password & Authentication */}
        <Card className="p-6 sm:p-8 bg-[#121319] rounded-3xl space-y-6 shadow-xl shadow-black/40 border-none">
          <div className="flex items-center gap-3 pb-2">
            <div className="w-9 h-9 rounded-xl bg-[#1a1b26] flex items-center justify-center text-[#d1a86e] border-none shadow-sm">
              <KeyRound className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="font-serif text-lg text-white font-medium">Change Password</h2>
              <p className="text-[11px] text-zinc-400">Secure your curator administrative access</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/80 text-emerald-300 text-xs flex items-center gap-2 border-none shadow-sm">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{passwordSuccess}</span>
            </div>
          )}

          {passwordError && (
            <div className="p-3 rounded-xl bg-red-950/80 text-red-300 text-xs flex items-center gap-2 border-none shadow-sm">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{passwordError}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Current Password</label>
              <div className="relative">
                <Input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 pr-10 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 border-none"
                >
                  {showCurrentPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">New Password</label>
              <div className="relative">
                <Input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 4 characters)"
                  className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 pr-10 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 border-none"
                >
                  {showNewPassword ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-300">Confirm New Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-type new password"
                className="bg-[#1a1b26] text-white text-xs placeholder:text-zinc-600 rounded-xl px-3.5 py-2.5 border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={passwordSaving}
              variant="ghost"
              className="w-full bg-[#1a1b26] hover:bg-[#222432] text-[#d1a86e] font-semibold text-xs tracking-wide py-3 rounded-xl transition-all border-none"
            >
              {passwordSaving ? "Updating Password..." : "Update Master Password"}
            </Button>
          </form>
        </Card>
      </div>

      {/* Session Integrity Footer */}
      <Card className="p-5 sm:p-6 bg-[#121319] rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-none shadow-xl shadow-black/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#1a1b26] flex items-center justify-center text-[#d1a86e] border-none shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-white">Active Session Security</span>
              <Badge variant="success" className="text-[9px] py-0 h-4 border-none">VERIFIED</Badge>
            </div>
            <p className="text-[11px] text-zinc-500">
              Authenticated via secure HTTP-only cookies with HMAC-SHA256 signature verification.
            </p>
          </div>
        </div>

        <span className="font-mono text-[10px] text-zinc-500">
          User ID: {initialUser.id}
        </span>
      </Card>
    </div>
  );
}
