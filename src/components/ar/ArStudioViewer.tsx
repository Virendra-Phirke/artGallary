"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Camera,
  Layers,
  Palette,
  Info,
  ArrowLeft,
  Check,
  Sparkles,
  Sun,
  ShieldCheck,
} from "lucide-react";
import { formatDimensions, formatCurrency } from "@/lib/utils";

interface ArStudioProps {
  artwork: {
    id: string;
    slug: string;
    title: string;
    year: number;
    medium: string;
    widthCm: number;
    heightCm: number;
    depthCm?: number;
    price?: number;
    currency: string;
    coverImageUrl: string;
    arConfig?: {
      isArEnabled: boolean;
      frameEnabled: boolean;
      frameType: "none" | "minimal_black" | "classic_gold" | "natural_wood" | "white_gallery";
      frameDepthCm: number;
      frameWidthCm: number;
      matColor: string;
    };
  };
}

export function ArStudioViewer({ artwork }: ArStudioProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // AR and device detection
  const [isWebXrSupported, setIsWebXrSupported] = useState<boolean>(false);
  const [activeMode, setActiveMode] = useState<"3d-room" | "webxr-ar">("3d-room");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);

  // Customization state
  const [frameType, setFrameType] = useState<string>(
    artwork.arConfig?.frameType || "minimal_black"
  );
  const [wallColor, setWallColor] = useState<string>("#22242b");
  const [lightIntensity, setLightIntensity] = useState<number>(1.2);
  const [showRuler, setShowRuler] = useState<boolean>(true);
  const [cameraStatus, setCameraStatus] = useState<string>("");

  // Dimensions in meters for Three.js (1 unit = 1 meter)
  const widthM = (artwork.widthCm || 100) / 100;
  const heightM = (artwork.heightCm || 80) / 100;
  const aspectRatio = widthM / heightM;

  // Check WebXR device capability
  useEffect(() => {
    if (typeof window !== "undefined" && "xr" in navigator) {
      // @ts-ignore
      navigator.xr
        ?.isSessionSupported("immersive-ar")
        .then((supported: boolean) => {
          setIsWebXrSupported(supported);
        })
        .catch(() => setIsWebXrSupported(false));
    }
  }, []);

  // Three.js Interactive 3D Room Setup
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let width = container.clientWidth;
    let height = container.clientHeight;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(wallColor);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    // Position camera ~2.5m away, at eye level (1.5m height)
    camera.position.set(0, 1.5, 2.8);
    camera.lookAt(0, 1.5, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 3. Lighting (Museum gallery track lighting)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5 * lightIntensity);
    scene.add(ambientLight);

    const keySpot = new THREE.SpotLight(0xfffaed, 2.5 * lightIntensity);
    keySpot.position.set(0.8, 3.2, 2.2);
    keySpot.angle = Math.PI / 4;
    keySpot.penumbra = 0.6;
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    scene.add(keySpot);

    const softFill = new THREE.DirectionalLight(0xebefff, 0.6 * lightIntensity);
    softFill.position.set(-1.5, 2.5, 1.5);
    scene.add(softFill);

    // 4. Room Geometry: Gallery Wall & Parquet Floor
    const wallGeo = new THREE.PlaneGeometry(10, 6);
    const wallMat = new THREE.MeshStandardMaterial({
      color: new THREE.Color(wallColor),
      roughness: 0.9,
      metalness: 0.05,
    });
    const wall = new THREE.Mesh(wallGeo, wallMat);
    wall.position.set(0, 1.5, 0);
    wall.receiveShadow = true;
    scene.add(wall);

    // Hardwood Floor
    const floorGeo = new THREE.PlaneGeometry(10, 6);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x1a1614,
      roughness: 0.4,
      metalness: 0.1,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, 0, 3);
    floor.receiveShadow = true;
    scene.add(floor);

    // 5. Artwork Mesh: Exact 1:1 meter Plane with Texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");

    const artGroup = new THREE.Group();
    artGroup.position.set(0, 1.5, 0.02); // Hung at 1.5m eye-level, slightly offset from wall

    const artGeo = new THREE.PlaneGeometry(widthM, heightM);
    const artMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.35,
      metalness: 0.0,
    });

    const artMesh = new THREE.Mesh(artGeo, artMat);
    artMesh.castShadow = true;
    artMesh.receiveShadow = true;
    artGroup.add(artMesh);

    // Load actual artwork image as provider-independent high-fidelity texture
    const arTextureUrl = artwork.coverImageUrl.includes("ik.imagekit.io")
      ? `${artwork.coverImageUrl}${artwork.coverImageUrl.includes("?") ? "&" : "?"}tr=w-2048,q-85,f-webp`
      : artwork.coverImageUrl;

    textureLoader.load(
      arTextureUrl,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = true;
        texture.minFilter = THREE.LinearMipmapLinearFilter;
        artMat.map = texture;
        artMat.needsUpdate = true;
      },
      undefined,
      (err) => {
        console.warn("Failed to load artwork texture:", err);
      }
    );

    // 6. Optional Frame Geometry
    const frameGroup = new THREE.Group();
    if (frameType !== "none") {
      const frameThickness = 0.04; // 4cm frame border
      const frameDepth = 0.035; // 3.5cm depth

      let frameHex = 0x111111; // minimal_black
      let frameRoughness = 0.6;
      let frameMetalness = 0.1;

      if (frameType === "classic_gold") {
        frameHex = 0xd1a86e;
        frameRoughness = 0.3;
        frameMetalness = 0.7;
      } else if (frameType === "natural_wood") {
        frameHex = 0x6e4a2e;
        frameRoughness = 0.7;
      } else if (frameType === "white_gallery") {
        frameHex = 0xf5f5f5;
        frameRoughness = 0.8;
      }

      const frameMat = new THREE.MeshStandardMaterial({
        color: frameHex,
        roughness: frameRoughness,
        metalness: frameMetalness,
      });

      // Top, Bottom, Left, Right frame bars
      const topBar = new THREE.Mesh(
        new THREE.BoxGeometry(widthM + frameThickness * 2, frameThickness, frameDepth),
        frameMat
      );
      topBar.position.set(0, heightM / 2 + frameThickness / 2, frameDepth / 2);
      topBar.castShadow = true;

      const bottomBar = new THREE.Mesh(
        new THREE.BoxGeometry(widthM + frameThickness * 2, frameThickness, frameDepth),
        frameMat
      );
      bottomBar.position.set(0, -heightM / 2 - frameThickness / 2, frameDepth / 2);
      bottomBar.castShadow = true;

      const leftBar = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, heightM, frameDepth),
        frameMat
      );
      leftBar.position.set(-widthM / 2 - frameThickness / 2, 0, frameDepth / 2);
      leftBar.castShadow = true;

      const rightBar = new THREE.Mesh(
        new THREE.BoxGeometry(frameThickness, heightM, frameDepth),
        frameMat
      );
      rightBar.position.set(widthM / 2 + frameThickness / 2, 0, frameDepth / 2);
      rightBar.castShadow = true;

      frameGroup.add(topBar, bottomBar, leftBar, rightBar);
    }
    artGroup.add(frameGroup);
    scene.add(artGroup);

    // 7. Subtle Orbit/Pan Interaction
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let rotY = 0;
    let rotX = 0;
    let zoomDistance = 2.8;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      rotY += deltaX * 0.005;
      rotX += deltaY * 0.005;
      rotX = Math.max(-0.3, Math.min(0.3, rotX));
      rotY = Math.max(-0.6, Math.min(0.6, rotY));

      camera.position.x = Math.sin(rotY) * zoomDistance;
      camera.position.z = Math.cos(rotY) * zoomDistance;
      camera.position.y = 1.5 + rotX * zoomDistance;
      camera.lookAt(0, 1.5, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomDistance += e.deltaY * 0.002;
      zoomDistance = Math.max(1.2, Math.min(5.0, zoomDistance));
      camera.position.x = Math.sin(rotY) * zoomDistance;
      camera.position.z = Math.cos(rotY) * zoomDistance;
      camera.position.y = 1.5 + rotX * zoomDistance;
      camera.lookAt(0, 1.5, 0);
    };

    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("wheel", onWheel, { passive: false });

    // Handle touch for mobile
    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1 && e.touches[0]) {
        isDragging = true;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1 || !e.touches[0]) return;
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;

      rotY += deltaX * 0.006;
      rotX += deltaY * 0.006;
      rotX = Math.max(-0.3, Math.min(0.3, rotX));
      rotY = Math.max(-0.6, Math.min(0.6, rotY));

      camera.position.x = Math.sin(rotY) * zoomDistance;
      camera.position.z = Math.cos(rotY) * zoomDistance;
      camera.position.y = 1.5 + rotX * zoomDistance;
      camera.lookAt(0, 1.5, 0);
    };
    const onTouchEnd = () => {
      isDragging = false;
    };

    canvas.addEventListener("touchstart", onTouchStart);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onTouchEnd);

    // 8. Animation Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize handler
    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("wheel", onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      renderer.dispose();
      artGeo.dispose();
      artMat.dispose();
      wallGeo.dispose();
      wallMat.dispose();
      floorGeo.dispose();
      floorMat.dispose();
    };
  }, [artwork, frameType, wallColor, lightIntensity, widthM, heightM]);

  // Launch WebXR Immersive AR (Mobile Chrome / WebXR)
  const handleLaunchWebXr = async () => {
    if (!isWebXrSupported) {
      alert("WebXR AR is not supported on this browser/device. Please use the interactive 3D virtual wall preview.");
      return;
    }

    try {
      setCameraStatus("Requesting camera access for local spatial positioning...");
      // @ts-ignore
      const session = await navigator.xr.requestSession("immersive-ar", {
        requiredFeatures: ["hit-test"],
        optionalFeatures: ["dom-overlay"],
      });

      session.addEventListener("end", () => {
        setCameraStatus("");
        setActiveMode("3d-room");
      });

      setActiveMode("webxr-ar");
      setCameraStatus("Active AR Session. Point camera at flat wall.");
    } catch (err: any) {
      console.warn("WebXR request failed:", err);
      alert("Could not start AR session: " + (err.message || "Permission denied"));
      setCameraStatus("");
    }
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen bg-[#0d0e12] overflow-hidden select-none flex flex-col"
    >
      {/* Three.js Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* Top Floating Bar */}
      <div className="relative z-10 p-4 md:p-6 flex items-center justify-between pointer-events-none">
        <Link
          href={`/artwork/${artwork.slug}`}
          className="pointer-events-auto flex items-center gap-2 bg-[#0d0e12]/80 backdrop-blur-md border border-[#262833] text-zinc-300 hover:text-white px-4 py-2 rounded-full text-xs uppercase tracking-widest transition-all hover:bg-[#1a1c23]"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Exit Studio</span>
        </Link>

        {/* Artwork Header Tag */}
        <div className="hidden sm:flex flex-col items-center bg-[#0d0e12]/80 backdrop-blur-md border border-[#262833] px-6 py-2 rounded-full pointer-events-auto">
          <span className="font-serif text-sm text-white font-medium">
            {artwork.title}
          </span>
          <span className="text-[10px] tracking-wider text-[#d1a86e] uppercase">
            True Scale 1:1 • {formatDimensions(artwork.widthCm, artwork.heightCm)}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {isWebXrSupported && (
            <button
              onClick={handleLaunchWebXr}
              className="flex items-center gap-2 bg-[#d1a86e] hover:bg-[#e2c18d] text-[#0d0e12] px-4 py-2 rounded-full text-xs font-semibold uppercase tracking-widest transition-all shadow-lg shadow-[#d1a86e]/20"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Launch AR Camera</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-[#0d0e12]/80 backdrop-blur-md border border-[#262833] text-zinc-300 hover:text-white rounded-full transition-colors"
            title="Toggle fullscreen"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Floating Scale & Dimension Overlay */}
      {showRuler && (
        <div className="absolute top-20 left-6 z-10 pointer-events-none hidden md:block">
          <div className="bg-[#0d0e12]/85 backdrop-blur-md border border-[#262833] rounded-lg p-3.5 text-xs text-zinc-300 space-y-1.5 shadow-xl">
            <div className="flex items-center gap-1.5 text-[#d1a86e] font-semibold tracking-wider uppercase text-[10px]">
              <Sparkles className="w-3 h-3" />
              <span>Physical Specifications</span>
            </div>
            <div>
              <span className="text-zinc-500">Dimensions: </span>
              <strong className="text-white">
                {formatDimensions(artwork.widthCm, artwork.heightCm, artwork.depthCm)}
              </strong>
            </div>
            <div>
              <span className="text-zinc-500">Medium: </span>
              <span>{artwork.medium}</span>
            </div>
            <div>
              <span className="text-zinc-500">Eye-Level Hang: </span>
              <span>150 cm (Gallery Center Standard)</span>
            </div>
          </div>
        </div>
      )}

      {/* Camera Privacy Indicator */}
      <div className="mt-auto relative z-10 p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4 pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 bg-[#0d0e12]/85 backdrop-blur-md border border-[#262833] px-4 py-2 rounded-full text-[11px] text-[#a6aabf]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#d1a86e]" />
          <span>Local Device Processing: Camera video frames are never transmitted or stored.</span>
        </div>

        {/* Customization Tool Bar */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-3 bg-[#0d0e12]/90 backdrop-blur-md border border-[#262833] p-2 rounded-2xl shadow-2xl">
          {/* Frame Selection */}
          <div className="flex items-center gap-1 px-2 border-r border-[#262833]">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 mr-1 hidden sm:inline">
              Frame:
            </span>
            {[
              { id: "none", label: "Frameless" },
              { id: "minimal_black", label: "Black" },
              { id: "classic_gold", label: "Gold" },
              { id: "natural_wood", label: "Wood" },
              { id: "white_gallery", label: "White" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setFrameType(f.id)}
                className={`text-[11px] px-2.5 py-1 rounded-md transition-colors ${
                  frameType === f.id
                    ? "bg-[#d1a86e] text-[#0d0e12] font-semibold"
                    : "text-zinc-400 hover:text-white hover:bg-[#1a1c23]"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Wall Paint Swatch */}
          <div className="flex items-center gap-1.5 px-2 border-r border-[#262833]">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500 mr-1 hidden sm:inline">
              Wall:
            </span>
            {[
              { color: "#22242b", label: "Onyx Charcoal" },
              { color: "#f3f3f0", label: "Gallery White" },
              { color: "#3d423f", label: "Sage Slate" },
              { color: "#ded6c7", label: "Warm Sand" },
            ].map((w) => (
              <button
                key={w.color}
                onClick={() => setWallColor(w.color)}
                style={{ backgroundColor: w.color }}
                className={`w-5 h-5 rounded-full border transition-all ${
                  wallColor === w.color
                    ? "border-[#d1a86e] scale-110 shadow-md"
                    : "border-transparent opacity-80 hover:opacity-100"
                }`}
                title={w.label}
              />
            ))}
          </div>

          {/* Lighting Toggle */}
          <button
            onClick={() =>
              setLightIntensity((prev) => (prev >= 1.5 ? 0.8 : prev + 0.3))
            }
            className="flex items-center gap-1 px-3 py-1 text-xs text-zinc-300 hover:text-white hover:bg-[#1a1c23] rounded-md transition-colors"
            title="Adjust gallery spotlight illumination"
          >
            <Sun className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] uppercase tracking-wider">
              {lightIntensity > 1.2 ? "Bright" : "Gallery Mood"}
            </span>
          </button>

          {/* Toggle Specs */}
          <button
            onClick={() => setShowRuler(!showRuler)}
            className={`p-1.5 rounded-md transition-colors ${
              showRuler
                ? "bg-[#1a1c23] text-[#d1a86e]"
                : "text-zinc-500 hover:text-white"
            }`}
            title="Toggle dimension indicators"
          >
            <Info className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
