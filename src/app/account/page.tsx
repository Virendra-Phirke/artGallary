import React from "react";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getSession } from "@/lib/auth/auth";
import {
  getArtworks,
  getCollections,
  getExhibitions,
  getInquiries,
  getUserMarketingPreference,
} from "@/db/repository";
import { CollectorDashboardClient } from "@/components/account/CollectorDashboardClient";
import type { CollectorTab } from "@/components/account/CollectorDock";

export const metadata: Metadata = {
  title: "Collector Salon & Private Dashboard | Elena Vance",
  description: "Private collector salon for reviewing original works, series cycles, exhibition vernissages, and studio acquisition correspondence.",
};

interface AccountPageProps {
  searchParams?: Promise<{ tab?: string }>;
}

export default async function AccountPage({ searchParams }: AccountPageProps) {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login?redirect=/account");
  }

  const resolvedParams = searchParams ? await searchParams : {};
  const initialTab = (resolvedParams.tab as CollectorTab) || "overview";

  const [artworks, collections, exhibitions, allInquiries, marketingSubscribed] =
    await Promise.all([
      getArtworks(),
      getCollections(),
      getExhibitions(),
      getInquiries(),
      getUserMarketingPreference(session.user.id),
    ]);

  // Filter inquiries for this user email
  const userInquiries = allInquiries.filter(
    (i) => i.email.toLowerCase() === session.user.email.toLowerCase()
  );

  return (
    <CollectorDashboardClient
      user={{
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        image: session.user.image,
      }}
      artworks={artworks}
      collections={collections}
      exhibitions={exhibitions}
      userInquiries={userInquiries}
      marketingSubscribed={marketingSubscribed}
      initialTab={initialTab}
    />
  );
}
