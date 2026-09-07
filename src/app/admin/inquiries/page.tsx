import React from "react";
import {
  getInquiries,
  getSentEmails,
  getActiveSubscribers,
  getAllArtworksAdmin,
} from "@/db/repository";
import { InquiriesManagerClient } from "@/components/admin/InquiriesManagerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collector Inquiries & Acquisitions | Studio Administration",
};

export default async function AdminInquiriesPage() {
  const [inquiries, sentEmails, subscribers, allArtworks] = await Promise.all([
    getInquiries(),
    getSentEmails(100),
    getActiveSubscribers(),
    getAllArtworksAdmin(),
  ]);

  const publishedArtworks = allArtworks.filter((a) => a.status === "published");

  return (
    <InquiriesManagerClient
      initialInquiries={inquiries}
      initialSentEmails={sentEmails}
      initialSubscribers={subscribers}
      publishedArtworks={publishedArtworks}
    />
  );
}
