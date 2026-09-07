"use client";

import type { SiteSettingsData } from "@/db/mockData";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  MessageSquare,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

interface ContactPageEditorProps {
  settings: SiteSettingsData;
  onUpdateSetting: <K extends keyof SiteSettingsData>(key: K, value: SiteSettingsData[K]) => void;
  onUpdateContactConfig: (field: string, value: any) => void;
}

export function ContactPageEditor({
  settings,
  onUpdateSetting,
  onUpdateContactConfig,
}: ContactPageEditorProps) {
  const cfg = settings.contactPageConfig || {
    title: "Inquiries & Acquisitions",
    description: "For private acquisitions, curatorial loan requests, and press access, please correspond with our liaison desk.",
    formFields: {
      name: true,
      email: true,
      phone: true,
      message: true,
      artworkContext: true,
    },
  };

  const handleFormFieldToggle = (key: string, val: boolean) => {
    onUpdateContactConfig("formFields", {
      ...cfg.formFields,
      [key]: val,
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-[#14151a] border border-[#262833] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-widest text-[#d1a86e] font-semibold">
              Collector &amp; Client Liaison
            </span>
            <Badge className="bg-[#d1a86e]/15 text-[#d1a86e] border-[#d1a86e]/30 text-[10px]">
              The Contact Page
            </Badge>
          </div>
          <h3 className="font-serif text-lg text-white font-medium mt-0.5">
            Contact &amp; Acquisition Desk
          </h3>
          <p className="text-xs text-zinc-400">
            Configure liaison channels and the interactive inquiry form displayed at <code className="text-[#d1a86e] font-mono">/contact</code>.
          </p>
        </div>
      </div>

      {/* Page Title & Instructions */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Page Title &amp; Curatorial Instructions
        </h4>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Contact Page Title
            </label>
            <Input
              value={cfg.title || "Inquiries & Acquisitions"}
              onChange={(e) => onUpdateContactConfig("title", e.target.value)}
              placeholder="Inquiries & Acquisitions"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Collector Instructions / Subtitle
            </label>
            <Textarea
              rows={2}
              value={cfg.description || settings.contactInstructions || ""}
              onChange={(e) => {
                onUpdateContactConfig("description", e.target.value);
                onUpdateSetting("contactInstructions", e.target.value);
              }}
              placeholder="For private acquisitions, curatorial loan requests, and press access..."
              className="bg-[#181920] border-[#262833] text-xs text-zinc-300 focus:border-[#d1a86e]"
            />
          </div>
        </div>
      </div>

      {/* Direct Contact Channels */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-4">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Studio Liaison Channels
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Primary Studio Email
            </label>
            <Input
              value={settings.contactEmail}
              onChange={(e) => onUpdateSetting("contactEmail", e.target.value)}
              placeholder="curator@latelier-lumineux.art"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Studio Telephone
            </label>
            <Input
              value={settings.phone || ""}
              onChange={(e) => onUpdateSetting("phone", e.target.value)}
              placeholder="+33 1 42 68 55 00"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              WhatsApp Liaison
            </label>
            <Input
              value={settings.whatsapp || ""}
              onChange={(e) => onUpdateSetting("whatsapp", e.target.value)}
              placeholder="+33 6 12 34 56 78"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase tracking-wider text-zinc-400 block mb-1">
              Physical Atelier Address
            </label>
            <Input
              value={settings.address || ""}
              onChange={(e) => onUpdateSetting("address", e.target.value)}
              placeholder="14 Rue de Beaune, 7th Arrondissement, Paris"
              className="bg-[#181920] border-[#262833] text-xs text-white focus:border-[#d1a86e]"
            />
          </div>
        </div>
      </div>

      {/* Inquiry Form Fields */}
      <div className="p-5 rounded-2xl bg-[#14151a] border border-[#262833] space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
          Inquiry Form Input Fields
        </h4>

        <div className="space-y-2.5">
          {[
            {
              key: "phone",
              label: "Phone / WhatsApp Field",
              desc: "Request phone number for private liaison call.",
            },
            {
              key: "artworkContext",
              label: "Artwork Selection Reference",
              desc: "Allow collector to specify artwork of interest directly in message.",
            },
          ].map((field) => {
            const isChecked = Boolean(cfg.formFields?.[field.key as keyof typeof cfg.formFields]);
            return (
              <div
                key={field.key}
                className="flex items-center justify-between p-3 rounded-xl bg-[#181920] border border-[#262833]"
              >
                <div>
                  <span className="text-xs font-medium text-white block">{field.label}</span>
                  <span className="text-[11px] text-zinc-400">{field.desc}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleFormFieldToggle(field.key, e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-9 h-5 bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#d1a86e]"></div>
                </label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
