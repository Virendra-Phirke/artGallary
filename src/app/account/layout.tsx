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
    <div className="min-h-screen flex flex-col bg-[#0a0b0e] text-[#f4f4f6] w-full max-w-full overflow-x-hidden">
      <CollectorNav
        user={currentUser}
        inquiriesCount={userInquiries.length}
      />
      <main className="flex-1 w-full max-w-[1850px] mx-auto px-3 sm:px-6 md:px-12 lg:px-16 xl:px-20 pt-4 sm:pt-6 pb-16 md:pb-20 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}
