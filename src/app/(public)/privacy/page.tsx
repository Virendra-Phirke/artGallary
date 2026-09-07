import React from "react";
import { getSiteSettings } from "@/db/repository";
import { ShieldCheck } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | Studio Data & Provenance Protocol",
  description: "Collector confidentiality, session privacy, and personal data protection policy.",
};

export const revalidate = 60;

export default async function PrivacyPage() {
  const settings = await getSiteSettings();
  const privacyText =
    settings.legalPages.privacyPolicy ||
    "We respect your collector privacy. Personal data submitted through inquiries or account registration is encrypted, never sold, and used solely for private studio correspondence, provenance records, and authenticated certificate delivery.";

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-12 pt-36 pb-24 space-y-10">
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18191e] border border-[#262833] text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Legal Protocol</span>
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl text-white">Privacy Policy</h1>
        <p className="text-xs text-zinc-500">
          Last revised: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })} • {settings.siteTitle}
        </p>
      </div>

      <div className="prose prose-invert max-w-none text-sm text-[#a6aabf] leading-relaxed space-y-6 bg-[#14151a] border border-[#262833] p-8 rounded-2xl">
        <p>{privacyText}</p>

        <h3 className="font-serif text-xl text-white pt-4">WebAR &amp; Device Camera Privacy</h3>
        <p>
          Our WebAR spatial preview requires access to your device camera solely to estimate room wall planes in real-time on your client browser. No camera video feeds or spatial room data are ever transmitted or stored on remote servers.
        </p>

        <h3 className="font-serif text-xl text-white pt-4">Acquisition &amp; Provenance Records</h3>
        <p>
          When you submit an acquisition request or register as a patron, your contact records are maintained strictly for certificate issuance, delivery logistics, and direct curatorial correspondence.
        </p>
      </div>
    </div>
  );
}
