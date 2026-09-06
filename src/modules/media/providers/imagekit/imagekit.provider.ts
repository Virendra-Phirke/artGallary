import ImageKit from "imagekit";
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { getMediaConfig } from "../../media.config";
import {
  MediaProvider,
  MediaProviderName,
  MediaUploadInput,
  MediaAsset,
  MediaTransform,
  MediaUploadTarget,
  MediaMetadata,
} from "../../media.types";
import {
  MediaUploadError,
  MediaDeleteError,
  MediaValidationError,
  MediaProviderError,
} from "../../media.errors";

export class ImageKitProvider implements MediaProvider {
  public readonly name: MediaProviderName = "imagekit";
  private ikClient: ImageKit | null = null;

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    const config = getMediaConfig();
    if (config.imagekit.isConfigured) {
      this.ikClient = new ImageKit({
        publicKey: config.imagekit.publicKey,
        privateKey: config.imagekit.privateKey,
        urlEndpoint: config.imagekit.urlEndpoint,
      });
    }
  }

  public isAvailable(): boolean {
    const config = getMediaConfig();
    return config.isImageKitEnabled;
  }

  public async upload(input: MediaUploadInput): Promise<MediaAsset> {
    try {
      const config = getMediaConfig();

      // Validate image with Sharp
      const image = sharp(input.buffer);
      const metadata = await image.metadata();

      if (!metadata.width || !metadata.height || !metadata.format) {
        throw new MediaValidationError("Invalid or unreadable image file binary");
      }

      const allowedFormats = ["jpeg", "png", "webp", "avif", "tiff"];
      if (!allowedFormats.includes(metadata.format.toLowerCase())) {
        throw new MediaValidationError(
          `Unsupported image format: ${metadata.format}. Supported: JPEG, PNG, WebP, AVIF.`
        );
      }

      const timestamp = Date.now();
      const safeBaseName = input.filename
        .replace(/\.[^/.]+$/, "")
        .replace(/[^a-zA-Z0-9-_]/g, "-")
        .toLowerCase();
      const uploadFileName = `${timestamp}-${safeBaseName}.${metadata.format}`;
      const folderPath = `/artworks/${input.role || "artwork"}`;

      // Generate blur placeholder (16px)
      const blurBuffer = await sharp(input.buffer)
        .resize(16, 16, { fit: "inside" })
        .webp({ quality: 20 })
        .toBuffer();
      const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

      let fileId: string;
      let primaryUrl: string;
      let thumbnailUrl: string;
      let filePath: string;

      if (config.imagekit.isConfigured && this.ikClient) {
        const response = await this.ikClient.upload({
          file: input.buffer.toString("base64"),
          fileName: uploadFileName,
          folder: folderPath,
          useUniqueFileName: true,
          tags: ["artwork", input.role || "gallery", "production"],
        });

        fileId = response.fileId;
        primaryUrl = response.url;
        thumbnailUrl = response.thumbnailUrl || response.url;
        filePath = response.filePath;
      } else {
        // Local simulation / fallback when keys are not set in development
        const uploadsDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          "ik",
          String(timestamp)
        );
        fs.mkdirSync(uploadsDir, { recursive: true });

        const localFile = `${uploadFileName}`;
        fs.writeFileSync(path.join(uploadsDir, localFile), input.buffer);

        fileId = `ik-sim-${timestamp}-${safeBaseName}`;
        filePath = `/uploads/ik/${timestamp}/${localFile}`;
        primaryUrl = filePath;
        thumbnailUrl = filePath;
      }

      const aspectRatio = Number((metadata.width / metadata.height).toFixed(4));

      return {
        id: fileId,
        provider: "imagekit",
        providerAssetId: fileId,
        objectKey: filePath,
        filename: input.filename,
        mimeType: `image/${metadata.format}`,
        size: input.buffer.length,
        width: metadata.width,
        height: metadata.height,
        aspectRatio,
        blurDataUrl,
        variants: {
          original: primaryUrl,
          optimized: this.getUrl({ providerAssetId: fileId, objectKey: filePath, fileUrl: primaryUrl }, {
            width: 2400,
            quality: 85,
            format: "webp",
          }),
          thumbnail: this.getUrl({ providerAssetId: fileId, objectKey: filePath, fileUrl: primaryUrl }, {
            width: 600,
            quality: 80,
            format: "webp",
          }),
        },
        migrationStatus: "verified",
        createdAt: new Date().toISOString(),
      };
    } catch (err: any) {
      if (err instanceof MediaValidationError) throw err;
      console.error("[ImageKitProvider] upload error:", err);
      throw new MediaUploadError(
        `ImageKit upload failed: ${err?.message || "Unknown error"}`
      );
    }
  }

  public async delete(providerAssetId: string, objectKey?: string): Promise<void> {
    try {
      const config = getMediaConfig();
      if (config.imagekit.isConfigured && this.ikClient) {
        await this.ikClient.deleteFile(providerAssetId);
      }
    } catch (err: any) {
      console.error("[ImageKitProvider] delete error:", err);
      throw new MediaDeleteError(
        `ImageKit deletion failed: ${err?.message || "Unknown error"}`
      );
    }
  }

  public getUrl(
    asset: { providerAssetId?: string; objectKey?: string; fileUrl?: string },
    transform?: MediaTransform
  ): string {
    const config = getMediaConfig();
    const endpoint = config.imagekit.urlEndpoint;

    // If client SDK is configured, use it to construct transformation URL
    if (this.ikClient && (asset.objectKey || asset.providerAssetId)) {
      const transformationList: Record<string, string | number>[] = [];

      if (transform) {
        const tr: Record<string, string | number> = {};
        if (transform.width) tr.width = transform.width;
        if (transform.height) tr.height = transform.height;
        if (transform.quality) tr.quality = transform.quality;
        if (transform.format && transform.format !== "auto") tr.format = transform.format;
        if (transform.blur) tr.blur = transform.blur;
        if (transform.fit === "cover") tr.cropMode = "maintain_ratio";
        if (Object.keys(tr).length > 0) {
          transformationList.push(tr);
        }
      }

      try {
        const generated = this.ikClient.url({
          path: asset.objectKey?.startsWith("/") ? asset.objectKey : `/${asset.objectKey || ""}`,
          urlEndpoint: endpoint,
          transformation: transformationList.length > 0 ? (transformationList as any) : undefined,
        });
        return generated;
      } catch (e) {
        // fallback to manual transformation formatting
      }
    }

    // Manual / URL parameter transformation fallback
    const basePath = asset.fileUrl || (asset.objectKey ? `${endpoint}/${asset.objectKey.replace(/^\//, "")}` : "/placeholder-artwork.jpg");
    
    // If local path or external non-imagekit url, return as is
    if (basePath.startsWith("/uploads/") || (!basePath.includes("imagekit.io") && !basePath.includes("ik.imagekit.io"))) {
      return basePath;
    }

    if (!transform) return basePath;

    // Build ImageKit transform query / path: tr=w-1200,q-80,f-webp
    const parts: string[] = [];
    if (transform.width) parts.push(`w-${transform.width}`);
    if (transform.height) parts.push(`h-${transform.height}`);
    if (transform.quality) parts.push(`q-${transform.quality}`);
    if (transform.format && transform.format !== "auto") parts.push(`f-${transform.format}`);
    if (transform.blur) parts.push(`bl-${transform.blur}`);
    if (transform.fit === "cover") parts.push("c-maintain_ratio");

    if (parts.length === 0) return basePath;

    const trQuery = `tr=${parts.join(",")}`;
    const separator = basePath.includes("?") ? "&" : "?";
    return `${basePath}${separator}${trQuery}`;
  }

  public async getUploadTarget(
    filename: string,
    mimeType: string
  ): Promise<MediaUploadTarget> {
    const config = getMediaConfig();
    if (config.imagekit.isConfigured && this.ikClient) {
      const authParams = this.ikClient.getAuthenticationParameters();
      return {
        provider: "imagekit",
        endpoint: "https://upload.imagekit.io/api/v1/files/upload",
        token: authParams.token,
        signature: authParams.signature,
        expire: authParams.expire,
        fields: {
          publicKey: config.imagekit.publicKey,
          fileName: filename,
        },
      };
    }

    return {
      provider: "imagekit",
      endpoint: "/api/upload",
      fields: {
        filename,
        mimeType,
      },
    };
  }

  public async getMetadata(
    providerAssetId: string,
    objectKey?: string
  ): Promise<MediaMetadata> {
    const config = getMediaConfig();
    if (config.imagekit.isConfigured && this.ikClient) {
      try {
        const details = await this.ikClient.getFileDetails(providerAssetId);
        return {
          width: details.width,
          height: details.height,
          size: details.size,
          format: details.fileType,
        };
      } catch (err) {
        console.warn("[ImageKitProvider] getFileDetails failed:", err);
      }
    }
    return {};
  }

  public async exists(
    providerAssetId: string,
    objectKey?: string
  ): Promise<boolean> {
    const config = getMediaConfig();
    if (config.imagekit.isConfigured && this.ikClient) {
      try {
        const details = await this.ikClient.getFileDetails(providerAssetId);
        return Boolean(details && details.fileId);
      } catch {
        return false;
      }
    }
    return true; // Fallback
  }
}
