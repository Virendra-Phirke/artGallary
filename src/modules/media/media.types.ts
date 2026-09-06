export type MediaProviderName = "imagekit" | "cloudflare";

export type MediaMigrationStatus = "pending" | "migrating" | "verified" | "failed";

export type MediaRole = "cover" | "gallery" | "detail" | "thumbnail" | "ar";

export interface MediaTransform {
  width?: number;
  height?: number;
  quality?: number;
  format?: "auto" | "webp" | "avif" | "jpeg" | "png";
  fit?: "cover" | "contain" | "inside" | "outside";
  blur?: number;
}

export interface MediaAsset {
  id: string;
  provider: MediaProviderName;
  providerAssetId: string;
  objectKey?: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  aspectRatio?: number;
  checksum?: string;
  blurDataUrl?: string;
  variants?: {
    original: string;
    optimized: string;
    thumbnail: string;
    arTexture?: string;
  };
  migrationStatus?: MediaMigrationStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface MediaUploadInput {
  buffer: Buffer;
  filename: string;
  mimeType: string;
  artworkId?: string;
  role?: MediaRole;
}

export interface MediaUploadTarget {
  provider: MediaProviderName;
  endpoint: string;
  token?: string;
  signature?: string;
  expire?: number;
  fields?: Record<string, string>;
}

export interface MediaMetadata {
  width?: number;
  height?: number;
  size?: number;
  mimeType?: string;
  checksum?: string;
  format?: string;
}

export interface MediaProvider {
  readonly name: MediaProviderName;
  isAvailable(): boolean;
  upload(input: MediaUploadInput): Promise<MediaAsset>;
  delete(providerAssetId: string, objectKey?: string): Promise<void>;
  getUrl(
    asset: { providerAssetId?: string; objectKey?: string; fileUrl?: string },
    transform?: MediaTransform
  ): string;
  getUploadTarget(filename: string, mimeType: string): Promise<MediaUploadTarget>;
  getMetadata(providerAssetId: string, objectKey?: string): Promise<MediaMetadata>;
  exists(providerAssetId: string, objectKey?: string): Promise<boolean>;
}
