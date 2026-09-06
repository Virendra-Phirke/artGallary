/**
 * Standardized AR Error Classifications and User-Friendly Messaging
 */

export type ARErrorCode =
  | "AR_UNSUPPORTED"
  | "AR_SESSION_REJECTED"
  | "AR_PERMISSION_DENIED"
  | "AR_FEATURE_UNSUPPORTED"
  | "AR_REFERENCE_SPACE_FAILED"
  | "AR_HIT_TEST_FAILED"
  | "AR_RENDERER_FAILED"
  | "AR_SESSION_ENDED";

export interface ARErrorDetails {
  code: ARErrorCode;
  userMessage: string;
  technicalDetails?: string;
  suggestedAction: "try_3d" | "retry" | "check_permission" | "back";
}

export class ARError extends Error {
  public readonly code: ARErrorCode;
  public readonly userMessage: string;
  public readonly suggestedAction: "try_3d" | "retry" | "check_permission" | "back";
  public readonly technicalDetails?: string;

  constructor(details: ARErrorDetails) {
    super(details.userMessage);
    this.name = "ARError";
    this.code = details.code;
    this.userMessage = details.userMessage;
    this.suggestedAction = details.suggestedAction;
    this.technicalDetails = details.technicalDetails;
    Object.setPrototypeOf(this, ARError.prototype);
  }
}

/**
 * Maps raw browser/DOM exceptions into classified, friendly ARError instances
 */
export function classifyARError(error: unknown): ARError {
  if (error instanceof ARError) {
    return error;
  }

  const err = error as any;
  const message: string = err?.message || String(error || "");
  const name: string = err?.name || "";

  // Camera / Sensor permission denied
  if (
    name === "NotAllowedError" ||
    name === "PermissionDeniedError" ||
    message.toLowerCase().includes("permission") ||
    message.toLowerCase().includes("denied")
  ) {
    return new ARError({
      code: "AR_PERMISSION_DENIED",
      userMessage:
        "Camera access is required for real-world AR placement. You can enable camera permissions in your browser settings or preview the artwork in our Interactive 3D Room Studio.",
      technicalDetails: `${name}: ${message}`,
      suggestedAction: "check_permission",
    });
  }

  // Unsupported device or browser
  if (
    name === "NotSupportedError" ||
    message.toLowerCase().includes("not supported") ||
    message.toLowerCase().includes("no xr")
  ) {
    return new ARError({
      code: "AR_UNSUPPORTED",
      userMessage:
        "Your current browser or device does not support WebXR spatial tracking. You can explore the artwork with true 1:1 scale in our Interactive 3D Room Studio.",
      technicalDetails: `${name}: ${message}`,
      suggestedAction: "try_3d",
    });
  }

  // Session rejected by device XR subsystem
  if (
    name === "InvalidStateError" ||
    name === "SecurityError" ||
    message.toLowerCase().includes("session")
  ) {
    return new ARError({
      code: "AR_SESSION_REJECTED",
      userMessage:
        "The spatial AR session could not be initialized by your device. We have automatically prepared the Interactive 3D Room Studio for you.",
      technicalDetails: `${name}: ${message}`,
      suggestedAction: "try_3d",
    });
  }

  // Generic fallback
  return new ARError({
    code: "AR_FEATURE_UNSUPPORTED",
    userMessage:
      "Unable to start real-world AR on this device. You can view the artwork at authentic scale in the Interactive 3D Room Studio.",
    technicalDetails: `${name || "Error"}: ${message}`,
    suggestedAction: "try_3d",
  });
}
