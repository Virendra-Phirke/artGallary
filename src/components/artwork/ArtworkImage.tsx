"use client";

import React, { useState } from "react";
import Image from "next/image";

export interface ArtworkImageProps {
  src?: string;
  mediaId?: string;
  provider?: "imagekit" | "cloudflare";
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  className?: string;
  sizes?: string;
  quality?: number;
  blurDataURL?: string;
  aspectRatio?: number;
  objectFit?: "cover" | "contain";
}

/**
 * Format an image URL with provider-independent transformations.
 * If the URL is hosted on ImageKit, formats dynamic parameters.
 */
function resolveTransformUrl(
  url: string,
  options?: { width?: number; quality?: number; format?: string }
): string {
  if (!url) return "/placeholder-artwork.jpg";
  if (!options) return url;

  // If ImageKit URL, apply query parameters
  if (url.includes("ik.imagekit.io") || url.includes("imagekit.io")) {
    const trParts: string[] = [];
    if (options.width) trParts.push(`w-${options.width}`);
    if (options.quality) trParts.push(`q-${options.quality}`);
    if (options.format) trParts.push(`f-${options.format}`);

    if (trParts.length > 0) {
      const separator = url.includes("?") ? "&" : "?";
      return `${url}${separator}tr=${trParts.join(",")}`;
    }
  }

  // If Cloudflare or standard URL, return original or append query if supported
  return url;
}

export function ArtworkImage({
  src,
  mediaId,
  provider,
  alt,
  width,
  height,
  fill = false,
  priority = false,
  className = "",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  quality = 85,
  blurDataURL,
  aspectRatio,
  objectFit = "cover",
}: ArtworkImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const initialUrl = src || (mediaId ? `/api/media/${mediaId}` : "/placeholder-artwork.jpg");
  const optimizedSrc = resolveTransformUrl(initialUrl, {
    width: width || (fill ? 1600 : undefined),
    quality,
  });

  if (hasError) {
    return (
      <div
        className={`bg-zinc-900/80 border border-white/5 flex flex-col items-center justify-center p-4 text-center ${className}`}
        style={aspectRatio ? { aspectRatio: String(aspectRatio) } : undefined}
      >
        <span className="text-zinc-600 text-xs tracking-wider uppercase">Art Preview</span>
        <span className="text-zinc-400 text-xs mt-1 italic line-clamp-1">{alt}</span>
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden ${fill ? "w-full h-full" : ""} ${className}`}
      style={aspectRatio && !fill ? { aspectRatio: String(aspectRatio) } : undefined}
    >
      <Image
        src={optimizedSrc}
        alt={alt}
        width={fill ? undefined : width || 800}
        height={fill ? undefined : height || 600}
        fill={fill}
        priority={priority}
        sizes={sizes}
        quality={quality}
        placeholder={blurDataURL ? "blur" : "empty"}
        blurDataURL={blurDataURL}
        className={`transition-opacity duration-700 ${
          isLoading ? "opacity-0" : "opacity-100"
        } ${objectFit === "contain" ? "object-contain" : "object-cover"}`}
        onLoad={() => setIsLoading(false)}
        onError={() => setHasError(true)}
      />
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-900/40 animate-pulse" />
      )}
    </div>
  );
}
