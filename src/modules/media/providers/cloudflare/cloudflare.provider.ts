import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";
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

export class CloudflareR2Provider implements MediaProvider {
  public readonly name: MediaProviderName = "cloudflare";
  private s3Client: S3Client | null = null;

  constructor() {
    this.initClient();
  }

  private initClient(): void {
    const config = getMediaConfig();
    if (config.cloudflare.isConfigured) {
      this.s3Client = new S3Client({
        region: "auto",
        endpoint: `https://${config.cloudflare.accountId}.r2.cloudflarestorage.com`,
        credentials: {
          accessKeyId: config.cloudflare.accessKeyId,
          secretAccessKey: config.cloudflare.secretAccessKey,
        },
      });
    }
  }

  public isAvailable(): boolean {
    const config = getMediaConfig();
    return config.isCloudflareEnabled;
  }

  public async upload(input: MediaUploadInput): Promise<MediaAsset> {
    try {
      const config = getMediaConfig();
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

      const rolePrefix = input.role || "artwork";
      const originalKey = `artworks/${rolePrefix}/${timestamp}-${safeBaseName}-original.${metadata.format}`;
      const optimizedKey = `artworks/${rolePrefix}/${timestamp}-${safeBaseName}-optimized.webp`;
      const thumbnailKey = `artworks/${rolePrefix}/${timestamp}-${safeBaseName}-thumb.webp`;

      // 1. Generate Sharp optimized WebP (max 2400px)
      const optimizedBuffer = await sharp(input.buffer)
        .resize({ width: 2400, height: 2400, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 85, effort: 4 })
        .toBuffer();

      // 2. Generate thumbnail WebP (max 600px)
      const thumbnailBuffer = await sharp(input.buffer)
        .resize({ width: 600, height: 600, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();

      // 3. Generate tiny blur placeholder (16px base64)
      const blurBuffer = await sharp(input.buffer)
        .resize(16, 16, { fit: "inside" })
        .webp({ quality: 20 })
        .toBuffer();
      const blurDataUrl = `data:image/webp;base64,${blurBuffer.toString("base64")}`;

      let originalUrl: string;
      let optimizedUrl: string;
      let thumbnailUrl: string;

      // 4. Upload to Cloudflare R2 if configured, else store in public/uploads for local development
      if (config.cloudflare.isConfigured && this.s3Client) {
        await Promise.all([
          this.s3Client.send(
            new PutObjectCommand({
              Bucket: config.cloudflare.bucketName,
              Key: originalKey,
              Body: input.buffer,
              ContentType: `image/${metadata.format}`,
            })
          ),
          this.s3Client.send(
            new PutObjectCommand({
              Bucket: config.cloudflare.bucketName,
              Key: optimizedKey,
              Body: optimizedBuffer,
              ContentType: "image/webp",
            })
          ),
          this.s3Client.send(
            new PutObjectCommand({
              Bucket: config.cloudflare.bucketName,
              Key: thumbnailKey,
              Body: thumbnailBuffer,
              ContentType: "image/webp",
            })
          ),
        ]);

        const cdnBase =
          config.cloudflare.publicUrl ||
          `https://${config.cloudflare.bucketName}.r2.dev`;
        originalUrl = `${cdnBase}/${originalKey}`;
        optimizedUrl = `${cdnBase}/${optimizedKey}`;
        thumbnailUrl = `${cdnBase}/${thumbnailKey}`;
      } else {
        // Local fallback storage in public/uploads/
        const uploadsDir = path.join(
          process.cwd(),
          "public",
          "uploads",
          String(timestamp)
        );
        fs.mkdirSync(uploadsDir, { recursive: true });

        const originalFile = `${safeBaseName}-original.${metadata.format}`;
        const optimizedFile = `${safeBaseName}-optimized.webp`;
        const thumbFile = `${safeBaseName}-thumb.webp`;

        fs.writeFileSync(path.join(uploadsDir, originalFile), input.buffer);
        fs.writeFileSync(path.join(uploadsDir, optimizedFile), optimizedBuffer);
        fs.writeFileSync(path.join(uploadsDir, thumbFile), thumbnailBuffer);

        originalUrl = `/uploads/${timestamp}/${originalFile}`;
        optimizedUrl = `/uploads/${timestamp}/${optimizedFile}`;
        thumbnailUrl = `/uploads/${timestamp}/${thumbFile}`;
      }

      const aspectRatio = Number((metadata.width / metadata.height).toFixed(4));
      const assetId = `r2-${timestamp}-${safeBaseName}`;

      return {
        id: assetId,
        provider: "cloudflare",
        providerAssetId: assetId,
        objectKey: optimizedKey,
        filename: input.filename,
        mimeType: "image/webp",
        size: optimizedBuffer.length,
        width: metadata.width,
        height: metadata.height,
        aspectRatio,
        blurDataUrl,
        variants: {
          original: originalUrl,
          optimized: optimizedUrl,
          thumbnail: thumbnailUrl,
        },
        migrationStatus: "verified",
        createdAt: new Date().toISOString(),
      };
    } catch (err: any) {
      if (err instanceof MediaValidationError) throw err;
      console.error("[CloudflareR2Provider] upload error:", err);
      throw new MediaUploadError(
        `Cloudflare R2 upload failed: ${err?.message || "Unknown error"}`
      );
    }
  }

  public async delete(providerAssetId: string, objectKey?: string): Promise<void> {
    try {
      const config = getMediaConfig();
      if (config.cloudflare.isConfigured && this.s3Client && objectKey) {
        await this.s3Client.send(
          new DeleteObjectCommand({
            Bucket: config.cloudflare.bucketName,
            Key: objectKey,
          })
        );
      }
    } catch (err: any) {
      console.error("[CloudflareR2Provider] delete error:", err);
      throw new MediaDeleteError(
        `Cloudflare R2 deletion failed: ${err?.message || "Unknown error"}`
      );
    }
  }

  public getUrl(
    asset: { providerAssetId?: string; objectKey?: string; fileUrl?: string },
    transform?: MediaTransform
  ): string {
    const config = getMediaConfig();
    const cdnBase =
      config.cloudflare.publicUrl ||
      (config.cloudflare.bucketName ? `https://${config.cloudflare.bucketName}.r2.dev` : "");

    // If asset has direct fileUrl, check if it's already an absolute or local URL
    if (asset.fileUrl) {
      if (asset.fileUrl.startsWith("http://") || asset.fileUrl.startsWith("https://") || asset.fileUrl.startsWith("/")) {
        return asset.fileUrl;
      }
      return `${cdnBase}/${asset.fileUrl.replace(/^\//, "")}`;
    }

    if (asset.objectKey) {
      if (cdnBase) {
        return `${cdnBase}/${asset.objectKey.replace(/^\//, "")}`;
      }
      return `/${asset.objectKey.replace(/^\//, "")}`;
    }

    return "/placeholder-artwork.jpg";
  }

  public async getUploadTarget(
    filename: string,
    mimeType: string
  ): Promise<MediaUploadTarget> {
    const config = getMediaConfig();
    return {
      provider: "cloudflare",
      endpoint: "/api/upload",
      fields: {
        bucket: config.cloudflare.bucketName,
        mimeType,
        filename,
      },
    };
  }

  public async getMetadata(
    providerAssetId: string,
    objectKey?: string
  ): Promise<MediaMetadata> {
    const config = getMediaConfig();
    if (config.cloudflare.isConfigured && this.s3Client && objectKey) {
      try {
        const head = await this.s3Client.send(
          new HeadObjectCommand({
            Bucket: config.cloudflare.bucketName,
            Key: objectKey,
          })
        );
        return {
          size: head.ContentLength,
          mimeType: head.ContentType,
        };
      } catch (err) {
        console.warn("[CloudflareR2Provider] HeadObject failed:", err);
      }
    }
    return {};
  }

  public async exists(
    providerAssetId: string,
    objectKey?: string
  ): Promise<boolean> {
    const config = getMediaConfig();
    if (config.cloudflare.isConfigured && this.s3Client && objectKey) {
      try {
        await this.s3Client.send(
          new HeadObjectCommand({
            Bucket: config.cloudflare.bucketName,
            Key: objectKey,
          })
        );
        return true;
      } catch {
        return false;
      }
    }
    return true; // Fallback assumes exists if using local or virtual asset
  }
}
