"use client";

import React, { useState } from "react";
import Image, { ImageProps } from "next/image";
import { cn } from "@/lib/utils";
import { ImageIcon } from "lucide-react";

export interface ProgressiveImageProps
  extends Omit<ImageProps, "onLoad" | "onError"> {
  containerClassName?: string;
  skeletonClassName?: string;
  optimizeWidth?: number;
  optimizeQuality?: number;
}

/**
 * Appends dynamic CDN width and quality parameters for ImageKit & Unsplash.
 * Dramatically reduces payload sizes from master uncompressed images (~5MB) to lightweight WebP (~80KB).
 */
export function getOptimizedImageUrl(
  url: string | any,
  width?: number,
  quality: number = 80
): string {
  if (!url || typeof url !== "string" || !url.startsWith("http")) {
    return typeof url === "string" ? url : "";
  }

  try {
    // ImageKit CDN
    if (url.includes("ik.imagekit.io")) {
      const cleanUrl = url.split("?")[0];
      const transforms: string[] = [];
      if (width) transforms.push(`w-${width}`);
      transforms.push(`q-${quality}`);
      transforms.push("f-auto");
      return `${cleanUrl}?tr=${transforms.join(",")}`;
    }

    // Unsplash CDN
    if (url.includes("images.unsplash.com") || url.includes("plus.unsplash.com")) {
      const cleanUrl = url.split("?")[0];
      return `${cleanUrl}?auto=format&fit=crop&w=${width || 1200}&q=${quality}`;
    }
  } catch {
    return url;
  }

  return url;
}

export function ProgressiveImage({
  src,
  alt,
  className,
  containerClassName,
  skeletonClassName,
  optimizeWidth,
  optimizeQuality = 80,
  fill,
  priority,
  ...props
}: ProgressiveImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  const finalSrc = typeof src === "string"
    ? getOptimizedImageUrl(src, optimizeWidth, optimizeQuality)
    : src;

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        fill ? "w-full h-full" : "",
        containerClassName
      )}
    >
      {/* Shimmer skeleton overlay while downloading & decoding */}
      {!isLoaded && !hasError && (
        <div
          className={cn(
            "absolute inset-0 z-0 bg-[#16171d] animate-pulse flex items-center justify-center",
            skeletonClassName
          )}
        >
          <div className="w-full h-full bg-gradient-to-r from-transparent via-[#262833]/40 to-transparent -translate-x-full animate-[shimmer_1.8s_infinite]" />
        </div>
      )}

      {/* Error Fallback */}
      {hasError ? (
        <div className="absolute inset-0 bg-[#14151a] flex flex-col items-center justify-center text-zinc-600 p-4 text-center">
          <ImageIcon className="w-6 h-6 mb-1 text-zinc-700" />
          <span className="text-[10px] tracking-widest uppercase font-mono">
            Preview Unavailable
          </span>
        </div>
      ) : (
        <Image
          src={finalSrc}
          alt={alt || "Artwork Image"}
          fill={fill}
          priority={priority}
          className={cn(
            "transition-opacity duration-500 ease-out",
            isLoaded ? "opacity-100" : "opacity-0",
            className
          )}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          {...props}
        />
      )}
    </div>
  );
}
