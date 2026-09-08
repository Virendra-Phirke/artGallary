"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ArrowRight } from "lucide-react";
import type { SiteSettingsData } from "@/db/mockData";

interface AnnouncementBarProps {
  announcement?: SiteSettingsData["announcementBar"];
}

export function AnnouncementBar({ announcement }: AnnouncementBarProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const dismissed = sessionStorage.getItem("gallery_announcement_dismissed");
      if (dismissed === "true") {
        setIsDismissed(true);
      }
    }
  }, []);

  if (!announcement || !announcement.isEnabled || !announcement.message || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("gallery_announcement_dismissed", "true");
    }
  };

  return (
    <div
      className="relative z-[60] text-xs py-2 px-4 transition-all duration-300 border-b border-[#262833]/60 flex items-center justify-center"
      style={{
        backgroundColor: announcement.bg || "#18191e",
        color: announcement.textColor || "#d1a86e",
      }}
    >
      <div className="max-w-[1800px] mx-auto flex items-center justify-center gap-3 text-center px-6">
        <span className="font-medium tracking-wide">
          {announcement.message}
        </span>

        {announcement.link && announcement.linkLabel && (
          <Link
            href={announcement.link}
            className="inline-flex items-center gap-1 font-semibold underline underline-offset-2 hover:opacity-80 transition-opacity text-white shrink-0 ml-1"
          >
            <span>{announcement.linkLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {announcement.dismissible && (
        <button
          onClick={handleDismiss}
          aria-label="Dismiss announcement"
          className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 p-1 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
