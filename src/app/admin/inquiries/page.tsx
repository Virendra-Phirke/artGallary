import React from "react";
import {
  getInquiries,
  getSentEmails,
  getActiveSubscribers,
  getAllArtworksAdmin,
  getAllCampaigns,
  getRecentEmailJobs,
} from "@/db/repository";
import { InquiriesManagerClient } from "@/components/admin/InquiriesManagerClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Collector Inquiries & Acquisitions | Studio Administration",
};

export default async function AdminInquiriesPage() {
  const [
    inquiries,
    sentEmails,
    subscribers,
    allArtworks,
    campaigns,
    emailJobs,
  ] = await Promise.all([
    getInquiries(),
    getSentEmails(100),
    getActiveSubscribers(),
    getAllArtworksAdmin(),
    getAllCampaigns(20),
    getRecentEmailJobs(50),
  ]);

  const publishedArtworks = allArtworks.filter((a) => a.status === "published");

  return (
    <InquiriesManagerClient
      initialInquiries={inquiries}
      initialSentEmails={sentEmails}
      initialSubscribers={subscribers}
      publishedArtworks={publishedArtworks}
      initialCampaigns={campaigns}
      initialEmailJobs={emailJobs}
    />
  );
}
