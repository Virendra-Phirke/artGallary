"use client";

export interface ARCapabilities {
  supported: boolean;
  hasWebXr: boolean;
  hasHitTest: boolean;
  hasCamera: boolean;
  isMobile: boolean;
  reason?: string;
}

/**
 * Checks if the WebXR API exists on navigator.
 * Note: navigator.xr presence alone DOES NOT guarantee immersive-ar support.
 */
export function isWebXRAvailable(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  return "xr" in navigator && typeof (navigator as any).xr?.isSessionSupported === "function";
}

/**
 * Checks specifically whether 'immersive-ar' session mode is supported by the device.
 */
export async function isImmersiveARSupported(): Promise<boolean> {
  if (!isWebXRAvailable()) {
    console.log("[AR] WebXR API is unavailable on this browser/environment.");
    return false;
  }

  try {
    const supported = await (navigator as any).xr.isSessionSupported("immersive-ar");
    console.log(`[AR] navigator.xr.isSessionSupported('immersive-ar'): ${supported}`);
    return Boolean(supported);
  } catch (err) {
    console.warn("[AR] Failed to query isSessionSupported('immersive-ar'):", err);
    return false;
  }
}

/**
 * Checks if device camera stream (getUserMedia) is available.
 */
export function isCameraAvailable(): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }
  return (
    navigator.mediaDevices !== undefined &&
    typeof navigator.mediaDevices.getUserMedia === "function"
  );
}

/**
 * Comprehensive capability audit for WebXR, Camera, and 3D fallbacks.
 */
export async function detectARCapabilities(): Promise<ARCapabilities> {
  if (typeof window === "undefined") {
    return {
      supported: false,
      hasWebXr: false,
      hasHitTest: false,
      hasCamera: false,
      isMobile: false,
      reason: "Server-side rendering environment",
    };
  }

  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent || "");
  const hasCamera = isCameraAvailable();
  const hasWebXr = await isImmersiveARSupported();
  const hasHitTest = hasWebXr; // hit-test is supported in standard WebXR immersive-ar

  const supported = hasWebXr || hasCamera;

  console.log("[AR] Capability Audit:", {
    isMobile,
    hasWebXr,
    hasCamera,
    supported,
  });

  return {
    supported,
    hasWebXr,
    hasHitTest,
    hasCamera,
    isMobile,
    reason: supported
      ? undefined
      : "Neither WebXR immersive AR nor camera access is supported by this browser.",
  };
}
