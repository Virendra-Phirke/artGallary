import React from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/auth";
import { getInquiries } from "@/db/repository";
import { CollectorNav } from "@/components/account/CollectorNav";

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  let userInquiries: any[] = [];
  if (session?.user?.email) {
    const allInquiries = await getInquiries().catch(() => []);
    userInquiries = allInquiries.filter(
      (i) => i.email.toLowerCase() === session.user.email.toLowerCase()
    );
  }

  const currentUser = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        image: session.user.image,
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0b0e] text-[#f4f4f6]">
      <CollectorNav
        user={currentUser}
        inquiriesCount={userInquiries.length}
      />
      <main className="flex-1 w-full px-4 sm:px-6 md:pl-20 md:pr-8 lg:pl-24 lg:pr-10 xl:pl-28 xl:pr-12 pt-8 pb-16">
        {children}
      </main>
    </div>
  );
}
