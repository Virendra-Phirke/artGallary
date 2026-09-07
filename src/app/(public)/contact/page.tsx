import React from "react";
import { ContactForm } from "@/components/public/ContactForm";
import { MapPin, Mail, Phone, Clock, ShieldCheck, MessageCircle } from "lucide-react";
import { getSiteSettings } from "@/db/repository";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact & Acquisitions | Curatorial Studio Office",
  description:
    "Direct contact with the studio office for private acquisitions, museum loans, and curatorial correspondence.",
};

export const revalidate = 60;

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const cfg = settings.contactPageConfig;
  const title = cfg.title || "Inquiries & Acquisitions";
  const description =
    cfg.description ||
    "For private acquisitions, curatorial loan requests, and press access, please correspond using our studio liaison desk.";
  const recipientEmail = cfg.recipientEmail || settings.contactEmail;
  const phone = settings.phone || "+33 (0)1 42 68 55 00";
  const address = settings.address || "14 Rue de Beaune, 7th Arrondissement, 75007 Paris, France";
  const hours = settings.businessHours || "Tuesday – Saturday, 10:00 – 18:00 CET (By Appointment)";

  return (
    <div className="max-w-7xl mx-auto px-6 md:px-12 pt-32 pb-24 space-y-16">
      <div className="max-w-2xl space-y-3">
        <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
          Studio Liaison
        </span>
        <h1 className="font-serif text-4xl sm:text-5xl text-white">
          {title}
        </h1>
        <p className="text-sm text-[#a6aabf] leading-relaxed">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <ContactForm />
        </div>

        {/* Studio Dossier Info Column */}
        <div className="lg:col-span-5 space-y-8 lg:pl-6">
          <div className="p-8 bg-[#14151a] border border-[#262833] rounded-2xl space-y-6">
            <h2 className="font-serif text-2xl text-white">Direct Correspondence</h2>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 uppercase tracking-wider block">
                    Curatorial Email
                  </span>
                  <a
                    href={`mailto:${recipientEmail}`}
                    className="text-white hover:text-[#d1a86e] transition-colors"
                  >
                    {recipientEmail}
                  </a>
                </div>
              </div>

              {phone && (
                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 uppercase tracking-wider block">
                      Studio Desk
                    </span>
                    <span className="text-white">{phone}</span>
                  </div>
                </div>
              )}

              {settings.whatsapp && (
                <div className="flex items-start gap-3">
                  <MessageCircle className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-zinc-500 uppercase tracking-wider block">
                      WhatsApp Liaison
                    </span>
                    <span className="text-white">{settings.whatsapp}</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 uppercase tracking-wider block">
                    Atelier &amp; Private Gallery
                  </span>
                  <span className="text-white">
                    {address}
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-[#d1a86e] shrink-0 mt-0.5" />
                <div>
                  <span className="text-zinc-500 uppercase tracking-wider block">
                    Studio Hours
                  </span>
                  <span className="text-white">
                    {hours}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Privacy & Provenance Guarantee */}
          <div className="p-6 bg-[#14151a]/60 border border-[#262833] rounded-2xl space-y-3 text-xs text-[#8e92a4]">
            <div className="flex items-center gap-2 text-white font-medium">
              <ShieldCheck className="w-4 h-4 text-[#d1a86e]" />
              <span>Confidentiality Protocol</span>
            </div>
            <p className="leading-relaxed">
              All collector inquiries, institutional loans, and client identities are maintained under strict non-disclosure conventions. Authenticated certificates of authenticity accompany all acquisitions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
