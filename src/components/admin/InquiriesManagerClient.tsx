"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { MockInquiry, MockArtwork } from "@/db/mockData";
import { SentEmailRecord, ActiveSubscriber } from "@/db/repository";
import { EmailCampaign, EmailJob } from "@/db/schema/campaigns";
import {
  Mail,
  Phone,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  MessageSquare,
  Shield,
  BarChart3,
  ArrowUpRight,
  Send,
  Eye,
  X,
  ExternalLink,
  RefreshCw,
  Search,
  Sparkles,
  CheckSquare,
  Square,
  Users,
  Check,
  Calendar,
  Layers,
  Globe,
  Radio,
  Filter,
  ChevronDown,
  Palette,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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

  // Broadcast Studio State
  const unnotifiedArtwork = artworks.find((a) => !a.notifiedSubscribersAt);
  const [selectedArtworkId, setSelectedArtworkId] = useState<string>(
    unnotifiedArtwork?.id || artworks[0]?.id || ""
  );
  const [selectedSubscriberEmails, setSelectedSubscriberEmails] = useState<string[]>(
    initialSubscribers.map((s) => s.email)
  );
  const [subscriberSearchQuery, setSubscriberSearchQuery] = useState<string>("");
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Scheduling State
  const [sendTiming, setSendTiming] = useState<"now" | "schedule">("now");
  const [scheduledDate, setScheduledDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  });
  const [scheduledTime, setScheduledTime] = useState<string>("18:00");
  const [timezone, setTimezone] = useState<string>("Asia/Kolkata");

  useEffect(() => {
    try {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (userTz) setTimezone(userTz);
    } catch {
      // Keep default
    }
  }, []);

  const selectedArtwork = artworks.find((a) => a.id === selectedArtworkId);

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

      const broadcastRes = await fetch("/api/admin/marketing/broadcast");
      if (broadcastRes.ok) {
        const bData = await broadcastRes.json();
        if (bData.subscribers) setSubscribers(bData.subscribers);
        if (bData.artworks) setArtworks(bData.artworks);
      }
    } catch (err) {
      console.error("Failed to refresh ledger data:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Recipient Selection Logic
  const filteredSubscribers = subscribers.filter((sub) => {
    if (!subscriberSearchQuery.trim()) return true;
    const q = subscriberSearchQuery.toLowerCase();
    const matchEmail = sub.email.toLowerCase().includes(q);
    const matchName = (sub.name || "").toLowerCase().includes(q);
    return matchEmail || matchName;
  });

  const isAllSelected =
    subscribers.length > 0 &&
    subscribers.every((s) => selectedSubscriberEmails.includes(s.email));

  const handleSelectAllToggle = () => {
    if (isAllSelected) {
      setSelectedSubscriberEmails([]);
    } else {
      setSelectedSubscriberEmails(subscribers.map((s) => s.email));
    }
  };

  const handleToggleSubscriber = (email: string) => {
    setSelectedSubscriberEmails((prev) =>
      prev.includes(email) ? prev.filter((e) => e !== email) : [...prev, email]
    );
  };

  // Trigger Broadcast / Schedule Campaign
  const handleSendBroadcast = async () => {
    if (!selectedArtworkId) {
      setBroadcastStatus({
        type: "error",
        message: "Please select an artwork to broadcast.",
      });
      return;
    }

    if (selectedSubscriberEmails.length === 0) {
      setBroadcastStatus({
        type: "error",
        message: "Please select at least one collector recipient.",
      });
      return;
    }

    setIsBroadcasting(true);
    setBroadcastStatus(null);

    try {
      let finalScheduledAt: string | null = null;
      if (sendTiming === "schedule") {
        const [hours, minutes] = scheduledTime.split(":").map(Number);
        const [year, month, day] = scheduledDate.split("-").map(Number);
        const targetDate = new Date(Date.UTC(year, month - 1, day, hours, minutes));
        finalScheduledAt = targetDate.toISOString();
      }

      const res = await fetch("/api/admin/marketing/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Release: ${selectedArtwork?.title || "Masterwork"}`,
          subject: `Masterwork Release: “${selectedArtwork?.title || "New Canvas"}” by Elena Vance`,
          artworkId: selectedArtworkId,
          selectedSubscriberEmails,
          scheduledAt: finalScheduledAt,
          timezone,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setBroadcastStatus({
          type: "success",
          message: data.message || `✓ Campaign processed for ${selectedSubscriberEmails.length} collector(s)!`,
        });

        // Mark artwork as notified locally if sent immediately
        if (sendTiming === "now") {
          setArtworks((prev) =>
            prev.map((a) =>
              a.id === selectedArtworkId
                ? { ...a, notifiedSubscribersAt: new Date().toISOString() }
                : a
            )
          );
        }

        // Auto-refresh sent emails & campaigns ledger
        await handleRefresh();
      } else {
        setBroadcastStatus({
          type: "error",
          message: data.error || "Failed to process campaign dispatch.",
        });
      }
    } catch (err: any) {
      setBroadcastStatus({
        type: "error",
        message: err.message || "Network error while dispatching campaign.",
      });
    } finally {
      setIsBroadcasting(false);
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
    <div className="space-y-8 w-full">
      {/* Header Plaque */}
      <div className="p-6 sm:p-8 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-[#d1a86e] uppercase font-semibold">
            Collector Relations &amp; Ledger
          </span>
          <h1 className="font-serif text-3xl text-white mt-1">
            Collector Inquiries &amp; Acquisitions
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Review incoming acquisition requests, broadcast release announcements to interested collectors, and audit email dispatches.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 hover:text-white text-xs gap-1.5 h-9 px-4 rounded-xl border-none cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#d1a86e] ${isRefreshing ? "animate-spin" : ""}`} />
            <span>{isRefreshing ? "Refreshing..." : "Refresh Ledger"}</span>
          </Button>

          <Link
            href="/admin/analytics"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-zinc-300 hover:text-white text-xs transition-colors border-none"
          >
            <BarChart3 className="w-3.5 h-3.5 text-[#d1a86e]" />
            <span>Acquisition Telemetry</span>
            <ArrowUpRight className="w-3 h-3 text-zinc-500" />
          </Link>
        </div>
      </div>

      {/* Primary Section Switcher Tabs */}
      <div className="p-1 sm:p-1.5 bg-[#121319] rounded-2xl grid grid-cols-2 sm:flex sm:items-center gap-1 sm:gap-2 shadow-md w-full sm:w-fit">
        <button
          onClick={() => setActiveTab("inquiries")}
          className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border-none ${
            activeTab === "inquiries"
              ? "bg-[#d1a86e] text-[#0d0e12] shadow-lg shadow-black/30"
              : "text-zinc-400 hover:text-white hover:bg-[#1a1b26]"
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Inquiries</span>
          <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "inquiries" ? "bg-black/20 text-black font-bold" : "bg-[#1a1b26] text-zinc-300"}`}>
            {inquiries.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("sent_emails")}
          className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer border-none ${
            activeTab === "sent_emails"
              ? "bg-[#d1a86e] text-[#0d0e12] shadow-lg shadow-black/30"
              : "text-zinc-400 hover:text-white hover:bg-[#1a1b26]"
          }`}
        >
          <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
          <span className="truncate">Dispatches</span>
          <span className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full ${activeTab === "sent_emails" ? "bg-black/20 text-black font-bold" : "bg-[#1a1b26] text-zinc-300"}`}>
            {sentEmails.length}
          </span>
          {unnotifiedArtwork && (
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#d1a86e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#d1a86e]"></span>
            </span>
          )}
        </button>
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

          {/* Search & Compact Filter Bar */}
          <div className="p-2 sm:p-2.5 bg-[#121319] rounded-2xl shadow-md flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <Input
                value={inquirySearchQuery}
                onChange={(e) => setInquirySearchQuery(e.target.value)}
                placeholder="Search collector inquiries by name, email, canvas..."
                className="pl-9 h-8 sm:h-9 bg-[#1a1b26] text-xs text-white placeholder:text-zinc-500 rounded-xl border-none focus-visible:ring-1 focus-visible:ring-[#d1a86e]"
              />
            </div>

            {/* Dropdown Filter for Inquiries */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 h-8 sm:h-9 px-3 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-xs font-medium text-zinc-200 border border-white/5 transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                >
                  <Filter className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>
                    Status:{" "}
                    <strong className="font-semibold text-white capitalize">
                      {selectedStatus === "all" ? "All" : selectedStatus}
                    </strong>
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
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

          {/* Inquiries Cards - 2 Column Layout with Compact Mobile Blocks */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-3.5">
            {filteredInquiries.length === 0 ? (
              <div className="col-span-full p-8 text-center bg-[#121319] rounded-2xl text-xs text-zinc-500 border border-white/5">
                No inquiries matching criteria.
              </div>
            ) : (
              paginatedInquiries.map((inq) => (
                <Card
                  key={inq.id}
                  className="p-3.5 sm:p-4 bg-[#14151e] rounded-xl sm:rounded-2xl border border-[#222432] hover:border-[#d1a86e]/30 transition-all flex flex-col justify-between gap-2.5 shadow-lg shadow-black/20"
                >
                  <div className="space-y-2">
                    {/* Status Select Badge + Date */}
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={inq.status}
                        onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                        className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-lg font-semibold cursor-pointer border-none focus:outline-none focus:ring-1 focus:ring-[#d1a86e] ${
                          inq.status === "new"
                            ? "bg-amber-950/80 text-amber-300"
                            : inq.status === "read"
                            ? "bg-blue-950/80 text-blue-300"
                            : inq.status === "replied"
                            ? "bg-emerald-950/80 text-emerald-300"
                            : "bg-zinc-800 text-zinc-400"
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="replied">Replied</option>
                        <option value="closed">Closed</option>
                      </select>

                      <span className="font-mono text-[10px] text-zinc-500">
                        {new Date(inq.createdAt).toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Collector Name & Contact Details */}
                    <div>
                      <h3 className="font-serif text-sm sm:text-base text-white font-medium truncate">
                        {inq.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 mt-0.5 text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1 font-mono">
                          <Mail className="w-3 h-3 text-zinc-500 shrink-0" />
                          <a
                            href={`mailto:${inq.email}`}
                            className="hover:text-white transition-colors truncate max-w-[170px] sm:max-w-none"
                          >
                            {inq.email}
                          </a>
                        </div>
                        {inq.phone && (
                          <div className="flex items-center gap-1 font-mono text-zinc-400">
                            <Phone className="w-3 h-3 text-zinc-500 shrink-0" />
                            <span>{inq.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Associated Canvas Pill */}
                    {inq.artworkTitle && (
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#d1a86e]/10 text-[#d1a86e] text-[10px] font-medium max-w-full truncate">
                        <Palette className="w-3 h-3 shrink-0" />
                        <span className="truncate">Canvas: {inq.artworkTitle}</span>
                      </div>
                    )}

                    {/* Message Box - Compact Clamp */}
                    <div className="p-2.5 bg-[#0d0e12] rounded-xl text-xs text-zinc-300 leading-relaxed border border-white/5 line-clamp-3 sm:line-clamp-4">
                      {inq.message}
                    </div>
                  </div>

                  {/* Footer with ID & Compact Email Reply */}
                  <div className="pt-1 flex items-center justify-between border-t border-white/5">
                    <span className="text-[10px] font-mono text-zinc-600 truncate">
                      ID: {inq.id.slice(0, 8)}...
                    </span>
                    <Button
                      asChild
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2.5 bg-[#1a1b26] hover:bg-[#222432] text-white text-[11px] font-medium rounded-lg border-none transition-colors"
                    >
                      <a
                        href={`mailto:${inq.email}?subject=Re: ${encodeURIComponent(inq.subject || "Artwork Inquiry")}`}
                        className="inline-flex items-center gap-1.5"
                      >
                        <Mail className="w-3 h-3 text-[#d1a86e]" />
                        <span>Reply via Email</span>
                      </a>
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </div>

          {/* Inquiries Pagination and Per-Page Control Bar - Transparent */}
          {filteredInquiries.length > 0 && (
            <div className="p-3 sm:p-4 bg-transparent rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-zinc-400 font-mono">
                Showing <span className="text-white font-semibold">{inquiryStartItem}–{inquiryEndItem}</span> of{" "}
                <span className="text-[#d1a86e] font-semibold">{filteredInquiries.length}</span> inquiries
              </div>

              <div>
                <Pagination>
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

              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider">Per Page:</span>
                <div className="flex items-center rounded-xl bg-transparent border border-white/10 p-0.5">
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setInquiryPageSize(size)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer border-none ${
                        inquiryPageSize === size
                          ? "bg-[#d1a86e] text-black font-semibold shadow-sm"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ==================================================================== */}
      {/* TAB 2: SENT DISPATCHES & EMAIL HISTORY                               */}
      {/* ==================================================================== */}
      {activeTab === "sent_emails" && (
        <div className="space-y-6">
          {/* ============================================================== */}
          {/* BROADCAST RELEASE STUDIO (SUGGESTION & RECIPIENT SELECTION)     */}
          {/* ============================================================== */}
          <Card className="bg-[#121319] rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-black/40 relative overflow-hidden border-none">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] tracking-[0.2em] uppercase font-semibold text-[#d1a86e] bg-[#d1a86e]/10 px-2.5 py-1 rounded-xl flex items-center gap-1.5 border-none">
                    <Sparkles className="w-3 h-3" />
                    <span>Broadcast Release Studio</span>
                  </span>
                  {unnotifiedArtwork && (
                    <span className="text-[10px] uppercase tracking-wider text-amber-300 font-medium">
                      • Recommendation Ready
                    </span>
                  )}
                </div>
                <h2 className="font-serif text-xl text-white">
                  Send Release Announcement to Collectors
                </h2>
                <p className="text-xs text-zinc-400">
                  Select a published artwork, choose recipients with manual controls, and dispatch immediately or schedule with QStash.
                </p>
              </div>

              {/* Verified Sender & QStash Queue Pill */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-[11px] bg-[#1a1b26] rounded-xl px-3.5 py-2 flex items-center gap-2 text-zinc-300 border-none shadow-sm">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-mono text-zinc-200 text-xs">quizmas@quizmastor.tech</span>
                </div>

                <div className="text-[11px] bg-[#1a1b26] rounded-xl px-3.5 py-2 flex items-center gap-1.5 text-zinc-300 border-none shadow-sm">
                  <Layers className="w-3.5 h-3.5 text-[#d1a86e]" />
                  <span>QStash Queue Active</span>
                </div>
              </div>
            </div>

            {/* Broadcast Status Feedback Message */}
            {broadcastStatus && (
              <div
                className={`p-4 rounded-2xl text-xs flex items-center justify-between gap-3 border-none shadow-md ${
                  broadcastStatus.type === "success"
                    ? "bg-emerald-950/80 text-emerald-200"
                    : "bg-red-950/80 text-red-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  {broadcastStatus.type === "success" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  )}
                  <span>{broadcastStatus.message}</span>
                </div>
                <button
                  onClick={() => setBroadcastStatus(null)}
                  className="text-zinc-400 hover:text-white text-xs cursor-pointer border-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Step 1: Artwork Selection */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-5 space-y-4">
                <div>
                  <label className="block text-[11px] uppercase tracking-wider text-zinc-400 font-semibold mb-1.5">
                    1. Select Published Canvas to Broadcast
                  </label>
                  {artworks.length === 0 ? (
                    <div className="p-4 bg-[#1a1b26] rounded-2xl text-xs text-zinc-400 border-none">
                      No published artworks found. Please publish an artwork first.
                    </div>
                  ) : (
                    <select
                      value={selectedArtworkId}
                      onChange={(e) => setSelectedArtworkId(e.target.value)}
                      className="w-full bg-[#1a1b26] rounded-xl px-3.5 py-2.5 text-xs text-white border-none focus:ring-1 focus:ring-[#d1a86e] focus:outline-none cursor-pointer"
                    >
                      {artworks.map((art) => (
                        <option key={art.id} value={art.id}>
                          {art.title} ({art.status})
                          {art.notifiedSubscribersAt ? " — (Notified)" : " — (✨ Ready to Broadcast)"}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Selected Artwork Card Preview */}
                {selectedArtwork && (
                  <div className="p-4 bg-[#1a1b26] rounded-2xl flex gap-4 items-center shadow-md border-none">
                    {selectedArtwork.coverImageUrl ? (
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm">
                        <Image
                          src={selectedArtwork.coverImageUrl}
                          alt={selectedArtwork.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-16 h-16 rounded-xl bg-[#121319] flex items-center justify-center text-zinc-500 text-xs shrink-0">
                        No image
                      </div>
                    )}

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-serif text-sm font-semibold text-white truncate">
                          {selectedArtwork.title}
                        </h4>
                        {selectedArtwork.notifiedSubscribersAt ? (
                          <span className="text-[9px] uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-lg border-none">
                            Sent {new Date(selectedArtwork.notifiedSubscribersAt).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-[9px] uppercase tracking-wider text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded-lg border-none animate-pulse">
                            New / Unnotified
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate">
                        {selectedArtwork.medium} • {selectedArtwork.year}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400">
                        <span>{selectedArtwork.widthCm} × {selectedArtwork.heightCm} cm</span>
                        {selectedArtwork.price && (
                          <span className="text-[#d1a86e] font-semibold">
                            ${Number(selectedArtwork.price).toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Scheduling Controls */}
                <div className="p-4 bg-[#1a1b26] rounded-2xl space-y-3 shadow-md border-none">
                  <span className="text-[10px] uppercase tracking-wider text-zinc-400 font-semibold block">
                    Schedule &amp; Timing
                  </span>

                  <div className="flex items-center gap-4 text-xs">
                    <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                      <input
                        type="radio"
                        name="sendTiming"
                        checked={sendTiming === "now"}
                        onChange={() => setSendTiming("now")}
                        className="accent-[#d1a86e]"
                      />
                      <span>Send Immediately</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-zinc-300">
                      <input
                        type="radio"
                        name="sendTiming"
                        checked={sendTiming === "schedule"}
                        onChange={() => setSendTiming("schedule")}
                        className="accent-[#d1a86e]"
                      />
                      <span>Schedule for Later</span>
                    </label>
                  </div>

                  {sendTiming === "schedule" && (
                    <div className="grid grid-cols-2 gap-2 pt-2">
                      <div>
                        <label className="block text-[9px] uppercase text-zinc-500 mb-1">Date</label>
                        <input
                          type="date"
                          value={scheduledDate}
                          onChange={(e) => setScheduledDate(e.target.value)}
                          className="w-full bg-[#121319] rounded-xl px-3 py-2 text-xs text-white border-none focus:ring-1 focus:ring-[#d1a86e] focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase text-zinc-500 mb-1">Time</label>
                        <input
                          type="time"
                          value={scheduledTime}
                          onChange={(e) => setScheduledTime(e.target.value)}
                          className="w-full bg-[#121319] rounded-xl px-3 py-2 text-xs text-white border-none focus:ring-1 focus:ring-[#d1a86e] focus:outline-none"
                        />
                      </div>
                      <div className="col-span-2 pt-1 text-[10px] text-zinc-400 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-[#d1a86e]" />
                        <span>Timezone: {timezone}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Step 2: Recipient Selection */}
              <div className="lg:col-span-7 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <label className="text-[11px] uppercase tracking-wider text-zinc-400 font-semibold flex items-center gap-2">
                    <span>2. Select Interested Collectors</span>
                    <span className="text-[10px] text-[#d1a86e] bg-[#d1a86e]/10 px-2.5 py-1 rounded-lg font-mono font-bold border-none">
                      {selectedSubscriberEmails.length} of {subscribers.length} Selected
                    </span>
                  </label>

                  <div className="flex items-center gap-2">
                    {/* Search inside subscribers */}
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2 w-3 h-3 text-zinc-500" />
                      <input
                        type="text"
                        placeholder="Search collectors..."
                        value={subscriberSearchQuery}
                        onChange={(e) => setSubscriberSearchQuery(e.target.value)}
                        className="bg-[#1a1b26] rounded-xl pl-8 pr-3 py-1.5 text-[11px] text-white placeholder-zinc-500 border-none focus:ring-1 focus:ring-[#d1a86e] focus:outline-none w-36 sm:w-44"
                      />
                    </div>

                    {/* Master Select All Button */}
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={handleSelectAllToggle}
                      className="bg-[#1a1b26] hover:bg-[#222432] text-zinc-200 text-[11px] h-8 px-3 gap-1.5 cursor-pointer rounded-xl border-none"
                    >
                      {isAllSelected ? (
                        <>
                          <Square className="w-3 h-3 text-[#d1a86e]" />
                          <span>Deselect All</span>
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-3 h-3 text-[#d1a86e]" />
                          <span>Select All</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Subscribers List Scroll Area */}
                <div className="rounded-2xl bg-[#1a1b26] p-2 max-h-60 overflow-y-auto space-y-1 shadow-inner border-none">
                  {filteredSubscribers.length === 0 ? (
                    <div className="p-6 text-center text-xs text-zinc-500">
                      No matching collectors found in registry.
                    </div>
                  ) : (
                    filteredSubscribers.map((sub) => {
                      const isSelected = selectedSubscriberEmails.includes(sub.email);
                      return (
                        <div
                          key={sub.email}
                          onClick={() => handleToggleSubscriber(sub.email)}
                          className={`p-3 rounded-xl flex items-center justify-between gap-3 cursor-pointer transition-colors border-none ${
                            isSelected ? "bg-[#222432]" : "hover:bg-[#161720]"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* Checkbox */}
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => {}} // Handled by container onClick
                              className="w-4 h-4 accent-[#d1a86e] cursor-pointer rounded shrink-0 border-none"
                            />

                            {/* Avatar Monogram */}
                            <div className="w-7 h-7 rounded-full bg-[#121319] text-[#d1a86e] flex items-center justify-center text-[10px] font-bold shrink-0 shadow-sm">
                              {(sub.name || sub.email)[0].toUpperCase()}
                            </div>

                            <div className="min-w-0">
                              <span className="text-xs text-white font-medium block truncate">
                                {sub.name || "Private Collector"}
                              </span>
                              <span className="text-[11px] text-zinc-400 font-mono block truncate">
                                {sub.email}
                              </span>
                            </div>
                          </div>

                          <span
                            className={`text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-lg border-none ${
                              isSelected
                                ? "text-emerald-300 bg-emerald-950/80 font-semibold"
                                : "text-zinc-500 bg-[#121319]"
                            }`}
                          >
                            {isSelected ? "Selected" : "Excluded"}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Action Bar */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <span className="text-[11px] text-zinc-400">
                    Includes 1-click mobile WebAR placement and RFC 8058 unsubscribe header.
                  </span>

                  <Button
                    onClick={handleSendBroadcast}
                    disabled={isBroadcasting || selectedSubscriberEmails.length === 0 || !selectedArtworkId}
                    className="bg-[#d1a86e] hover:bg-[#c49a5f] text-black font-semibold text-xs gap-2 h-10 px-5 rounded-xl cursor-pointer shadow-lg shadow-black/40 disabled:opacity-50 border-none"
                  >
                    {isBroadcasting ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>Enqueueing to QStash...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>
                          {sendTiming === "schedule" ? "Schedule Campaign" : "Dispatch Now"} ({selectedSubscriberEmails.length})
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Email Telemetry Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
            <Card className="p-5 sm:p-6 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 space-y-1 border-none">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Total Attempts</span>
              <div className="font-serif text-2xl text-white">{sentEmails.length}</div>
              <span className="text-[11px] text-zinc-400">All marketing &amp; transactional dispatches</span>
            </Card>
            <Card className="p-5 sm:p-6 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 space-y-1 border-none">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Delivered to Inbox</span>
              <div className="font-serif text-2xl text-emerald-400">{countDelivered}</div>
              <span className="text-[11px] text-emerald-400/80 font-medium">Successfully accepted by Resend</span>
            </Card>
            <Card className="p-5 sm:p-6 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 space-y-1 border-none">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Active Campaigns</span>
              <div className="font-serif text-2xl text-amber-400">{campaigns.length}</div>
              <span className="text-[11px] text-amber-400/80 font-medium">Tracked in Neon database</span>
            </Card>
            <Card className="p-5 sm:p-6 bg-[#121319] rounded-3xl shadow-xl shadow-black/40 space-y-1 border-none">
              <span className="text-[10px] uppercase tracking-widest text-zinc-500 font-medium">Failed</span>
              <div className="font-serif text-2xl text-red-400">{countFailed}</div>
              <span className="text-[11px] text-red-400/80 font-medium">Permanent delivery errors</span>
            </Card>
          </div>

          {/* Search & Filter Controls - Compact Dropdown Bar */}
          <div className="p-3 sm:p-4 bg-[#121319] rounded-2xl shadow-xl shadow-black/40 border-none flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            {/* Search input */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500" />
              <input
                type="text"
                placeholder="Filter dispatches by recipient, subject, or ID..."
                value={emailSearchQuery}
                onChange={(e) => setEmailSearchQuery(e.target.value)}
                className="w-full bg-[#1a1b26] rounded-xl pl-9 pr-8 h-8 sm:h-9 text-xs text-white placeholder-zinc-500 border-none focus:ring-1 focus:ring-[#d1a86e] focus:outline-none"
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

            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0 flex-wrap">
              {/* Delivery Status Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 h-8 sm:h-9 px-3 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-xs font-medium text-zinc-200 border border-white/5 transition-colors cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5 text-[#d1a86e]" />
                    <span>
                      Delivery:{" "}
                      <strong className="font-semibold text-white capitalize">
                        {selectedDeliveryStatus === "all"
                          ? "All"
                          : selectedDeliveryStatus === "delivered"
                          ? "Delivered"
                          : selectedDeliveryStatus === "sandbox_restricted"
                          ? "Sandbox Held"
                          : "Failed"}
                      </strong>
                    </span>
                    <ChevronDown className="w-3 h-3 text-zinc-400 ml-0.5" />
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

              {/* Email Type Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 h-8 sm:h-9 px-3 rounded-xl bg-[#1a1b26] hover:bg-[#222432] text-xs font-medium text-zinc-200 border border-white/5 transition-colors cursor-pointer"
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

          {/* Sent Emails List */}
          <div className="space-y-3">
            {filteredEmails.length === 0 ? (
              <div className="p-12 text-center bg-[#121319] rounded-3xl text-xs text-zinc-500 shadow-md">
                No email dispatch records matching your criteria.
              </div>
            ) : (
              paginatedEmails.map((email) => (
                <Card
                  key={email.id}
                  className="p-5 sm:p-6 bg-[#1a1b26] rounded-2xl space-y-3 shadow-md border-none"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Status Badge */}
                      {email.status === "delivered" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border-none">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Delivered to Inbox</span>
                        </span>
                      )}
                      {email.status === "sandbox_restricted" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border-none">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Sandbox Held</span>
                        </span>
                      )}
                      {email.status === "failed" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-red-950/80 text-red-300 border-none">
                          <AlertCircle className="w-3 h-3" />
                          <span>Failed</span>
                        </span>
                      )}
                      {email.status === "simulated" && (
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-950/80 text-blue-300 border-none">
                          <span>Simulated</span>
                        </span>
                      )}

                      <span className="text-[11px] text-zinc-400 uppercase tracking-wider bg-[#121319] px-2.5 py-1 rounded-lg border-none">
                        {email.emailType.replace(/_/g, " ")}
                      </span>
                    </div>

                    <span className="text-[11px] text-zinc-500 font-mono">
                      {new Date(email.createdAt).toLocaleString()}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white">
                        {email.subject}
                      </div>
                      <div className="text-xs text-zinc-400 flex flex-wrap items-center gap-2">
                        <span>Recipient:</span>
                        <strong className="text-zinc-200 font-mono bg-[#121319] px-2 py-0.5 rounded-lg border-none">
                          {email.recipientEmail}
                        </strong>
                        {email.recipientName && (
                          <span className="text-zinc-500">({email.recipientName})</span>
                        )}
                      </div>
                    </div>

                    {email.htmlContent && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setPreviewEmail(email)}
                        className="bg-[#121319] hover:bg-[#222432] text-zinc-200 text-xs gap-1.5 shrink-0 cursor-pointer rounded-xl border-none"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#d1a86e]" />
                        <span>Preview HTML</span>
                      </Button>
                    )}
                  </div>

                  {/* Diagnostic details if held or failed */}
                  {email.errorMessage && (
                    <div className="p-3.5 bg-amber-950/30 rounded-xl text-xs text-amber-300/90 leading-relaxed font-mono border-none">
                      {email.errorMessage}
                    </div>
                  )}

                  {email.resendId && (
                    <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5 pt-1">
                      <span>Resend API Message ID:</span>
                      <span className="text-zinc-400 bg-[#121319] px-2 py-0.5 rounded-lg border-none">
                        {email.resendId}
                      </span>
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>

          {/* Sent Emails Pagination and Per-Page Control Bar - Transparent */}
          {filteredEmails.length > 0 && (
            <div className="p-3 sm:p-4 bg-transparent rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-zinc-400 font-mono">
                Showing <span className="text-white font-semibold">{emailStartItem}–{emailEndItem}</span> of{" "}
                <span className="text-[#d1a86e] font-semibold">{filteredEmails.length}</span> dispatches
              </div>

              <div>
                <Pagination>
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

              <div className="flex items-center gap-2">
                <span className="text-zinc-500 font-mono text-[11px] uppercase tracking-wider">Per Page:</span>
                <div className="flex items-center rounded-xl bg-transparent border border-white/10 p-0.5">
                  {PAGE_SIZE_OPTIONS.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => setEmailPageSize(size)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer border-none ${
                        emailPageSize === size
                          ? "bg-[#d1a86e] text-black font-semibold shadow-sm"
                          : "text-zinc-400 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
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
