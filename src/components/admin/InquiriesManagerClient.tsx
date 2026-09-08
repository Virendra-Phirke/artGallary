"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { MockInquiry, MockArtwork } from "@/db/mockData";
import { SentEmailRecord, ActiveSubscriber } from "@/db/repository";
import { EmailCampaign, EmailJob } from "@/db/schema/campaigns";
import {
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  BarChart3,
  ArrowUpRight,
  Send,
  Eye,
  X,
  RefreshCw,
  Search,
  Check,
  Filter,
  ChevronDown,
  ChevronRight,
  Palette,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationPageSizeSelect,
  PAGE_SIZE_OPTIONS,
  getPaginationRange,
} from "@/components/ui/pagination";

interface InquiriesManagerClientProps {
  initialInquiries: MockInquiry[];
  initialSentEmails?: SentEmailRecord[];
  initialSubscribers?: ActiveSubscriber[];
  publishedArtworks?: MockArtwork[];
  initialCampaigns?: EmailCampaign[];
  initialEmailJobs?: EmailJob[];
}

export function InquiriesManagerClient({
  initialInquiries,
  initialSentEmails = [],
  initialSubscribers = [],
  publishedArtworks = [],
  initialCampaigns = [],
  initialEmailJobs = [],
}: InquiriesManagerClientProps) {
  const [activeTab, setActiveTab] = useState<"inquiries" | "sent_emails">("inquiries");
  const [inquiries, setInquiries] = useState<MockInquiry[]>(initialInquiries);
  const [sentEmails, setSentEmails] = useState<SentEmailRecord[]>(initialSentEmails);
  const [subscribers, setSubscribers] = useState<ActiveSubscriber[]>(initialSubscribers);
  const [artworks, setArtworks] = useState<MockArtwork[]>(publishedArtworks);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>(initialCampaigns);
  const [emailJobs, setEmailJobs] = useState<EmailJob[]>(initialEmailJobs);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedEmailType, setSelectedEmailType] = useState<string>("all");
  const [selectedDeliveryStatus, setSelectedDeliveryStatus] = useState<string>("all");
  const [emailSearchQuery, setEmailSearchQuery] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [previewEmail, setPreviewEmail] = useState<SentEmailRecord | null>(null);
  const [previewInquiry, setPreviewInquiry] = useState<MockInquiry | null>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const [inqRes, campRes] = await Promise.all([
        fetch("/api/admin/inquiries"),
        fetch("/api/admin/marketing/campaigns"),
      ]);

      if (inqRes.ok) {
        const data = await inqRes.json();
        if (data.inquiries) setInquiries(data.inquiries);
        if (data.sentEmails) setSentEmails(data.sentEmails);
      }

      if (campRes.ok) {
        const cData = await campRes.json();
        if (cData.campaigns) setCampaigns(cData.campaigns);
        if (cData.recentJobs) setEmailJobs(cData.recentJobs);
      }
    } catch (err) {
      console.error("Failed to refresh ledger data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Inquiries Search & Pagination
  const [inquirySearchQuery, setInquirySearchQuery] = useState("");
  const [inquiryPage, setInquiryPage] = useState(1);
  const [inquiryPageSize, setInquiryPageSize] = useState(10);

  const filteredInquiries = useMemo(() => {
    return inquiries.filter((inq) => {
      if (selectedStatus !== "all" && inq.status !== selectedStatus) return false;
      if (inquirySearchQuery.trim()) {
        const q = inquirySearchQuery.toLowerCase();
        const matchName = inq.name.toLowerCase().includes(q);
        const matchEmail = inq.email.toLowerCase().includes(q);
        const matchPhone = (inq.phone || "").toLowerCase().includes(q);
        const matchSubject = (inq.subject || "").toLowerCase().includes(q);
        const matchMessage = inq.message.toLowerCase().includes(q);
        const matchArt = (inq.artworkTitle || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchPhone && !matchSubject && !matchMessage && !matchArt) {
          return false;
        }
      }
      return true;
    });
  }, [inquiries, selectedStatus, inquirySearchQuery]);

  useEffect(() => {
    setInquiryPage(1);
  }, [inquirySearchQuery, selectedStatus, inquiryPageSize]);

  const inquiryTotalPages = Math.max(1, Math.ceil(filteredInquiries.length / inquiryPageSize));
  const paginatedInquiries = filteredInquiries.slice(
    (inquiryPage - 1) * inquiryPageSize,
    inquiryPage * inquiryPageSize
  );
  const inquiryStartItem = filteredInquiries.length === 0 ? 0 : (inquiryPage - 1) * inquiryPageSize + 1;
  const inquiryEndItem = Math.min(inquiryPage * inquiryPageSize, filteredInquiries.length);
  const inquiryPaginationRange = getPaginationRange(inquiryPage, inquiryTotalPages);

  // Sent Emails Pagination
  const [emailPage, setEmailPage] = useState(1);
  const [emailPageSize, setEmailPageSize] = useState(10);

  const filteredEmails = useMemo(() => {
    return sentEmails.filter((em) => {
      if (selectedEmailType !== "all" && em.emailType !== selectedEmailType) return false;
      if (selectedDeliveryStatus !== "all" && em.status !== selectedDeliveryStatus) return false;
      if (emailSearchQuery.trim()) {
        const q = emailSearchQuery.toLowerCase();
        const matchEmail = em.recipientEmail.toLowerCase().includes(q);
        const matchSubject = em.subject.toLowerCase().includes(q);
        const matchName = (em.recipientName || "").toLowerCase().includes(q);
        const matchId = (em.resendId || "").toLowerCase().includes(q);
        if (!matchEmail && !matchSubject && !matchName && !matchId) return false;
      }
      return true;
    });
  }, [sentEmails, selectedEmailType, selectedDeliveryStatus, emailSearchQuery]);

  useEffect(() => {
    setEmailPage(1);
  }, [emailSearchQuery, selectedEmailType, selectedDeliveryStatus, emailPageSize]);

  const emailTotalPages = Math.max(1, Math.ceil(filteredEmails.length / emailPageSize));
  const paginatedEmails = filteredEmails.slice(
    (emailPage - 1) * emailPageSize,
    emailPage * emailPageSize
  );
  const emailStartItem = filteredEmails.length === 0 ? 0 : (emailPage - 1) * emailPageSize + 1;
  const emailEndItem = Math.min(emailPage * emailPageSize, filteredEmails.length);
  const emailPaginationRange = getPaginationRange(emailPage, emailTotalPages);

  const handleStatusChange = async (id: string, newStatus: any) => {
    setInquiries((prev) =>
      prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
    );
    try {
      await fetch("/api/admin/inquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
    } catch (e) {
      console.error("Failed to update inquiry status in DB:", e);
    }
  };

  const countNew = inquiries.filter((i) => i.status === "new").length;
  const countRead = inquiries.filter((i) => i.status === "read").length;
  const countReplied = inquiries.filter((i) => i.status === "replied").length;
  const countClosed = inquiries.filter((i) => i.status === "closed").length;

  const countDelivered = sentEmails.filter((e) => e.status === "delivered").length;
  const countSandbox = sentEmails.filter((e) => e.status === "sandbox_restricted").length;
  const countFailed = sentEmails.filter((e) => e.status === "failed").length;

  return (
    <div className="space-y-4 sm:space-y-5 w-full">
      {/* Top Controls: Switcher Tabs + Compact Refresh & Telemetry */}
      <div className="flex items-center justify-between gap-2.5 flex-wrap">
        <div className="p-1 sm:p-1.5 bg-[#121319] rounded-2xl flex items-center gap-1 sm:gap-1.5 shadow-md">
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border-none ${
              activeTab === "inquiries"
                ? "bg-[#d1a86e] text-[#0d0e12] shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1b26]"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Inquiries</span>
            <span
              className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === "inquiries"
                  ? "bg-black/20 text-black font-bold"
                  : "bg-[#1a1b26] text-zinc-300"
              }`}
            >
              {inquiries.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("sent_emails")}
            className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border-none ${
              activeTab === "sent_emails"
                ? "bg-[#d1a86e] text-[#0d0e12] shadow-sm"
                : "text-zinc-400 hover:text-white hover:bg-[#1a1b26]"
            }`}
          >
            <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
            <span>Dispatches</span>
            <span
              className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === "sent_emails"
                  ? "bg-black/20 text-black font-bold"
                  : "bg-[#1a1b26] text-zinc-300"
              }`}
            >
              {sentEmails.length}
            </span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-[#121319] hover:bg-[#1a1b26] text-zinc-300 hover:text-white text-xs gap-1.5 h-8 px-3 rounded-xl border border-white/5 cursor-pointer shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#d1a86e] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh"}</span>
          </Button>

          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-xl bg-[#121319] hover:bg-[#1a1b26] text-zinc-300 hover:text-white text-xs transition-colors border border-white/5 shadow-sm"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span className="hidden sm:inline">Telemetry</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-500" />
          </Link>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* TAB 1: INQUIRIES LEDGER                                              */}
      {/* ==================================================================== */}
      {activeTab === "inquiries" && (
        <div className="space-y-4">
          {/* Telemetry Row - Compact 2 Columns on Mobile, 4 Columns on Desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full">
            <Card className="p-3 sm:p-4 bg-[#121319] rounded-xl sm:rounded-2xl shadow-xl shadow-black/40 space-y-0.5 border-none">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium truncate block">Total</span>
              <div className="font-serif text-lg sm:text-xl text-white">{inquiries.length}</div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 truncate block">All correspondence</span>
            </Card>
            <Card className="p-3 sm:p-4 bg-[#121319] rounded-xl sm:rounded-2xl shadow-xl shadow-black/40 space-y-0.5 border-none">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium truncate block">New</span>
              <div className="font-serif text-lg sm:text-xl text-amber-400">{countNew}</div>
              <span className="text-[10px] sm:text-[11px] text-amber-400/80 font-medium truncate block">Action required</span>
            </Card>
            <Card className="p-3 sm:p-4 bg-[#121319] rounded-xl sm:rounded-2xl shadow-xl shadow-black/40 space-y-0.5 border-none">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium truncate block">In Review</span>
              <div className="font-serif text-lg sm:text-xl text-blue-400">{countRead}</div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 truncate block">Dossier inspected</span>
            </Card>
            <Card className="p-3 sm:p-4 bg-[#121319] rounded-xl sm:rounded-2xl shadow-xl shadow-black/40 space-y-0.5 border-none">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-zinc-500 font-medium truncate block">Processed</span>
              <div className="font-serif text-lg sm:text-xl text-emerald-400">{countReplied + countClosed}</div>
              <span className="text-[10px] sm:text-[11px] text-emerald-400/80 font-medium truncate block">Acquisitions closed</span>
            </Card>
          </div>

          {/* Search & Compact Filter Bar - 2 cols 1 row on mobile */}
          <div className="p-2 sm:p-2.5 bg-[#121319] rounded-2xl shadow-md grid grid-cols-2 sm:flex sm:flex-row items-center sm:justify-between gap-2 sm:gap-2.5">
            <div className="relative w-full sm:max-w-md sm:flex-1">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                value={inquirySearchQuery}
                onChange={(e) => setInquirySearchQuery(e.target.value)}
                placeholder="Search inquiries..."
                className="w-full pl-8 sm:pl-9 pr-3 h-8 sm:h-9 bg-[#1a1b26] text-xs text-white placeholder:text-zinc-500 rounded-xl border-none focus:ring-1 focus:ring-[#d1a86e] focus:outline-none"
              />
            </div>

            {/* Dropdown Filter for Inquiries */}
            <div className="w-full sm:w-auto flex items-center justify-end shrink-0">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-xs font-medium text-zinc-200 border border-white/5 transition-colors cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <Filter className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                      <span className="truncate">
                        Status:{" "}
                        <strong className="font-semibold text-white capitalize">
                          {selectedStatus === "all" ? "All" : selectedStatus}
                        </strong>
                      </span>
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 p-1.5 bg-[#121319] border border-[#262833] rounded-xl shadow-2xl text-xs text-white z-[110]"
              >
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500 px-2 py-1">
                  Filter by Status
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10 my-1" />
                {[
                  { id: "all", label: "All Inquiries" },
                  { id: "new", label: "New (Action Required)" },
                  { id: "read", label: "In Review" },
                  { id: "replied", label: "Replied" },
                  { id: "closed", label: "Closed / Archived" },
                ].map((item) => (
                  <DropdownMenuItem
                    key={item.id}
                    onClick={() => setSelectedStatus(item.id)}
                    className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                      selectedStatus === item.id
                        ? "bg-[#251e16] text-[#d1a86e] font-semibold"
                        : "text-zinc-300 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <span>{item.label}</span>
                    {selectedStatus === item.id && (
                      <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            </div>
          </div>

          {/* Inquiries List - 2 columns on desktop, 1 on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {filteredInquiries.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-zinc-500 bg-[#121319] rounded-xl border border-white/5">
                No inquiries matching criteria.
              </div>
            ) : (
              paginatedInquiries.map((inq) => (
                <div
                  key={inq.id}
                  onClick={() => setPreviewInquiry(inq)}
                  className="bg-[#121319] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-md"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    {/* Status Badge + Canvas + Date */}
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider ${
                          inq.status === "new"
                            ? "bg-amber-950/80 text-amber-300"
                            : inq.status === "read"
                            ? "bg-blue-950/80 text-blue-300"
                            : inq.status === "replied"
                            ? "bg-emerald-950/80 text-emerald-300"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        {inq.status === "new" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />}
                        {inq.status === "read" && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                        {inq.status === "replied" && <CheckCircle2 className="w-3 h-3 text-emerald-300" />}
                        <span>{inq.status === "read" ? "In Review" : inq.status}</span>
                      </span>

                      {inq.artworkTitle && (
                        <span className="text-[10px] text-[#d1a86e] bg-[#d1a86e]/10 px-2 py-0.5 rounded-md font-medium truncate max-w-[130px] sm:max-w-[180px]">
                          Canvas: {inq.artworkTitle}
                        </span>
                      )}

                      <span className="text-[10px] text-zinc-400 font-mono ml-auto sm:ml-0">
                        {new Date(inq.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Collector Name & Subject */}
                    <h4 className="font-serif text-xs sm:text-sm text-white group-hover:text-[#d1a86e] transition-colors font-medium truncate">
                      {inq.name} {inq.subject ? `— ${inq.subject}` : ""}
                    </h4>

                    {/* Email, Phone & Message Preview */}
                    <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span className="text-zinc-300 truncate">{inq.email}</span>
                      {inq.phone && <span className="text-zinc-500 truncate hidden sm:inline">• {inq.phone}</span>}
                      <span className="text-zinc-600 mx-1 hidden sm:inline">|</span>
                      <span className="text-zinc-400 truncate italic font-sans">{inq.message}</span>
                    </div>
                  </div>

                  {/* Hover indicator */}
                  <div className="shrink-0 flex items-center gap-1.5 text-zinc-500 group-hover:text-[#d1a86e] transition-colors pl-1">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Inquiries Pagination and Per-Page Control Bar */}
          {filteredInquiries.length > 0 && (
            <div className="pt-3 pb-1 px-1 flex items-center justify-between gap-2 sm:gap-4 w-full flex-wrap sm:flex-nowrap">
              <div className="text-xs text-zinc-400 font-mono shrink-0">
                <span className="text-white font-semibold">{inquiryStartItem}–{inquiryEndItem}</span> of{" "}
                <span className="text-[#d1a86e] font-semibold">{filteredInquiries.length}</span>
              </div>

              <div className="flex items-center justify-center order-last sm:order-none w-full sm:w-auto">
                <Pagination className="w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setInquiryPage((p) => Math.max(1, p - 1))}
                        className={
                          inquiryPage <= 1
                            ? "pointer-events-none opacity-40"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {inquiryPaginationRange.map((item, idx) => (
                      <PaginationItem key={idx}>
                        {item === "..." ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            isActive={item === inquiryPage}
                            onClick={() => setInquiryPage(Number(item))}
                            className="cursor-pointer"
                          >
                            {item}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setInquiryPage((p) => Math.min(inquiryTotalPages, p + 1))}
                        className={
                          inquiryPage >= inquiryTotalPages
                            ? "pointer-events-none opacity-40"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>

              <div className="shrink-0">
                <PaginationPageSizeSelect
                  pageSize={inquiryPageSize}
                  onPageSizeChange={setInquiryPageSize}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: SENT DISPATCHES & EMAIL HISTORY                               */}
      {/* ==================================================================== */}
      {activeTab === "sent_emails" && (
        <div className="space-y-4 sm:space-y-5">
          {/* Email Telemetry Row - 2 columns on mobile, 4 on desktop */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 w-full">
            <Card className="p-3 sm:p-4 bg-[#121319] rounded-xl sm:rounded-2xl shadow-md border border-white/5 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 font-medium truncate block">
                Total Attempts
              </span>
              <div className="font-serif text-xl sm:text-2xl text-white font-semibold">
                {sentEmails.length}
              </div>
              <span className="text-[10px] sm:text-[11px] text-zinc-400 truncate block">
                All dispatches
              </span>
            </Card>

            <Card className="p-3 sm:p-4 bg-[#121319] rounded-xl sm:rounded-2xl shadow-md border border-white/5 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 font-medium truncate block">
                Delivered to Inbox
              </span>
              <div className="font-serif text-xl sm:text-2xl text-emerald-400 font-semibold">
                {countDelivered}
              </div>
              <span className="text-[10px] sm:text-[11px] text-emerald-400/80 truncate block">
                Accepted by Resend
              </span>
            </Card>

            <Card className="p-3 sm:p-4 bg-[#121319] rounded-xl sm:rounded-2xl shadow-md border border-white/5 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 font-medium truncate block">
                Active Campaigns
              </span>
              <div className="font-serif text-xl sm:text-2xl text-amber-400 font-semibold">
                {campaigns.length}
              </div>
              <span className="text-[10px] sm:text-[11px] text-amber-400/80 truncate block">
                Tracked in Neon DB
              </span>
            </Card>

            <Card className="p-3 sm:p-4 bg-[#121319] rounded-xl sm:rounded-2xl shadow-md border border-white/5 space-y-0.5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-zinc-400 font-medium truncate block">
                Failed
              </span>
              <div className="font-serif text-xl sm:text-2xl text-red-400 font-semibold">
                {countFailed}
              </div>
              <span className="text-[10px] sm:text-[11px] text-red-400/80 truncate block">
                Permanent errors
              </span>
            </Card>
          </div>

          {/* Search & Filter Controls - 2 cols 1 row on mobile */}
          <div className="p-2.5 sm:p-3 bg-[#121319] rounded-xl sm:rounded-2xl shadow-md border border-white/5 grid grid-cols-2 sm:flex sm:flex-row items-center sm:justify-between gap-2 sm:gap-2.5">
            {/* Search input */}
            <div className="relative w-full sm:max-w-md sm:flex-1">
              <Search className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="Filter dispatches..."
                value={emailSearchQuery}
                onChange={(e) => setEmailSearchQuery(e.target.value)}
                className="w-full bg-[#1a1b26] rounded-xl pl-8 sm:pl-9 pr-8 h-8 sm:h-9 text-xs text-white placeholder-zinc-500 border-none focus:ring-1 focus:ring-[#d1a86e] focus:outline-none"
              />
              {emailSearchQuery && (
                <button
                  onClick={() => setEmailSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white border-none cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="w-full sm:w-auto flex items-center justify-end gap-1.5 sm:gap-2 shrink-0">
              {/* Delivery Status Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="w-full sm:w-auto inline-flex items-center justify-between sm:justify-start gap-1.5 sm:gap-2 h-8 sm:h-9 px-2.5 sm:px-3 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-xs font-medium text-zinc-200 border border-white/5 transition-colors cursor-pointer"
                  >
                    <span className="inline-flex items-center gap-1.5 truncate">
                      <Filter className="w-3.5 h-3.5 text-[#d1a86e] shrink-0" />
                      <span className="truncate">
                        <span className="hidden sm:inline">Delivery: </span>
                        <strong className="font-semibold text-white capitalize">
                          {selectedDeliveryStatus === "all"
                            ? "All"
                            : selectedDeliveryStatus === "delivered"
                            ? "Delivered"
                            : selectedDeliveryStatus === "sandbox_restricted"
                            ? "Sandbox"
                            : "Failed"}
                        </strong>
                      </span>
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-48 p-1.5 bg-[#121319] border border-[#262833] rounded-xl shadow-2xl text-xs text-white z-[110]"
                >
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500 px-2 py-1">
                    Delivery Status
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10 my-1" />
                  {[
                    { id: "all", label: "All Statuses" },
                    { id: "delivered", label: "Delivered to Inbox" },
                    { id: "sandbox_restricted", label: "Sandbox Held" },
                    { id: "failed", label: "Delivery Failed" },
                  ].map((s) => (
                    <DropdownMenuItem
                      key={s.id}
                      onClick={() => setSelectedDeliveryStatus(s.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        selectedDeliveryStatus === s.id
                          ? "bg-[#251e16] text-[#d1a86e] font-semibold"
                          : "text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span>{s.label}</span>
                      {selectedDeliveryStatus === s.id && (
                        <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Email Type Dropdown - Shown on desktop/tablet */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="hidden sm:inline-flex items-center gap-2 h-8 sm:h-9 px-3 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-xs font-medium text-zinc-200 border border-white/5 transition-colors cursor-pointer"
                  >
                    <span>
                      Type:{" "}
                      <strong className="font-semibold text-white capitalize">
                        {selectedEmailType === "all" ? "All" : selectedEmailType.replace(/_/g, " ")}
                      </strong>
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-52 p-1.5 bg-[#121319] border border-[#262833] rounded-xl shadow-2xl text-xs text-white z-[110]"
                >
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500 px-2 py-1">
                    Dispatch Type
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10 my-1" />
                  {[
                    { id: "all", label: "All Dispatches" },
                    { id: "artwork_announcement", label: "Artwork Announcements" },
                    { id: "artwork_announcement_preview", label: "Curator Previews" },
                    { id: "inquiry_confirmation", label: "Inquiry Receipts" },
                    { id: "curator_alert", label: "Curator Alerts" },
                  ].map((f) => (
                    <DropdownMenuItem
                      key={f.id}
                      onClick={() => setSelectedEmailType(f.id)}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs cursor-pointer transition-colors ${
                        selectedEmailType === f.id
                          ? "bg-[#251e16] text-[#d1a86e] font-semibold"
                          : "text-zinc-300 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <span className="truncate">{f.label}</span>
                      {selectedEmailType === f.id && (
                        <Check className="w-3.5 h-3.5 text-[#d1a86e]" />
                      )}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Sent Emails List - 2 columns on desktop, 1 on mobile */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
            {filteredEmails.length === 0 ? (
              <div className="col-span-full p-8 text-center text-xs text-zinc-500 bg-[#121319] rounded-xl border border-white/5">
                No email dispatch records matching your criteria.
              </div>
            ) : (
              paginatedEmails.map((email) => (
                <div
                  key={email.id}
                  onClick={() => setPreviewEmail(email)}
                  className="bg-[#121319] p-3 sm:p-3.5 rounded-xl sm:rounded-2xl border border-white/5 hover:border-white/10 hover:bg-white/[0.04] transition-all flex items-center justify-between gap-3 cursor-pointer group shadow-md"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                      {email.status === "delivered" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-emerald-950/80 text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Delivered</span>
                        </span>
                      )}
                      {email.status === "sandbox_restricted" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-amber-950/80 text-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>Held</span>
                        </span>
                      )}
                      {email.status === "failed" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-red-950/80 text-red-300">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      )}
                      {email.status === "simulated" && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-blue-950/80 text-blue-300">
                          <span>Simulated</span>
                        </span>
                      )}

                      <span className="text-[10px] text-zinc-400 bg-[#1a1b26] px-2 py-0.5 rounded-md font-mono">
                        {email.emailType.replace(/_/g, " ")}
                      </span>

                      <span className="text-[10px] text-zinc-400 font-mono ml-auto sm:ml-0">
                        {new Date(email.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    <h4 className="font-serif text-xs sm:text-sm text-white group-hover:text-[#d1a86e] transition-colors font-medium truncate">
                      {email.subject}
                    </h4>

                    <div className="text-[11px] text-zinc-400 font-mono flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span className="text-zinc-300 truncate">{email.recipientEmail}</span>
                      {email.recipientName && (
                        <span className="text-zinc-400 truncate">({email.recipientName})</span>
                      )}
                    </div>

                    {email.errorMessage && (
                      <p className="text-[10px] text-red-400 font-mono line-clamp-1">
                        {email.errorMessage}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-1.5 text-zinc-500 group-hover:text-[#d1a86e] transition-colors pl-1">
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sent Emails Pagination and Per-Page Control Bar */}
          {filteredEmails.length > 0 && (
            <div className="pt-3 pb-1 px-1 flex items-center justify-between gap-2 sm:gap-4 w-full flex-wrap sm:flex-nowrap">
              <div className="text-xs text-zinc-400 font-mono shrink-0">
                <span className="text-white font-semibold">{emailStartItem}–{emailEndItem}</span> of{" "}
                <span className="text-[#d1a86e] font-semibold">{filteredEmails.length}</span>
              </div>

              <div className="flex items-center justify-center order-last sm:order-none w-full sm:w-auto">
                <Pagination className="w-auto mx-0">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setEmailPage((p) => Math.max(1, p - 1))}
                        className={
                          emailPage <= 1
                            ? "pointer-events-none opacity-40"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>

                    {emailPaginationRange.map((item, idx) => (
                      <PaginationItem key={idx}>
                        {item === "..." ? (
                          <PaginationEllipsis />
                        ) : (
                          <PaginationLink
                            isActive={item === emailPage}
                            onClick={() => setEmailPage(Number(item))}
                            className="cursor-pointer"
                          >
                            {item}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setEmailPage((p) => Math.min(emailTotalPages, p + 1))}
                        className={
                          emailPage >= emailTotalPages
                            ? "pointer-events-none opacity-40"
                            : "cursor-pointer"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>

              <div className="shrink-0">
                <PaginationPageSizeSelect
                  pageSize={emailPageSize}
                  onPageSizeChange={setEmailPageSize}
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* INQUIRY DETAIL & REPLY MODAL                                         */}
      {/* ==================================================================== */}
      {previewInquiry && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121319] rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-black/80 border border-white/5">
            <div className="p-5 sm:p-6 bg-[#161720] flex items-center justify-between gap-4 border-b border-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md font-semibold font-mono bg-[#d1a86e]/10 text-[#d1a86e]">
                    Inquiry Dossier
                  </span>
                  <span className="text-zinc-500 text-xs font-mono">
                    {new Date(previewInquiry.createdAt).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-serif text-lg sm:text-xl text-white font-medium">
                  {previewInquiry.name}
                </h3>
              </div>
              <button
                onClick={() => setPreviewInquiry(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-[#1a1b26] transition-colors cursor-pointer border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4 bg-[#0d0e13]">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-[#14151f] rounded-2xl border border-white/5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">Email</span>
                  <a href={`mailto:${previewInquiry.email}`} className="text-xs text-[#d1a86e] hover:underline font-mono">
                    {previewInquiry.email}
                  </a>
                </div>
                {previewInquiry.phone && (
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">Phone</span>
                    <span className="text-xs text-zinc-300 font-mono">{previewInquiry.phone}</span>
                  </div>
                )}
                {previewInquiry.artworkTitle && (
                  <div className="sm:col-span-2 pt-1 border-t border-white/5">
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono block">Associated Canvas</span>
                    <span className="text-xs text-white font-serif">{previewInquiry.artworkTitle}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between p-3 bg-[#14151f] rounded-2xl border border-white/5">
                <span className="text-xs text-zinc-400 font-medium">Workflow Status:</span>
                <select
                  value={previewInquiry.status}
                  onChange={(e) => {
                    const newStatus = e.target.value as MockInquiry["status"];
                    handleStatusChange(previewInquiry.id, newStatus);
                    setPreviewInquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
                  }}
                  className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded-xl font-semibold cursor-pointer border-none focus:outline-none focus:ring-1 focus:ring-[#d1a86e] ${
                    previewInquiry.status === "new"
                      ? "bg-amber-950/80 text-amber-300"
                      : previewInquiry.status === "read"
                      ? "bg-blue-950/80 text-blue-300"
                      : previewInquiry.status === "replied"
                      ? "bg-emerald-950/80 text-emerald-300"
                      : "bg-zinc-800 text-zinc-400"
                  }`}
                >
                  <option value="new">New (Action Required)</option>
                  <option value="read">In Review</option>
                  <option value="replied">Replied</option>
                  <option value="closed">Closed / Archived</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <span className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold block">Message Content</span>
                <div className="p-4 bg-[#14151f] rounded-2xl text-xs sm:text-sm text-zinc-200 leading-relaxed border border-white/5 whitespace-pre-wrap">
                  {previewInquiry.message}
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-5 bg-[#161720] flex items-center justify-between border-t border-white/5">
              <span className="text-[10px] font-mono text-zinc-600">ID: {previewInquiry.id}</span>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewInquiry(null)}
                  className="bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 text-xs cursor-pointer rounded-xl border-none px-3"
                >
                  Close
                </Button>
                <Button
                  asChild
                  size="sm"
                  className="bg-[#d1a86e] hover:bg-[#c49a5f] text-black font-semibold text-xs gap-1.5 rounded-xl border-none px-4 cursor-pointer shadow-lg"
                >
                  <a href={`mailto:${previewInquiry.email}?subject=Re: ${encodeURIComponent(previewInquiry.subject || "Artwork Inquiry")}`}>
                    <Mail className="w-3.5 h-3.5" />
                    <span>Reply via Email</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================================== */}
      {/* EMAIL PREVIEW MODAL                                                  */}
      {/* ==================================================================== */}
      {previewEmail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121319] rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl shadow-black/80 border-none">
            <div className="p-5 sm:p-6 bg-[#161720] flex items-center justify-between gap-4 border-none">
              <div>
                <h3 className="font-serif text-lg text-white">Email Dispatch Preview</h3>
                <p className="text-xs text-zinc-400">{previewEmail.subject}</p>
                <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                  To: {previewEmail.recipientEmail} {previewEmail.recipientName ? `(${previewEmail.recipientName})` : ""}
                </p>
              </div>
              <button
                onClick={() => setPreviewEmail(null)}
                className="p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-[#1a1b26] transition-colors cursor-pointer border-none"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 sm:p-7 bg-[#0d0e13]">
              <div
                className="prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: previewEmail.htmlContent || "<p>No content</p>" }}
              />
            </div>

            <div className="p-4 sm:p-5 bg-[#161720] flex justify-end border-none">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPreviewEmail(null)}
                className="bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 text-xs cursor-pointer rounded-xl border-none px-4"
              >
                Close Preview
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
