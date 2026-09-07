import React from "react";
import { getSiteSettings } from "@/db/repository";
import { SettingsClient } from "@/components/admin/SettingsClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings & System Status | Studio Administration",
};

interface Props {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function AdminSettingsPage({ searchParams }: Props) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const settings = await getSiteSettings();
  return (
    <SettingsClient
      initialSettings={settings}
      initialTab={resolvedParams?.tab || "landing"}
    />
  );
}
