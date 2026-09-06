"use client";

export interface ARCapabilities {
  supported: boolean;
  hasWebXr: boolean;
  hasHitTest: boolean;
  hasCamera: boolean;
  reason?: string;
}

/**
 * Detects device and browser capabilities for WebXR Immersive AR,
 * Surface Hit-Testing, and Camera access.
 */
export async function detectARCapabilities(): Promise<ARCapabilities> {
  if (typeof window === "undefined") {
    return {
      supported: false,
      hasWebXr: false,
      hasHitTest: false,
      hasCamera: false,
      reason: "Server-side rendering environment",
    };
  }

  let hasWebXr = false;
  let hasHitTest = false;
  let hasCamera = false;

  if (
    typeof navigator !== "undefined" &&
    navigator.mediaDevices &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  ) {
    hasCamera = true;
  }

  if (typeof navigator !== "undefined" && "xr" in navigator && (navigator as any).xr?.isSessionSupported) {
    try {
      hasWebXr = await (navigator as any).xr.isSessionSupported("immersive-ar");
      hasHitTest = hasWebXr; // In WebXR immersive-ar, hit-test is a core requested feature
    } catch {
      hasWebXr = false;
      hasHitTest = false;
    }
  }

  const supported = hasWebXr || hasCamera;

  return {
    supported,
    hasWebXr,
    hasHitTest,
    hasCamera,
    reason: supported
      ? undefined
      : "Neither WebXR immersive AR nor camera access is supported by this browser.",
  };
}
