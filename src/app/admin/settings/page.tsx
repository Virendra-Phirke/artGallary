import React from "react";
import { getSiteSettings } from "@/db/repository";
import { SettingsClient } from "@/components/admin/SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings & System Status | Studio Administration",
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return (
    <SettingsClient
      initialSettings={{
        artistName: settings.artistName,
        siteTitle: settings.siteTitle,
        tagline: settings.tagline,
        bioSummary: settings.bioSummary || "",
        statement: settings.statement || "",
        contactEmail: settings.contactEmail,
        phone: settings.phone,
        location: settings.location,
        socialLinks: settings.socialLinks || {},
        copyrightText: settings.copyrightText,
      }}
    />
  );
}
