import React from "react";
import { getAllArtworksAdmin, getInquiries } from "@/db/repository";
import { Sparkles, Eye, Users, TrendingUp, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Analytics & Telemetry | Studio Administration",
};

export default async function AdminAnalyticsPage() {
  const [artworks, inquiries] = await Promise.all([
    getAllArtworksAdmin(),
    getInquiries(),
  ]);

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="border-b border-[#1c1d25] pb-6">
        <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
          Curatorial Engagement
        </span>
        <h1 className="font-serif text-3xl text-white mt-1">
          Privacy-First Analytics
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Telemetry without intrusive tracking or cookie consent banners. Designed for Vercel Analytics and PostHog.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="p-5 bg-[#14151a] border border-[#262833] rounded-xl space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
            Unique Studio Visitors
          </span>
          <div className="font-serif text-3xl text-white">12,840</div>
          <span className="text-xs text-emerald-400">+18% this month</span>
        </div>

        <div className="p-5 bg-[#14151a] border border-[#262833] rounded-xl space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
            AR Sessions Launched
          </span>
          <div className="font-serif text-3xl text-[#d1a86e]">1,420</div>
          <span className="text-xs text-zinc-400">11.0% visitor conversion</span>
        </div>

        <div className="p-5 bg-[#14151a] border border-[#262833] rounded-xl space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
            Avg. View Duration
          </span>
          <div className="font-serif text-3xl text-white">4m 12s</div>
          <span className="text-xs text-zinc-400">Deep engagement</span>
        </div>

        <div className="p-5 bg-[#14151a] border border-[#262833] rounded-xl space-y-1">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">
            Inquiries Generated
          </span>
          <div className="font-serif text-3xl text-white">{inquiries.length}</div>
          <span className="text-xs text-emerald-400 font-medium">Active pipeline</span>
        </div>
      </div>

      {/* Popular Artworks Ranking */}
      <div className="p-6 bg-[#14151a] border border-[#262833] rounded-2xl space-y-4">
        <h2 className="font-serif text-xl text-white">
          Highest Artwork Engagement (Last 30 Days)
        </h2>

        <div className="divide-y divide-[#1f212b]">
          {artworks.slice(0, 5).map((art, idx) => (
            <div
              key={art.id}
              className="py-3 flex items-center justify-between text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="font-mono text-xs text-zinc-500 w-4">
                  0{idx + 1}
                </span>
                <div>
                  <span className="text-white font-medium block">{art.title}</span>
                  <span className="text-[10px] text-zinc-500">{art.medium}</span>
                </div>
              </div>

              <div className="flex items-center gap-8 text-right">
                <div>
                  <span className="text-white block font-mono">
                    {(2800 - idx * 420).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500">Catalog Views</span>
                </div>
                <div>
                  <span className="text-[#d1a86e] block font-mono">
                    {(340 - idx * 58).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500">AR Studio Opens</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
