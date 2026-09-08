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
      <main className="flex-1 w-full pl-16 pr-4 sm:pl-20 sm:pr-6 md:pl-24 md:pr-10 lg:pl-28 lg:pr-12 xl:pl-32 xl:pr-16 max-w-[1850px] mx-auto pt-6 pb-20">
        {children}
      </main>
    </div>
  );
}
