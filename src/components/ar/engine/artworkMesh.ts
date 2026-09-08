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
}

export interface ArtworkMeshPackage {
  group: THREE.Group;
  artMesh: THREE.Mesh;
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
 * Creates a calibrated 1:1 real-world scale 3D framed artwork object for AR.
 * 1 Three.js unit = 1.0 meter in the physical world.
 */
export function createArtworkMesh(options: ArtworkMeshOptions): ArtworkMeshPackage {
  const { dimensions, frameStyle, frameEnabled, texture } = options;

  // Convert centimeters to meters (1 unit = 1 meter)
  const widthM = Math.max(0.1, (dimensions.widthCm || 100) / 100);
  const heightM = Math.max(0.1, (dimensions.heightCm || 80) / 100);

  const mainGroup = new THREE.Group();
  mainGroup.name = "artwork_framed_object";

  // 1. Core Artwork Plane (1:1 aspect ratio)
  const artGeo = new THREE.PlaneGeometry(widthM, heightM);
  const artMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.42,
    metalness: 0.02,
    map: texture || null,
  });

  if (texture) {
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = THREE.LinearMipmapLinearFilter;
  }

  const artMesh = new THREE.Mesh(artGeo, artMat);
  artMesh.castShadow = true;
  artMesh.receiveShadow = false;
  artMesh.position.set(0, 0, 0.005); // Slight offset above shadow plane
  mainGroup.add(artMesh);

  // 2. Realistic Rectangular Wall Contact Shadow
  // Simulates ambient occlusion and subtle downward drop shadow from ceiling gallery track light
  const shadowPadding = 0.055; // 5.5cm soft penumbra spread
  const shadowGeo = new THREE.PlaneGeometry(
    widthM + shadowPadding * 2,
    heightM + shadowPadding * 2
  );

  const shadowCanvas = document.createElement("canvas");
  shadowCanvas.width = 256;
  shadowCanvas.height = 256;
  const ctx = shadowCanvas.getContext("2d");
  if (ctx) {
    ctx.clearRect(0, 0, 256, 256);
    // Wall ambient occlusion shadow with slight downward bias
    ctx.shadowColor = "rgba(0, 0, 0, 0.72)";
    ctx.shadowBlur = 32;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 14;
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";

    const inset = 38;
    ctx.fillRect(inset, inset, 256 - inset * 2, 256 - inset * 2);
  }
  const shadowTex = new THREE.CanvasTexture(shadowCanvas);

  const shadowMat = new THREE.MeshBasicMaterial({
    map: shadowTex,
    transparent: true,
    opacity: 0.68,
    depthWrite: false,
  });
  const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
  // Positioned directly against wall surface with downward offset
  shadowMesh.position.set(0, -0.018, -0.003);
  mainGroup.add(shadowMesh);

  // 3. Virtual Frame Bars
  const frameGroup = new THREE.Group();
  frameGroup.name = "artwork_frame";
  mainGroup.add(frameGroup);

  const buildFrame = (style: FrameStyle, enabled: boolean) => {
    // Clear existing children
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
    const frameDepth = 0.032; // 3.2 cm extrusion from wall

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
    artMat.map = newTexture;
    artMat.needsUpdate = true;
  };

  const dispose = () => {
    artGeo.dispose();
    artMat.dispose();
    shadowGeo.dispose();
    shadowMat.dispose();
    shadowTex.dispose();

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
    artMesh,
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
