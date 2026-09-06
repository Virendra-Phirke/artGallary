import { getMediaConfig } from "./media.config";
import { MediaConfigurationError } from "./media.errors";
import { MediaProvider, MediaProviderName } from "./media.types";
import { CloudflareR2Provider } from "./providers/cloudflare/cloudflare.provider";
import { ImageKitProvider } from "./providers/imagekit/imagekit.provider";

class ProviderResolver {
  private imagekitProvider: ImageKitProvider | null = null;
  private cloudflareProvider: CloudflareR2Provider | null = null;

  public resolveProvider(name: MediaProviderName): MediaProvider {
    const config = getMediaConfig();

    if (name === "imagekit") {
      if (!config.isImageKitEnabled) {
        throw new MediaConfigurationError(
          "Storage provider 'imagekit' is currently disabled in environment configuration (IMAGEKIT_STORAGE=false)."
        );
      }
      if (!this.imagekitProvider) {
        this.imagekitProvider = new ImageKitProvider();
      }
      return this.imagekitProvider;
    }

    if (name === "cloudflare") {
      if (!config.isCloudflareEnabled) {
        throw new MediaConfigurationError(
          "Storage provider 'cloudflare' is currently disabled in environment configuration (CLOUDFLARE_STORAGE=false)."
        );
      }
      if (!this.cloudflareProvider) {
        this.cloudflareProvider = new CloudflareR2Provider();
      }
      return this.cloudflareProvider;
    }

    throw new MediaConfigurationError(`Unsupported media provider: ${name}`);
  }

  public resolveActiveProvider(): MediaProvider {
    const config = getMediaConfig();
    return this.resolveProvider(config.activeProvider);
  }

  public getAvailableProviders(): MediaProviderName[] {
    const config = getMediaConfig();
    const available: MediaProviderName[] = [];
    if (config.isImageKitEnabled) available.push("imagekit");
    if (config.isCloudflareEnabled) available.push("cloudflare");
    return available;
  }
}

export const providerResolver = new ProviderResolver();
