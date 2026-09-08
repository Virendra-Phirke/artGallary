"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Mail, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CollectorPaginationBar } from "@/components/account/shared/CollectorPaginationBar";
import { useCollector } from "@/components/account/context/CollectorContext";
import { PAGE_SIZE_OPTIONS } from "@/components/ui/pagination";

export function InquiriesTab() {
  const { user, userInquiries } = useCollector();

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const totalPages = Math.max(1, Math.ceil(userInquiries.length / pageSize));
  const paginatedInquiries = useMemo(() => {
    return userInquiries.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  }, [userInquiries, currentPage, pageSize]);

  const startItem = userInquiries.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, userInquiries.length);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200">
      <div className="flex items-center justify-end">
        <Button
          asChild
          className="h-8 sm:h-9 px-4 sm:px-5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow-md shadow-[#d1a86e]/15 cursor-pointer transition-all active:scale-[0.98]"
        >
          <Link href="/contact">
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            <span>New Inquiry</span>
          </Link>
        </Button>
      </div>

      {!user ? (
        <div className="p-6 sm:p-12 text-center bg-[#121319] rounded-2xl sm:rounded-3xl space-y-4 max-w-xl mx-auto my-4 sm:my-6 shadow-xl shadow-black/40">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-[#1c1e2b] flex items-center justify-center text-[#d1a86e] mx-auto shadow-inner">
            <Mail className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <h3 className="font-serif text-xl sm:text-2xl text-white">Acquisition Ledger Locked</h3>
          <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-light">
            Sign in to your collector account to review active inquiries, curatorial correspondence, and acquisition status.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <Button asChild className="h-9 sm:h-10 px-5 rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs font-semibold uppercase tracking-wider shadow-md shadow-[#d1a86e]/15 transition-all active:scale-[0.98]">
              <Link href="/login?redirect=/account?tab=inquiries">
                <span>Sign In</span>
              </Link>
            </Button>
            <Button asChild className="h-9 sm:h-10 px-5 rounded-full bg-[#1c1d28] hover:bg-[#252736] text-zinc-200 hover:text-white text-xs uppercase tracking-wider transition-all active:scale-[0.98] shadow-md">
              <Link href="/register?redirect=/account?tab=inquiries">
                <span>Register</span>
              </Link>
            </Button>
          </div>
        </div>
      ) : userInquiries.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-[#121319] rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-4 shadow-xl shadow-black/40">
          <Mail className="w-8 h-8 sm:w-10 sm:h-10 text-zinc-600 mx-auto" />
          <h3 className="font-serif text-xl sm:text-2xl text-white">No active inquiries recorded</h3>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-md mx-auto leading-relaxed font-light">
            When you inquire about acquiring an original painting or scheduling a private viewing, your studio correspondence will be tracked here in your private ledger.
          </p>
          <Button asChild className="rounded-full bg-[#d1a86e] hover:bg-[#dfba82] text-[#0d0e12] text-xs uppercase tracking-wider font-semibold shadow-md shadow-[#d1a86e]/15 px-5 sm:px-6 h-9 sm:h-10">
            <Link href="/account?tab=gallery">Browse Gallery to Inquire</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4 sm:space-y-6">
          {/* Curatorial Ledger Summary Cards - 3 Column Micro Grid */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-[#121319] space-y-0.5 sm:space-y-1 shadow-md">
              <span className="text-[8px] sm:text-[10px] uppercase font-mono tracking-wider sm:tracking-widest text-zinc-500 block truncate">
                Total
              </span>
              <div className="font-serif text-lg sm:text-3xl text-white font-medium">
                {userInquiries.length}
              </div>
              <p className="text-[9px] sm:text-[11px] text-zinc-500 truncate hidden xs:block">Transmissions</p>
            </div>

            <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-[#121319] space-y-0.5 sm:space-y-1 shadow-md">
              <span className="text-[8px] sm:text-[10px] uppercase font-mono tracking-wider sm:tracking-widest text-zinc-500 block truncate">
                Replies
              </span>
              <div className="font-serif text-lg sm:text-3xl text-emerald-400 font-medium">
                {userInquiries.filter((i) => i.status === "replied").length}
              </div>
              <p className="text-[9px] sm:text-[11px] text-zinc-500 truncate hidden xs:block">Received</p>
            </div>

            <div className="p-3 sm:p-6 rounded-xl sm:rounded-2xl bg-[#121319] space-y-0.5 sm:space-y-1 shadow-md">
              <span className="text-[8px] sm:text-[10px] uppercase font-mono tracking-wider sm:tracking-widest text-zinc-500 block truncate">
                Liaison
              </span>
              <div className="font-serif text-lg sm:text-3xl text-[#d1a86e] font-medium flex items-center gap-1.5">
                <span>Active</span>
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#d1a86e] animate-ping" />
              </div>
              <p className="text-[9px] sm:text-[11px] text-zinc-500 truncate hidden xs:block">24hr Response</p>
            </div>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {paginatedInquiries.map((inq) => (
              <div
                key={inq.id}
                className="p-4 sm:p-8 bg-[#1a1b26] rounded-2xl sm:rounded-3xl space-y-3 sm:space-y-5 shadow-xl shadow-black/40"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        inq.status === "replied"
                          ? "success"
                          : inq.status === "read"
                          ? "gold"
                          : "warning"
                      }
                      className="border-0 text-[10px] uppercase font-mono"
                    >
                      Status: {inq.status}
                    </Badge>
                    <h4 className="font-serif text-lg text-white font-medium">
                      {inq.subject}
                    </h4>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400 font-mono">
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

                <div className="bg-[#121319] p-4 sm:p-5 rounded-2xl space-y-2 shadow-inner">
                  <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-mono">
                    Collector Message
                  </span>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap font-light">
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
              </div>
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
            pageSizeOptions={PAGE_SIZE_OPTIONS}
            onPageChange={setCurrentPage}
            onPageSizeChange={setPageSize}
          />
        </div>
      )}
    </div>
  );
}
