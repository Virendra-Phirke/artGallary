import React from "react";
import Link from "next/link";
import { getSession } from "@/lib/auth/auth";
import { getInquiries, getUserMarketingPreference } from "@/db/repository";
import { User, Mail, Shield, Sparkles, Clock, ArrowRight } from "lucide-react";
import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MarketingPreferenceToggle } from "@/components/account/MarketingPreferenceToggle";

export default async function AccountPage() {
  const session = await getSession();
  if (!session?.user) {
    redirect("/login?redirect=/account");
  }

  const allInquiries = await getInquiries();
  // Filter inquiries for this user email
  const userInquiries = allInquiries.filter(
    (i) => i.email.toLowerCase() === session.user.email.toLowerCase()
  );

  const marketingSubscribed = await getUserMarketingPreference(session.user.id);

  return (
    <div className="space-y-12">
      <div className="border-b border-[#262833] pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs tracking-[0.25em] text-[#d1a86e] uppercase font-medium">
            Collector Account
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl text-white mt-1">
            {session.user.name}
          </h1>
          <p className="text-xs text-[#8e92a4] mt-1">{session.user.email}</p>
        </div>

        {session.user.role === "ADMIN" && (
          <Button asChild variant="outline" className="border-amber-800/80 bg-amber-950/40 hover:bg-amber-900/60 text-amber-200 text-xs font-semibold uppercase tracking-wider rounded-full">
            <Link
              href="/admin/dashboard"
              className="flex items-center gap-2"
            >
              <Shield className="w-4 h-4 text-[#d1a86e]" />
              <span>Open Studio CMS</span>
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
        <Card className="p-5 sm:p-6 bg-[#14151a] border-[#262833] rounded-xl space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            Account Status
          </span>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span className="font-serif text-xl text-white">Active Verified</span>
          </div>
          <p className="text-xs text-zinc-400 pt-1">
            Role: <strong className="text-[#d1a86e]">{session.user.role}</strong>
          </p>
        </Card>

        <Card className="p-5 sm:p-6 bg-[#14151a] border-[#262833] rounded-xl space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            Submitted Inquiries
          </span>
          <div className="font-serif text-2xl text-white">
            {userInquiries.length}
          </div>
          <p className="text-xs text-zinc-400 pt-1">
            Recorded in studio ledger
          </p>
        </Card>

        <Card className="p-5 sm:p-6 bg-[#14151a] border-[#262833] rounded-xl space-y-2">
          <span className="text-[10px] uppercase tracking-widest text-zinc-500">
            Spatial AR Sessions
          </span>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#d1a86e]" />
            <span className="font-serif text-xl text-white">WebXR Enabled</span>
          </div>
          <p className="text-xs text-zinc-400 pt-1">
            Ready for 1:1 camera placement
          </p>
        </Card>
      </div>

      {/* Collector Email & Marketing Preferences */}
      <MarketingPreferenceToggle initialSubscribed={marketingSubscribed} />

      {/* Inquiries Section */}
      <div className="space-y-6 pt-6">
        <div className="flex items-center justify-between border-b border-[#262833] pb-4">
          <h2 className="font-serif text-2xl text-white">Your Inquiries</h2>
          <Link
            href="/gallery"
            className="text-xs uppercase tracking-widest text-[#d1a86e] hover:underline flex items-center gap-1"
          >
            <span>Browse Gallery</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {userInquiries.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center bg-[#14151a]/40 border-[#262833] rounded-xl space-y-3">
            <Mail className="w-8 h-8 text-zinc-600 mx-auto" />
            <p className="font-serif text-lg text-white">No active inquiries</p>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              When you inquire about an original painting, your correspondence and provenance dossier appear here.
            </p>
          </Card>
        ) : (
          <div className="space-y-4">
            {userInquiries.map((inq) => (
              <Card
                key={inq.id}
                className="p-5 sm:p-6 bg-[#14151a] border-[#262833] rounded-xl space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        inq.status === "replied"
                          ? "success"
                          : inq.status === "read"
                          ? "gold"
                          : "warning"
                      }
                    >
                      {inq.status}
                    </Badge>
                    <h3 className="font-serif text-lg text-white">
                      {inq.subject}
                    </h3>
                  </div>
                  <span className="text-xs text-zinc-500">
                    {new Date(inq.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed bg-[#1a1c23] p-3.5 rounded-lg border border-[#262833]">
                  {inq.message}
                </p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
