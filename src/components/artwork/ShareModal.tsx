"use client";

import React, { useState } from "react";
import { X, Copy, Check, Share2 } from "lucide-react";

interface ShareModalProps {
  title: string;
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareModal({ title, url, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {}
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`Discover "${title}" by Vishal Patil at Seclusion Art Gallary`);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md bg-[#14151a] border border-[#262833] rounded-lg shadow-2xl p-6">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <Share2 className="w-5 h-5 text-[#d1a86e]" />
          <h3 className="font-serif text-lg text-white">Share Artwork</h3>
        </div>

        <p className="text-xs text-zinc-400 mb-5">
          Share <strong className="text-white font-medium">&ldquo;{title}&rdquo;</strong> with colleagues, interior designers, or collectors.
        </p>

        {/* Copy Link Input */}
        <div className="flex items-center gap-2 bg-[#1a1c23] border border-[#262833] rounded p-1.5 mb-6">
          <input
            type="text"
            readOnly
            value={url}
            className="w-full bg-transparent text-xs text-zinc-300 px-2 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-[#262833] hover:bg-[#323544] text-white px-3 py-1.5 rounded text-xs transition-colors shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#1a1c23] hover:bg-[#22242e] border border-[#262833] py-2.5 rounded text-xs text-zinc-300 hover:text-white transition-colors"
          >
            Share on X / Twitter
          </a>
          <a
            href={`https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 bg-[#1a1c23] hover:bg-[#22242e] border border-[#262833] py-2.5 rounded text-xs text-zinc-300 hover:text-white transition-colors"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
}
