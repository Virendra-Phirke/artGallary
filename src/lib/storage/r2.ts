import { mediaService } from "@/modules/media";

export interface ProcessedMedia {
  fileKey: string;
  fileUrl: string;
  mimeType: string;
  byteSize: number;
  width: number;
  height: number;
  aspectRatio: number;
  blurDataUrl: string;
  variants: {
    original: string;
    optimized: string;
    thumbnail: string;
  };
}

/**
 * Backward-compatible adapter for legacy callers of processAndUploadImage.
 * Routes directly through CloudflareR2Provider via MediaService.
 */
export async function processAndUploadImage(
  buffer: Buffer,
  originalFilename: string
): Promise<ProcessedMedia> {
  const asset = await mediaService.upload(
    {
      buffer,
      filename: originalFilename,
      mimeType: "image/webp",
      role: "gallery",
    },
    "cloudflare"
  );

  return {
    fileKey: asset.objectKey || asset.id,
    fileUrl: asset.variants?.optimized || asset.variants?.original || "/placeholder-artwork.jpg",
    mimeType: asset.mimeType,
    byteSize: asset.size,
    width: asset.width || 2400,
    height: asset.height || 1800,
    aspectRatio: asset.aspectRatio || 1.33,
    blurDataUrl: asset.blurDataUrl || "",
    variants: {
      original: asset.variants?.original || "",
      optimized: asset.variants?.optimized || "",
      thumbnail: asset.variants?.thumbnail || "",
    },
  };
}
