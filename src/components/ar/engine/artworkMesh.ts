"use client";

import * as THREE from "three";
import type { WallPlacement } from "./wallDetector";

export type FrameStyle =
  | "none"
  | "minimal_black"
  | "classic_gold"
  | "natural_wood"
  | "white_gallery";

export interface ArtworkDimensions {
  widthCm: number;
  heightCm: number;
  depthCm?: number;
}

export interface ArtworkMeshOptions {
  dimensions: ArtworkDimensions;
  frameStyle: FrameStyle;
  frameEnabled: boolean;
  texture?: THREE.Texture;
  title?: string;
  medium?: string;
}

export interface ArtworkMeshPackage {
  group: THREE.Group;
  contentGroup: THREE.Group;
  artMesh: THREE.Mesh;
  backingMesh: THREE.Mesh;
  frameGroup: THREE.Group;
  shadowMesh: THREE.Mesh;
  widthM: number;
  heightM: number;
  alignToPlacement: (placement: WallPlacement) => void;
  updateFrame: (newStyle: FrameStyle, isEnabled: boolean) => void;
  updateTexture: (newTexture: THREE.Texture) => void;
  dispose: () => void;
}

/**
 * Creates an elegant, museum-grade procedural placeholder texture with title,
 * medium, physical dimensions, and textured background while high-resolution
 * textures are loading over the network.
 */
export function createArtworkPlaceholderTexture(
  title: string,
  widthM: number,
  heightM: number,
  medium?: string
): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  const aspect = widthM / heightM;
  const baseSize = 1024;
  canvas.width = aspect >= 1 ? baseSize : Math.round(baseSize * aspect);
  canvas.height = aspect >= 1 ? Math.round(baseSize / aspect) : baseSize;

  const ctx = canvas.getContext("2d");
  if (ctx) {
    const w = canvas.width;
    const h = canvas.height;

    // Gallery linen backdrop gradient
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, "#23201d");
    grad.addColorStop(0.5, "#1c1917");
    grad.addColorStop(1, "#151312");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Subtle canvas texture grain
    ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
    for (let i = 0; i < 4000; i++) {
      const rx = Math.random() * w;
      const ry = Math.random() * h;
      ctx.fillRect(rx, ry, 2, 2);
    }

    // Elegant inner hairline border
    ctx.strokeStyle = "rgba(209, 168, 110, 0.35)";
    ctx.lineWidth = 2;
    const inset = Math.min(w, h) * 0.06;
    ctx.strokeRect(inset, inset, w - inset * 2, h - inset * 2);

    // Typography
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // Top Label
    ctx.font = "500 24px sans-serif";
    ctx.fillStyle = "rgba(209, 168, 110, 0.75)";
    ctx.fillText("ORIGINAL ARTWORK", w / 2, h * 0.35);

    // Title
    ctx.font = "600 42px serif";
    ctx.fillStyle = "#fafaf9";
    const displayTitle = title.length > 32 ? `${title.slice(0, 32)}…` : title;
    ctx.fillText(displayTitle, w / 2, h * 0.46);

    // Medium & Dimensions
    ctx.font = "400 22px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
    const dimsText = `${Math.round(widthM * 100)} cm × ${Math.round(heightM * 100)} cm`;
    const details = medium ? `${medium}  •  ${dimsText}` : dimsText;
    ctx.fillText(details, w / 2, h * 0.56);

    // Loading status
    ctx.font = "400 18px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("Loading high-resolution artwork…", w / 2, h * 0.66);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

/**
 * Creates a calibrated 1:1 real-world scale 3D framed artwork object for AR.
 * 1 Three.js unit = 1.0 meter in the physical world.
 */
