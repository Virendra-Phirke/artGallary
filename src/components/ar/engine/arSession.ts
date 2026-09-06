"use client";

import { isImmersiveARSupported } from "./arCapability";
import { ARError, classifyARError } from "./arErrors";

export interface ARSessionConfig {
  domOverlayRoot?: HTMLElement | null;
}

export interface ARSessionContext {
  session: any; // XRSession
  referenceSpace: any; // XRReferenceSpace
  referenceSpaceType: string;
  hitTestSource: any | null; // XRHitTestSource
}

/**
 * Primary WebXR Session Creator with capability-aware fallback configurations,
 * multi-tier reference space resolution, and hit-test source initialization.
 */
export async function startARSession(config?: ARSessionConfig): Promise<ARSessionContext> {
  console.log("[AR] Initiating WebXR AR session request...");

  // Phase 1: Verify immersive-ar support before calling requestSession
  const isSupported = await isImmersiveARSupported();
  if (!isSupported) {
    console.warn("[AR] immersive-ar is not supported on this device/browser.");
    throw new ARError({
      code: "AR_UNSUPPORTED",
      userMessage:
        "WebXR immersive AR is not supported by your browser. We have switched to the Interactive 3D Room Studio.",
      suggestedAction: "try_3d",
    });
  }

  const xr = (navigator as any).xr;
  let session: any = null;

  // Phase 2: Build tiered session configurations
  // Minimal requirement is ONLY 'hit-test'. Enhancements are optional.
  const domOverlayOption =
    config?.domOverlayRoot ? { root: config.domOverlayRoot } : undefined;

  const sessionOptionsCandidates: any[] = [];

  // Candidate A: hit-test with DOM overlay and local-floor
  if (domOverlayOption) {
    sessionOptionsCandidates.push({
      requiredFeatures: ["hit-test"],
      optionalFeatures: ["local-floor", "anchors", "dom-overlay"],
      domOverlay: domOverlayOption,
    });
  }

  // Candidate B: hit-test with local-floor (no DOM overlay)
  sessionOptionsCandidates.push({
    requiredFeatures: ["hit-test"],
    optionalFeatures: ["local-floor", "anchors"],
  });

  // Candidate C: Absolute bare minimum (hit-test only)
  sessionOptionsCandidates.push({
    requiredFeatures: ["hit-test"],
  });

  let lastError: any = null;

  for (let i = 0; i < sessionOptionsCandidates.length; i++) {
    const candidate = sessionOptionsCandidates[i];
    try {
      console.log(`[AR] Attempting session configuration candidate #${i + 1}:`, candidate);
      session = await xr.requestSession("immersive-ar", candidate);
      console.log(`[AR] WebXR session created successfully using candidate #${i + 1}`);
      break;
    } catch (err: any) {
      console.warn(`[AR] Session candidate #${i + 1} rejected (${err.name}: ${err.message})`);
      lastError = err;
    }
  }

  if (!session) {
    console.error("[AR] All WebXR session configurations rejected by device:", lastError);
    throw classifyARError(lastError);
  }

  // Phase 3: Reference Space Resolution with Fallback Chain
  // Chain: local-floor -> local -> viewer
  let referenceSpace: any = null;
  let referenceSpaceType = "";
  const spaceTypes = ["local-floor", "local", "viewer"];

  for (const spaceType of spaceTypes) {
    try {
      referenceSpace = await session.requestReferenceSpace(spaceType);
      referenceSpaceType = spaceType;
      console.log(`[AR] Acquired reference space: '${spaceType}'`);
      break;
    } catch (err: any) {
      console.log(`[AR] Reference space '${spaceType}' not available on device (${err.message}). Trying next fallback...`);
    }
  }

  if (!referenceSpace) {
    console.error("[AR] Could not acquire any reference space (local-floor, local, or viewer).");
    try {
      await session.end();
    } catch {}
    throw new ARError({
      code: "AR_REFERENCE_SPACE_FAILED",
      userMessage:
        "Unable to establish spatial reference space on this device. Switching to Interactive 3D Room Studio.",
      suggestedAction: "try_3d",
    });
  }

  // Phase 4: Hit-Test Source Initialization
  let hitTestSource: any = null;
  try {
    const viewerSpace = await session.requestReferenceSpace("viewer");
    hitTestSource = await session.requestHitTestSource({ space: viewerSpace });
    console.log("[AR] WebXR Hit-test source created successfully.");
  } catch (err: any) {
    console.warn("[AR] Hit-test source initialization failed:", err.message);
    // Non-fatal if we allow manual tap placement, but log clearly
  }

  return {
    session,
    referenceSpace,
    referenceSpaceType,
    hitTestSource,
  };
}

/**
 * Safely stops an active WebXR session and releases hardware locks
 */
export async function stopARSession(session: any, hitTestSource?: any): Promise<void> {
  if (!session) return;

  console.log("[AR] Tearing down WebXR session...");

  if (hitTestSource && typeof hitTestSource.cancel === "function") {
    try {
      hitTestSource.cancel();
      console.log("[AR] Hit-test source cancelled.");
    } catch (e) {
      console.warn("[AR] Error cancelling hit-test source:", e);
    }
  }

  try {
    await session.end();
    console.log("[AR] WebXR session ended cleanly.");
  } catch (e) {
    console.warn("[AR] Error ending WebXR session (may already be ended):", e);
  }
}
