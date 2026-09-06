"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { UserPlus, AlertCircle } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      window.location.href = redirectUrl;
    } catch (err: any) {
      setError(err.message || "Registration failed. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-[#14151a] border border-[#262833] rounded-2xl p-8 space-y-6 shadow-2xl">
      <div className="text-center space-y-2">
        <span className="text-[11px] tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
          Collector Registration
        </span>
        <h1 className="font-serif text-3xl text-white">Create Account</h1>
        <p className="text-xs text-[#8e92a4]">
          Register to preserve acquisition messages, request private studio viewings, and track curatorial correspondence.
        </p>
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
            Full Name
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lord Sterling"
            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
            Email Address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. collector@estate.com"
            className="w-full bg-[#1a1c23] border border-[#262833] rounded-lg px-4 py-3 text-sm text-white placeholder-zinc-600 focus:border-[#d1a86e] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
            Password (Min. 8 characters)
          </label>
          <input
            type="password"
            required
            minLength={8}
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
            <span>Registering...</span>
          ) : (
            <>
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </>
          )}
        </button>
      </form>

      <div className="border-t border-[#1f212b] pt-4 text-center text-xs text-zinc-400">
        <span>Already have an account? </span>
        <Link
          href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
          className="text-[#d1a86e] hover:underline uppercase tracking-wider font-semibold ml-1"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-[85vh] flex items-center justify-center px-6 py-24">
      <Suspense fallback={<div className="text-zinc-500">Loading register...</div>}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