export function createArtworkMesh(options: ArtworkMeshOptions): ArtworkMeshPackage {
  const { dimensions, frameStyle, frameEnabled, texture, title, medium } = options;

  // Convert centimeters to meters (1 unit = 1 meter)
  const widthM = Math.max(0.1, (dimensions.widthCm || 100) / 100);
  const heightM = Math.max(0.1, (dimensions.heightCm || 80) / 100);
  const depthM = Math.max(0.015, Math.min(0.05, (dimensions.depthCm || 2.5) / 100));

  // Root group: controls world placement position and wall-aligned quaternion
  const mainGroup = new THREE.Group();
  mainGroup.name = "artwork_framed_root";

  // Content group: nested inside mainGroup, isolated for user gestures (scale, local roll)
  const contentGroup = new THREE.Group();
  contentGroup.name = "artwork_content";
  mainGroup.add(contentGroup);

  // 1. Core Artwork Plane (1:1 aspect ratio)
  const initialTexture =
    texture ||
    (typeof document !== "undefined"
      ? createArtworkPlaceholderTexture(title || "Artwork", widthM, heightM, medium)
      : undefined);

  if (initialTexture) {
    initialTexture.colorSpace = THREE.SRGBColorSpace;
    initialTexture.generateMipmaps = true;
    initialTexture.minFilter = THREE.LinearMipmapLinearFilter;
  }

  const artGeo = new THREE.PlaneGeometry(widthM, heightM);
  const artMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.38,
    metalness: 0.02,
    map: initialTexture || null,
    side: THREE.DoubleSide, // Ensure artwork canvas is never culled regardless of angle
  });

  const artMesh = new THREE.Mesh(artGeo, artMat);
  artMesh.castShadow = true;
  artMesh.receiveShadow = false;
  // Positioned flush with the front face of the stretched backing canvas
  artMesh.position.set(0, 0, depthM + 0.001);
  contentGroup.add(artMesh);

  // 2. Physical Canvas Stretcher Backboard (adds 3D realism from oblique viewing angles)
  const backingGeo = new THREE.BoxGeometry(widthM, heightM, depthM);
  const backingMat = new THREE.MeshStandardMaterial({
    color: 0x1f1d1b,
    roughness: 0.88,
    metalness: 0.04,
  });
  const backingMesh = new THREE.Mesh(backingGeo, backingMat);
  backingMesh.position.set(0, 0, depthM / 2);
  backingMesh.castShadow = true;
  backingMesh.receiveShadow = false;
  contentGroup.add(backingMesh);

  // 3. Realistic Rectangular Wall Contact Shadow
  // Positioned directly against wall surface in mainGroup behind contentGroup
  const shadowPadding = 0.055;
  const shadowGeo = new THREE.PlaneGeometry(
    widthM + shadowPadding * 2,
    heightM + shadowPadding * 2
  );

  let shadowTex: THREE.CanvasTexture | null = null;
  if (typeof document !== "undefined") {
    const shadowCanvas = document.createElement("canvas");
    shadowCanvas.width = 256;
    shadowCanvas.height = 256;
    const ctx = shadowCanvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, 256, 256);
      ctx.shadowColor = "rgba(0, 0, 0, 0.72)";
      ctx.shadowBlur = 32;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 14;
      ctx.fillStyle = "rgba(0, 0, 0, 0.85)";

      const inset = 38;
      ctx.fillRect(inset, inset, 256 - inset * 2, 256 - inset * 2);
    }
    shadowTex = new THREE.CanvasTexture(shadowCanvas);
  }

  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  shadowMesh.position.set(0, -0.018, -0.002);
  mainGroup.add(shadowMesh);

  // 4. Virtual Frame Bars
  const frameGroup = new THREE.Group();
  frameGroup.name = "artwork_frame";
  contentGroup.add(frameGroup);

  const buildFrame = (style: FrameStyle, enabled: boolean) => {
    while (frameGroup.children.length > 0) {
      const child = frameGroup.children[0] as THREE.Mesh;
      frameGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }

    if (!enabled || style === "none") {
      frameGroup.visible = false;
      return;
    }

    frameGroup.visible = true;

    const frameThickness = 0.038; // 3.8 cm border
    const frameDepth = depthM + 0.012; // Frame extends slightly forward past the canvas front

    let colorHex = 0x141416; // minimal_black
    let roughness = 0.55;
    let metalness = 0.15;

    if (style === "classic_gold") {
      colorHex = 0xd1a86e;
      roughness = 0.32;
      metalness = 0.68;
    } else if (style === "natural_wood") {
      colorHex = 0x6e4a2e;
      roughness = 0.75;
      metalness = 0.05;
    } else if (style === "white_gallery") {
      colorHex = 0xf5f5f7;
      roughness = 0.78;
      metalness = 0.02;
    }

    const frameMat = new THREE.MeshStandardMaterial({
      color: colorHex,
      roughness,
      metalness,
    });

    // Top Bar
    const topBar = new THREE.Mesh(
      new THREE.BoxGeometry(widthM + frameThickness * 2, frameThickness, frameDepth),
      frameMat
    );
    topBar.position.set(0, heightM / 2 + frameThickness / 2, frameDepth / 2);
    topBar.castShadow = true;

    // Bottom Bar
    const bottomBar = new THREE.Mesh(
      new THREE.BoxGeometry(widthM + frameThickness * 2, frameThickness, frameDepth),
      frameMat
    );
    bottomBar.position.set(0, -heightM / 2 - frameThickness / 2, frameDepth / 2);
    bottomBar.castShadow = true;

    // Left Bar
    const leftBar = new THREE.Mesh(
      new THREE.BoxGeometry(frameThickness, heightM, frameDepth),
      frameMat
    );
    leftBar.position.set(-widthM / 2 - frameThickness / 2, 0, frameDepth / 2);
    leftBar.castShadow = true;

    // Right Bar
    const rightBar = new THREE.Mesh(
      new THREE.BoxGeometry(frameThickness, heightM, frameDepth),
      frameMat
    );
    rightBar.position.set(widthM / 2 + frameThickness / 2, 0, frameDepth / 2);
    rightBar.castShadow = true;

    frameGroup.add(topBar, bottomBar, leftBar, rightBar);
  };

  buildFrame(frameStyle, frameEnabled);

  const updateFrame = (newStyle: FrameStyle, isEnabled: boolean) => {
    buildFrame(newStyle, isEnabled);
  };

  const updateTexture = (newTexture: THREE.Texture) => {
    newTexture.colorSpace = THREE.SRGBColorSpace;
    newTexture.generateMipmaps = true;
    newTexture.minFilter = THREE.LinearMipmapLinearFilter;
    newTexture.needsUpdate = true;
    artMat.map = newTexture;
    artMat.needsUpdate = true;
  };

  const dispose = () => {
    artGeo.dispose();
    artMat.dispose();
    backingGeo.dispose();
    backingMat.dispose();
    shadowGeo.dispose();
    shadowMat.dispose();
    if (shadowTex) shadowTex.dispose();

    while (frameGroup.children.length > 0) {
      const child = frameGroup.children[0] as THREE.Mesh;
      frameGroup.remove(child);
      if (child.geometry) child.geometry.dispose();
      if (child.material) {
        if (Array.isArray(child.material)) child.material.forEach((m) => m.dispose());
        else child.material.dispose();
      }
    }
  };

  const alignToPlacement = (placement: WallPlacement) => {
    mainGroup.position.copy(placement.position);
    mainGroup.quaternion.copy(placement.quaternion);
  };

  return {
    group: mainGroup,
    contentGroup,
    artMesh,
    backingMesh,
    frameGroup,
    shadowMesh,
    widthM,
    heightM,
    alignToPlacement,
    updateFrame,
    updateTexture,
    dispose,
  };
}

