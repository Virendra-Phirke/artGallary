import { MediaConfigurationError } from "./media.errors";
import { MediaProviderName } from "./media.types";

export interface MediaConfig {
  activeProvider: MediaProviderName;
  isImageKitEnabled: boolean;
  isCloudflareEnabled: boolean;
  imagekit: {
    publicKey: string;
    privateKey: string;
    urlEndpoint: string;
    isConfigured: boolean;
  };
  cloudflare: {
    accountId: string;
    accessKeyId: string;
    secretAccessKey: string;
    bucketName: string;
    publicUrl: string;
    isConfigured: boolean;
  };
}

function parseBool(val: string | undefined, defaultVal: boolean): boolean {
  if (val === undefined || val === null || val === "") return defaultVal;
  return val === "true" || val === "1";
}

export function getMediaConfig(): MediaConfig {
  const rawProvider = (process.env.MEDIA_PROVIDER || "imagekit").toLowerCase().trim();
  const activeProvider: MediaProviderName = rawProvider === "cloudflare" ? "cloudflare" : "imagekit";

  const isImageKitEnabled = parseBool(process.env.IMAGEKIT_STORAGE, true);
  const isCloudflareEnabled = parseBool(process.env.CLOUDFLARE_STORAGE, true);

  // 1. Fail fast if active provider is disabled
  if (activeProvider === "imagekit" && !isImageKitEnabled) {
    throw new MediaConfigurationError(
      "Configuration Error: MEDIA_PROVIDER is set to 'imagekit' but IMAGEKIT_STORAGE is disabled (false). Either enable IMAGEKIT_STORAGE or change MEDIA_PROVIDER to 'cloudflare'."
    );
  }

  if (activeProvider === "cloudflare" && !isCloudflareEnabled) {
    throw new MediaConfigurationError(
      "Configuration Error: MEDIA_PROVIDER is set to 'cloudflare' but CLOUDFLARE_STORAGE is disabled (false). Either enable CLOUDFLARE_STORAGE or change MEDIA_PROVIDER to 'imagekit'."
    );
  }

  const imagekitPublicKey = process.env.IMAGEKIT_PUBLIC_KEY || "";
  const imagekitPrivateKey = process.env.IMAGEKIT_PRIVATE_KEY || "";
  const imagekitUrlEndpoint = (process.env.IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/latelier").replace(/\/$/, "");
  const isImageKitConfigured = Boolean(imagekitPublicKey && imagekitPrivateKey && imagekitUrlEndpoint);

  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.R2_ACCOUNT_ID || "";
  const cloudflareAccessKeyId = process.env.CLOUDFLARE_ACCESS_KEY_ID || process.env.R2_ACCESS_KEY_ID || "";
  const cloudflareSecretAccessKey = process.env.CLOUDFLARE_SECRET_ACCESS_KEY || process.env.R2_SECRET_ACCESS_KEY || "";
  const cloudflareBucketName = process.env.CLOUDFLARE_BUCKET_NAME || process.env.R2_BUCKET_NAME || "art-gallery-media";
  const cloudflarePublicUrl = (process.env.CLOUDFLARE_PUBLIC_URL || process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");
  const isCloudflareConfigured = Boolean(cloudflareAccountId && cloudflareAccessKeyId && cloudflareSecretAccessKey);

  return {
    activeProvider,
    isImageKitEnabled,
    isCloudflareEnabled,
    imagekit: {
      publicKey: imagekitPublicKey,
      privateKey: imagekitPrivateKey,
      urlEndpoint: imagekitUrlEndpoint,
      isConfigured: isImageKitConfigured,
    },
    cloudflare: {
      accountId: cloudflareAccountId,
      accessKeyId: cloudflareAccessKeyId,
      secretAccessKey: cloudflareSecretAccessKey,
      bucketName: cloudflareBucketName,
      publicUrl: cloudflarePublicUrl,
      isConfigured: isCloudflareConfigured,
    },
  };
}
