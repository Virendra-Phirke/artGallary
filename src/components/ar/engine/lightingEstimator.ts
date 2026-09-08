"use client";

import * as THREE from "three";

export interface LightingEstimatorConfig {
  ambientLight: THREE.AmbientLight;
  directionalLight: THREE.DirectionalLight;
}

/**
 * WebXR Lighting Estimation adapter.
 * Synchronizes physical room lighting with Three.js scene lights when supported,
 * and maintains a calibrated museum spotlight setup as a reliable fallback.
 */
export class LightingEstimator {
  private ambientLight: THREE.AmbientLight;
  private directionalLight: THREE.DirectionalLight;
  private lightProbe: any | null = null;
  private isLightProbeAvailable = false;

  constructor(config: LightingEstimatorConfig) {
    this.ambientLight = config.ambientLight;
    this.directionalLight = config.directionalLight;

    // Apply initial museum gallery baseline
    this.applyGalleryLightingBaseline();
  }

  /**
   * Initializes the WebXR XRLightProbe if supported by the active session.
   */
  public async initSessionLightProbe(session: any): Promise<boolean> {
    if (!session || typeof session.requestLightProbe !== "function") {
      console.log("[AR Light] WebXR light-estimation is not supported by session.");
      this.isLightProbeAvailable = false;
      return false;
    }

    try {
      this.lightProbe = await session.requestLightProbe();
      this.isLightProbeAvailable = true;
      console.log("[AR Light] XRLightProbe successfully initialized.");
      return true;
    } catch (err: any) {
      console.log("[AR Light] Failed to request XRLightProbe:", err.message);
      this.isLightProbeAvailable = false;
      return false;
    }
  }

  /**
   * Called on each XR animation frame to sample real-world lighting.
   */
  public updateFromFrame(frame: any): void {
    if (!this.isLightProbeAvailable || !this.lightProbe || !frame) {
      return;
    }

    try {
      const estimate = frame.getLightEstimate(this.lightProbe);
      if (!estimate) return;

      // 1. Primary light direction (sun or strongest room luminaire)
      if (estimate.primaryLightDirection) {
        const dir = estimate.primaryLightDirection;
        // Invert direction because Three.js DirectionalLight position points FROM light TO target
        this.directionalLight.position.set(dir.x * 2.5, Math.max(0.5, dir.y * 2.5), dir.z * 2.5);
      }

      // 2. Primary light color & intensity
      if (estimate.primaryLightIntensity) {
        const intensity = estimate.primaryLightIntensity;
        // Intensity is in RGB format; compute scalar intensity with safe clamping
        const maxRgb = Math.max(intensity.x, intensity.y, intensity.z, 0.1);
        const normalizedR = Math.min(1, Math.max(0.2, intensity.x / maxRgb));
        const normalizedG = Math.min(1, Math.max(0.2, intensity.y / maxRgb));
        const normalizedB = Math.min(1, Math.max(0.2, intensity.z / maxRgb));

        this.directionalLight.color.setRGB(normalizedR, normalizedG, normalizedB);
        this.directionalLight.intensity = Math.min(2.5, Math.max(0.8, maxRgb));

        // Ambient adaptation: softer fill matching the dominant tone
        this.ambientLight.color.setRGB(normalizedR, normalizedG, normalizedB);
        this.ambientLight.intensity = Math.min(1.6, Math.max(0.6, maxRgb * 0.7));
      }
    } catch {
      // Non-fatal transient frame glitch
    }
  }

  /**
   * Default museum gallery lighting baseline.
   * 3000K warm spotlight with soft diffuse ambient fill.
   */
  public applyGalleryLightingBaseline(): void {
    this.ambientLight.color.setHex(0xfffaee);
    this.ambientLight.intensity = 1.35;

    // Track spotlight placed above and slightly forward (mimicking ceiling gallery rails)
    this.directionalLight.color.setHex(0xfff7e8);
    this.directionalLight.intensity = 1.5;
    this.directionalLight.position.set(0.4, 2.2, 1.2);
  }

  public dispose(): void {
    this.lightProbe = null;
    this.isLightProbeAvailable = false;
  }
}