/**
 * Loads an artwork texture with CORS support, SRGB color space configuration,
 * mipmapping, and a robust fetch-to-blob fallback for cross-origin or CDN restrictions.
 */
export function loadArtworkTexture(
  url: string,
  onSuccess: (texture: THREE.Texture) => void,
  onError?: (err: any) => void
): void {
  if (!url) return;
  const loader = new THREE.TextureLoader();
  loader.setCrossOrigin("anonymous");
  loader.load(
    url,
    (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.generateMipmaps = true;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.needsUpdate = true;
      onSuccess(tex);
    },
    undefined,
    (err) => {
      console.warn("[AR Texture] Standard TextureLoader failed, attempting fetch fallback:", err);
      fetch(url, { mode: "cors" })
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP error ${res.status}`);
          return res.blob();
        })
        .then((blob) => {
          const objectUrl = URL.createObjectURL(blob);
          loader.load(
            objectUrl,
            (tex) => {
              tex.colorSpace = THREE.SRGBColorSpace;
              tex.generateMipmaps = true;
              tex.minFilter = THREE.LinearMipmapLinearFilter;
              tex.needsUpdate = true;
              onSuccess(tex);
              URL.revokeObjectURL(objectUrl);
            },
            undefined,
            (blobErr) => {
              console.error("[AR Texture] Blob loader error:", blobErr);
              URL.revokeObjectURL(objectUrl);
              if (onError) onError(blobErr);
            }
          );
        })
        .catch((fetchErr) => {
          console.error("[AR Texture] Fetch fallback failed:", fetchErr);
          if (onError) onError(fetchErr);
        });
    }
  );
}
