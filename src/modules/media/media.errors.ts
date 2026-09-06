/**
 * Normalized Media Infrastructure Domain Errors
 * Raw SDK and HTTP tracebacks or credentials must never leak to users.
 */

export class MediaError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = "MEDIA_ERROR", statusCode: number = 500) {
    super(message);
    this.name = "MediaError";
    this.code = code;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class MediaConfigurationError extends MediaError {
  constructor(message: string) {
    super(message, "MEDIA_CONFIG_ERROR", 500);
    this.name = "MediaConfigurationError";
  }
}

export class MediaValidationError extends MediaError {
  constructor(message: string) {
    super(message, "MEDIA_VALIDATION_ERROR", 400);
    this.name = "MediaValidationError";
  }
}

export class MediaAuthorizationError extends MediaError {
  constructor(message: string = "Unauthorized: Media operation requires administrative privileges") {
    super(message, "MEDIA_AUTH_ERROR", 403);
    this.name = "MediaAuthorizationError";
  }
}

export class MediaNotFoundError extends MediaError {
  constructor(message: string = "Requested media asset was not found") {
    super(message, "MEDIA_NOT_FOUND", 404);
    this.name = "MediaNotFoundError";
  }
}

export class MediaUploadError extends MediaError {
  constructor(message: string = "Failed to upload artwork media. Please try again.") {
    super(message, "MEDIA_UPLOAD_ERROR", 500);
    this.name = "MediaUploadError";
  }
}

export class MediaDeleteError extends MediaError {
  constructor(message: string = "Failed to delete media asset. Please try again.") {
    super(message, "MEDIA_DELETE_ERROR", 500);
    this.name = "MediaDeleteError";
  }
}

export class MediaProviderError extends MediaError {
  public readonly provider: string;

  constructor(provider: string, message: string = `Storage provider '${provider}' encountered an internal error`) {
    super(message, "MEDIA_PROVIDER_ERROR", 502);
    this.name = "MediaProviderError";
    this.provider = provider;
  }
}
