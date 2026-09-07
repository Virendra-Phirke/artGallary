import React from "react";
import { getSiteSettings } from "@/db/repository";
import { SettingsClient } from "@/components/admin/SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Gallery & Store Settings | Studio Administration",
};

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();
  return <SettingsClient initialSettings={settings} />;
}
