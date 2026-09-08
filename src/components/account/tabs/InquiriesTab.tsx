"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Mail, Clock } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollectorPaginationBar } from "@/components/account/shared/CollectorPaginationBar";
import { useCollector } from "@/components/account/context/CollectorContext";

const INQUIRIES_PAGE_SIZE_OPTIONS = [5, 10, 15, 20];

export function InquiriesTab() {
  const { user, userInquiries } = useCollector();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const totalPages = Math.max(1, Math.ceil(userInquiries.length / pageSize));
  const paginatedInquiries = useMemo(() => {
    return userInquiries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [userInquiries, currentPage, pageSize]);

  const startItem = userInquiries.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, userInquiries.length);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#262833] pb-6">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-bold">
            Studio Ledger
          </span>
          <h2 className="font-serif text-3xl text-white mt-1">
            Your Acquisition Inquiries
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Direct correspondence recorded with Elena Vance's studio team.
          </p>
        </div>

        <Button
          asChild
          className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-6 self-start sm:self-auto cursor-pointer"
        >
          <Link href="/contact">
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            <span>Start New Inquiry</span>
          </Link>
        </Button>
      </div>

      {!user ? (
        <Card className="p-12 text-center bg-[#14151a] border-[#262833] rounded-3xl space-y-4 max-w-xl mx-auto my-6">
          <div className="w-14 h-14 rounded-full bg-[#1c1d25] border border-[#d1a86e]/30 flex items-center justify-center text-[#d1a86e] mx-auto">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-2xl text-white">Acquisition Ledger Locked</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
            Sign in to your collector account to review active inquiries, curatorial correspondence, and acquisition status.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button asChild className="rounded-full bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider px-6">
              <Link href="/login?redirect=/account?tab=inquiries">
                <span>Sign In to Access Ledger</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full border-[#262833] text-zinc-300 text-xs uppercase tracking-wider px-6">
              <Link href="/register?redirect=/account?tab=inquiries">
                <span>Register Account</span>
              </Link>
            </Button>
          </div>
        </Card>
      ) : userInquiries.length === 0 ? (
        <Card className="p-12 text-center bg-[#14151a]/50 border-[#262833] rounded-3xl space-y-4">
          <Mail className="w-10 h-10 text-zinc-600 mx-auto" />
          <h3 className="font-serif text-xl text-white">No active inquiries recorded</h3>
          <p className="text-xs text-zinc-400 max-w-md mx-auto leading-relaxed">
            When you inquire about acquiring an original painting or scheduling a private viewing, your studio correspondence will be tracked here in your private ledger.
          </p>
          <Button asChild className="rounded-full bg-[#d1a86e] text-[#0d0e12] text-xs uppercase tracking-wider">
            <Link href="/account?tab=gallery">Browse Gallery to Inquire</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {paginatedInquiries.map((inq) => (
              <Card
                key={inq.id}
                className="p-6 sm:p-8 bg-[#14151a] border-[#262833] rounded-3xl space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c1d25] pb-4">
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
                      Status: {inq.status}
                    </Badge>
                    <h4 className="font-serif text-lg text-white font-medium">
                      {inq.subject}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#d1a86e]" />
                    <span>
                      {new Date(inq.createdAt).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="bg-[#101116] p-4 sm:p-5 rounded-2xl border border-[#22242f] space-y-2">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                    Collector Message
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                    {inq.message}
                  </p>
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-400 pt-1">
                  <span>Studio ID: <span className="font-mono text-zinc-500">{inq.id}</span></span>
                  <Link
                    href={`/contact?subject=Follow-up%20re:%20${encodeURIComponent(inq.subject)}`}
                    className="text-[#d1a86e] hover:underline"
                  >
                    Send Follow-up Message &rarr;
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Standardized Collector Pagination Bar */}
          <CollectorPaginationBar
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={userInquiries.length}
            startItem={startItem}
            endItem={endItem}
            itemName="inquiries"
            pageSize={pageSize}
            pageSizeOptions={INQUIRIES_PAGE_SIZE_OPTIONS}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  );
}
