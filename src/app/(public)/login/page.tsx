"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LogIn, Shield, User, ArrowRight, AlertCircle } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // If user is admin and logging in generally, route to admin dashboard
      if (data.user?.role === "ADMIN" && redirectUrl === "/") {
        window.location.href = "/admin/dashboard";
      } else {
        window.location.href = redirectUrl;
      }
    } catch (err: any) {
      setError(err.message || "Invalid credentials");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="w-full max-w-md bg-[#14151a] border border-[#262833] rounded-2xl p-8 space-y-6 shadow-2xl">
      <div className="text-center space-y-2">
        <span className="text-[11px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
          Studio Access
        </span>
        <h1 className="font-serif text-3xl text-white">Sign In</h1>
        <p className="text-xs text-[#8e92a4]">
          Sign in to submit artwork acquisition inquiries or access the administrative studio CMS.
        </p>
      </div>

      {/* Quick Demo Credentials Panel */}
      <div className="p-3.5 bg-[#1a1c23] border border-[#262833] rounded-lg space-y-2 text-xs">
        <span className="text-zinc-400 font-semibold uppercase text-[10px] tracking-wider block">
          One-Click Demo Credentials:
        </span>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin("vishal", "2004")}
            className="flex items-center justify-center gap-1.5 p-2 bg-[#22242e] hover:bg-amber-950/40 hover:border-amber-700/60 border border-amber-800/40 rounded text-[11px] text-amber-200 transition-colors font-medium"
          >
            <Shield className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>Admin (vishal)</span>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin("collector@haute-art.com", "Collector2026!")}
            className="flex items-center justify-center gap-1.5 p-2 bg-[#22242e] hover:bg-[#2c2f3d] border border-[#262833] rounded text-[11px] text-zinc-200 transition-colors"
          >
            <User className="w-3.5 h-3.5 text-zinc-400" />
            <span>Collector / User</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-950/40 border border-red-800/60 rounded text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
            Admin ID or Email Address
          </label>
          <input
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="vishal or curator@latelier-lumineux.art"
            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
            Password
          </label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] py-3.5 rounded-xl text-xs font-semibold uppercase tracking-[0.2em] transition-all disabled:opacity-50"
        >
          {isSubmitting ? (
            <span>Signing In...</span>
          ) : (
            <>
              <LogIn className="w-4 h-4" />
              <span>Authenticate</span>
            </>
          )}
        </button>
      </form>

      <div className="border-t border-[#1f212b] pt-4 text-center text-xs text-zinc-400">
        <span>Don&apos;t have an account? </span>
        <Link
          href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
          className="text-[#d1a86e] hover:underline uppercase tracking-wider font-semibold ml-1"
        >
          Register here
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-24">
      <Suspense fallback={<div className="text-zinc-500">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
