import { getMediaConfig } from "./media.config";
import {
  MediaError,
  MediaValidationError,
  MediaNotFoundError,
  MediaUploadError,
  MediaDeleteError,
} from "./media.errors";
import { providerResolver } from "./media.resolver";
import {
  MediaAsset,
  MediaProvider,
  MediaProviderName,
  MediaTransform,
  MediaUploadInput,
  MediaUploadTarget,
  MediaMetadata,
} from "./media.types";

export class MediaService {
  private static instance: MediaService;

  public static getInstance(): MediaService {
    if (!MediaService.instance) {
      MediaService.instance = new MediaService();
    }
    return MediaService.instance;
  }

  /**
   * Upload an artwork media asset.
   * By default, uploads to the active provider (MEDIA_PROVIDER=imagekit/cloudflare).
   * A provider override can be passed (e.g. for testing or explicit provider targeting).
   */
  public async upload(
    input: MediaUploadInput,
    providerOverride?: MediaProviderName
  ): Promise<MediaAsset> {
    if (!input.buffer || input.buffer.length === 0) {
      throw new MediaValidationError("Upload rejected: Empty file buffer.");
    }

    const MAX_BYTES = 30 * 1024 * 1024; // 30MB
    if (input.buffer.length > MAX_BYTES) {
      throw new MediaValidationError(
        `Upload rejected: File size (${(input.buffer.length / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 30MB.`
      );
    }

    const provider = providerOverride
      ? providerResolver.resolveProvider(providerOverride)
      : providerResolver.resolveActiveProvider();

    try {
      const asset = await provider.upload(input);
      return asset;
    } catch (err: any) {
      if (err instanceof MediaError) throw err;
      throw new MediaUploadError(`Media upload failed via provider '${provider.name}': ${err.message}`);
    }
  }

  /**
   * Delete an asset from its authoritative storage provider.
   */
  public async delete(
    providerAssetId: string,
    providerName: MediaProviderName,
    objectKey?: string
  ): Promise<void> {
    const provider = providerResolver.resolveProvider(providerName);
    try {
      await provider.delete(providerAssetId, objectKey);
    } catch (err: any) {
      if (err instanceof MediaError) throw err;
      throw new MediaDeleteError(
        `Failed to delete media asset '${providerAssetId}' from '${providerName}': ${err.message}`
      );
    }
  }

  /**
   * Resolve transformed or canonical media URL.
   * Handles hybrid assets gracefully by using the asset's stored provider.
   */
  public getUrl(
    asset: {
      provider?: MediaProviderName;
      providerAssetId?: string;
      objectKey?: string;
      fileUrl?: string;
    },
    transform?: MediaTransform
  ): string {
    // 1. If direct absolute or data URL without objectKey, return as is
    if (asset.fileUrl && (asset.fileUrl.startsWith("data:") || asset.fileUrl.startsWith("blob:"))) {
      return asset.fileUrl;
    }

    // 2. Identify target provider
    let providerName = asset.provider;

    if (!providerName) {
      if (asset.fileUrl?.includes("ik.imagekit.io") || asset.fileUrl?.includes("imagekit.io")) {
        providerName = "imagekit";
      } else if (asset.fileUrl?.includes("r2.dev") || asset.fileUrl?.includes("r2.cloudflarestorage.com")) {
        providerName = "cloudflare";
      } else {
        const config = getMediaConfig();
        providerName = config.activeProvider;
      }
    }

    try {
      const provider = providerResolver.resolveProvider(providerName);
      return provider.getUrl(asset, transform);
    } catch {
      // If provider disabled or resolution failed, fall back to fileUrl or placeholder
      return asset.fileUrl || "/placeholder-artwork.jpg";
    }
  }

  /**
   * Get direct client upload target credentials (signed token/endpoint).
   */
  public async getUploadTarget(
    filename: string,
    mimeType: string,
    providerOverride?: MediaProviderName
  ): Promise<MediaUploadTarget> {
    const provider = providerOverride
      ? providerResolver.resolveProvider(providerOverride)
      : providerResolver.resolveActiveProvider();

    return provider.getUploadTarget(filename, mimeType);
  }

  /**
   * Check if asset exists on its provider.
   */
  public async exists(
    providerAssetId: string,
    providerName: MediaProviderName,
    objectKey?: string
  ): Promise<boolean> {
    try {
      const provider = providerResolver.resolveProvider(providerName);
      return await provider.exists(providerAssetId, objectKey);
    } catch {
      return false;
    }
  }

  /**
   * Storage infrastructure health check.
   */
  public async getHealth(): Promise<{
    status: "healthy" | "degraded" | "error";
    activeProvider: MediaProviderName;
    availableProviders: MediaProviderName[];
    providers: {
      imagekit: {
        enabled: boolean;
        configured: boolean;
        urlEndpoint: string;
      };
      cloudflare: {
        enabled: boolean;
        configured: boolean;
        bucketName: string;
      };
    };
    timestamp: string;
  }> {
    const config = getMediaConfig();
    const available = providerResolver.getAvailableProviders();

    return {
      status: available.length > 0 ? "healthy" : "error",
      activeProvider: config.activeProvider,
      availableProviders: available,
      providers: {
        imagekit: {
          enabled: config.isImageKitEnabled,
          configured: config.imagekit.isConfigured,
          urlEndpoint: config.imagekit.urlEndpoint,
        },
        cloudflare: {
          enabled: config.isCloudflareEnabled,
          configured: config.cloudflare.isConfigured,
          bucketName: config.cloudflare.bucketName,
        },
      },
      timestamp: new Date().toISOString(),
    };
  }
}

export const mediaService = MediaService.getInstance();
