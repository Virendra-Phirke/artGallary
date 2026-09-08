"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { cn } from "@/lib/utils";
import { ArPermissionScreen } from "./ui/ArPermissionScreen";
import { RoomFallbackViewer } from "./ui/RoomFallbackViewer";
import { ArControlsOverlay } from "./ui/ArControlsOverlay";
import { ArErrorBanner } from "./ui/ArErrorBanner";
import { createArtworkMesh, FrameStyle } from "./engine/artworkMesh";
import { GestureController, GestureTransform } from "./engine/gestureController";
import { detectARCapabilities, ARCapabilities } from "./engine/arCapability";
import { startARSession, stopARSession, ARSessionContext } from "./engine/arSession";
import { ARError, classifyARError } from "./engine/arErrors";

export interface ArStudioViewerProps {
  artwork: {
    id: string;
    slug: string;
    title: string;
    year?: number;
    coverImageUrl: string;
    widthCm: number;
    heightCm: number;
    depthCm?: number;
    medium: string;
    price?: number;
    currency?: string;
    arConfig?: {
      isArEnabled?: boolean;
      defaultScale?: number;
      defaultRotation?: number;
      minScale?: number;
      maxScale?: number;
      placementMode?: string;
      frameEnabled?: boolean;
      frameType?: FrameStyle | string;
      frameDepthCm?: number;
      frameWidthCm?: number;
      matColor?: string;
    };
  };
}

export type ViewerMode = "permission-screen" | "webxr-ar" | "camera-ar" | "3d-room";
export type ARState = "idle" | "checking" | "starting" | "active" | "error";

export function ArStudioViewer({ artwork }: ArStudioViewerProps) {
  // 1. Core State Machine
  const [viewerMode, setViewerMode] = useState<ViewerMode>("permission-screen");
  const [arState, setArState] = useState<ARState>("idle");
  const [arError, setArError] = useState<ARError | null>(null);
  const [capabilities, setCapabilities] = useState<ARCapabilities | null>(null);

  // Calibration & AR interaction states
  const [currentScale, setCurrentScale] = useState<number>(artwork.arConfig?.defaultScale ?? 1.0);
  const [isPlaced, setIsPlaced] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState<boolean>(true);
  const [surfaceDetected, setSurfaceDetected] = useState<boolean>(false);
  const [frameEnabled, setFrameEnabled] = useState<boolean>(artwork.arConfig?.frameEnabled ?? true);
  const [frameStyle, setFrameStyle] = useState<FrameStyle>(
    (artwork.arConfig?.frameType as FrameStyle) ?? "minimal_black"
  );

  // Hardware and DOM References
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Active runtime references
  const activeSessionRef = useRef<any>(null);
  const hitTestSourceRef = useRef<any>(null);
  const activeReferenceSpaceTypeRef = useRef<string>("local");
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const pendingStreamRef = useRef<MediaStream | null>(null);
  const cameraArInitializedRef = useRef<boolean>(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animIdRef = useRef<number | null>(null);
  const artworkPkgRef = useRef<any>(null);
  const gestureControllerRef = useRef<GestureController | null>(null);

  const minScale = artwork.arConfig?.minScale ?? 0.5;
  const maxScale = artwork.arConfig?.maxScale ?? 2.0;

  // 2. Query Device Capabilities on Mount
  useEffect(() => {
    let isMounted = true;
    detectARCapabilities().then((caps) => {
      if (isMounted) {
        setCapabilities(caps);
        console.log("[AR] Initialized capabilities audit:", caps);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 3. Teardown and Resource Disposal
  const teardownArSession = useCallback(async () => {
    console.log("[AR] Executing clean teardown...");

    // Stop animation frame loop
    if (animIdRef.current !== null) {
      cancelAnimationFrame(animIdRef.current);
      animIdRef.current = null;
    }

    // Stop WebXR session and hit-test source
    if (activeSessionRef.current) {
      await stopARSession(activeSessionRef.current, hitTestSourceRef.current);
      activeSessionRef.current = null;
      hitTestSourceRef.current = null;
    }

    // Stop Level 2 video camera stream tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    // Dispose gesture controller
    if (gestureControllerRef.current) {
      gestureControllerRef.current.destroy();
      gestureControllerRef.current = null;
    }

    // Dispose Three.js renderer and scene resources
    if (rendererRef.current) {
      rendererRef.current.setAnimationLoop(null);
      rendererRef.current.dispose();
      rendererRef.current = null;
    }

    if (artworkPkgRef.current) {
      artworkPkgRef.current.dispose();
      artworkPkgRef.current = null;
    }

    setIsPlaced(false);
    setIsScanning(true);
    setSurfaceDetected(false);
    setArState("idle");
  }, []);

  // Ensure cleanup on component unmount
  useEffect(() => {
    return () => {
      teardownArSession();
    };
  }, [teardownArSession]);

  // 3b. useEffect to initialize Camera AR after DOM renders video element
  useEffect(() => {
    if (
      viewerMode === "camera-ar" &&
      pendingStreamRef.current &&
      !cameraArInitializedRef.current
    ) {
      cameraArInitializedRef.current = true;
      const stream = pendingStreamRef.current;
      pendingStreamRef.current = null;

      // Small delay to ensure DOM elements are fully painted
      const timer = setTimeout(() => {
        initCameraArEngine(stream);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewerMode]);

  // 4. Launch AR Experience with Multi-Stage Graceful Fallback
  const handleStartAr = async () => {
    // Prevent rapid duplicate clicks
    if (arState === "starting" || arState === "active") {
      console.log("[AR] Launch already in progress, ignoring duplicate trigger.");
      return;
    }

    setArState("starting");
    setArError(null);

    // Stage 1: Attempt WebXR Immersive AR (if supported)
    if (capabilities?.hasWebXr) {
      try {
        console.log("[AR] Stage 1: Starting WebXR AR session...");
        const context = await startARSession({
          domOverlayRoot: containerRef.current,
        });

        activeSessionRef.current = context.session;
        hitTestSourceRef.current = context.hitTestSource;
        activeReferenceSpaceTypeRef.current = context.referenceSpaceType;

        setViewerMode("webxr-ar");
        setArState("active");
        initWebXrEngine(context);
        return;
      } catch (err: any) {
        console.warn("[AR] WebXR launch failed:", err);
        // If it was an explicit permission denial, don't silently attempt camera; handle directly
        if (err?.code === "AR_PERMISSION_DENIED") {
          setArError(err);
          setArState("error");
          return;
        }
        console.log("[AR] Falling back to Level 2 Camera Stream AR...");
      }
    }

    // Stage 2: Level 2 Camera Stream AR Fallback (Mobile Safari, non-WebXR browsers)
    if (capabilities?.hasCamera && navigator.mediaDevices?.getUserMedia) {
      try {
        console.log("[AR] Stage 2: Requesting rear device camera stream...");
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: "environment" },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });

        mediaStreamRef.current = stream;
        // Store stream in ref — useEffect will pick it up after DOM renders
        pendingStreamRef.current = stream;
        cameraArInitializedRef.current = false;
        setViewerMode("camera-ar");
        setArState("active");
        // DO NOT call initCameraArEngine here — video element doesn't exist yet
        return;
      } catch (err: any) {
        console.warn("[AR] Camera stream error:", err);
        const classified = classifyARError(err);
        setArError(classified);
        setArState("error");
        return;
      }
    }

    // Stage 3: If neither WebXR nor Camera is available, transition cleanly to 3D Room Studio
    console.log("[AR] Neither WebXR nor camera available. Defaulting to Interactive 3D Room Studio.");
    setArState("idle");
    setViewerMode("3d-room");
  };

  // 5. Level 1: WebXR Immersive AR Engine
  const initWebXrEngine = async (context: ARSessionContext) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { session, referenceSpace, hitTestSource } = context;

    // WebXR Transparent Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    // CRITICAL: Guarantee transparent framebuffer so camera passthrough is visible
    renderer.setClearColor(0x000000, 0);
    renderer.setClearAlpha(0);
    renderer.autoClear = true;
    renderer.xr.enabled = true;

    // Log diagnostic states
    console.log("[AR] WebXR session environmentBlendMode:", session.environmentBlendMode);
    console.log("[AR] WebXR session visibilityState:", session.visibilityState);
    if (session.renderState) {
      console.log("[AR] WebXR session renderState:", session.renderState);
    }

    // Bind session to Three.js WebXR Manager
    try {
      await renderer.xr.setSession(session);
      if (referenceSpace) {
        renderer.xr.setReferenceSpace(referenceSpace);
      }
      console.log("[AR] Three.js WebXR session bound successfully.");
    } catch (bindErr) {
      console.warn("[AR] Error binding Three.js XR session:", bindErr);
    }

    // CRITICAL: Three.js scene background MUST remain null for AR passthrough
    const scene = new THREE.Scene();
    scene.background = null;
    scene.environment = null;

    const camera = new THREE.PerspectiveCamera();

    // Natural gallery lighting for AR overlay
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xfffaed, 1.5);
    directionalLight.position.set(0.5, 2, 1);
    scene.add(directionalLight);

    // Reticle for surface placement
    const reticleGeo = new THREE.RingGeometry(0.12, 0.15, 32).rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xd1a86e,
      side: THREE.DoubleSide,
    });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // Create 1:1 metric scaled artwork object
    const artworkPkg = createArtworkMesh({
      dimensions: {
        widthCm: artwork.widthCm,
        heightCm: artwork.heightCm,
        depthCm: artwork.depthCm,
      },
      frameStyle,
      frameEnabled,
    });
    artworkPkgRef.current = artworkPkg;
    artworkPkg.group.visible = false;
    scene.add(artworkPkg.group);

    // Load artwork texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    textureLoader.load(artwork.coverImageUrl, (tex) => {
      artworkPkg.updateTexture(tex);
    });

    // Gesture Controller
    if (containerRef.current) {
      const gesture = new GestureController({
        domElement: containerRef.current,
        minScale,
        maxScale,
        defaultScale: artwork.arConfig?.defaultScale ?? 1.0,
        onTransformChange: (t: GestureTransform) => {
          if (artworkPkg.group) {
            artworkPkg.group.scale.set(t.scale, t.scale, t.scale);
            artworkPkg.group.rotation.z = t.rotationZ;
            setCurrentScale(t.scale);
          }
        },
      });
      gestureControllerRef.current = gesture;
    }

    // Tap to place on surface or in front of camera
    const handleSelect = () => {
      if (!artworkPkg?.group) return;

      if (reticle.visible) {
        artworkPkg.group.position.setFromMatrixPosition(reticle.matrix);
        artworkPkg.group.quaternion.setFromRotationMatrix(reticle.matrix);
        artworkPkg.group.visible = true;
        setIsPlaced(true);
        setIsScanning(false);
        reticle.visible = false;
      } else if (!artworkPkg.group.visible) {
        // Fallback placement: position 1.5m in front of camera
        artworkPkg.group.position.set(0, 0, -1.5);
        artworkPkg.group.visible = true;
        setIsPlaced(true);
        setIsScanning(false);
      }
    };
    session.addEventListener("select", handleSelect);

    // Clean session end handler
    session.addEventListener("end", () => {
      console.log("[AR] WebXR session ended by user or system.");
      teardownArSession();
      setViewerMode("3d-room");
    });

    // WebXR Continuous Render Loop
    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame && hitTestSource && referenceSpace && !artworkPkg.group.visible) {
        try {
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);
            if (pose) {
              reticle.visible = true;
              reticle.matrix.fromArray(pose.transform.matrix);
              setSurfaceDetected(true);
            }
          } else {
            // Normal scanning: no surface in view currently
            reticle.visible = false;
            setSurfaceDetected(false);
          }
        } catch {
          // Graceful ignore for frame transient hiccups
        }
      }

      renderer.render(scene, camera);
    });
  };

  // 6. Level 2: Camera Stream AR Engine (Fallback for Safari / Standard Mobile)
  const initCameraArEngine = (stream: MediaStream) => {
    console.log("[AR] initCameraArEngine called. videoRef:", !!videoRef.current, "canvasRef:", !!canvasRef.current);

    // Connect the camera stream to the video element
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch((e) => {
          console.warn("[AR] Video play failed:", e);
        });
        console.log("[AR] Camera video stream playing.");
      };
    } else {
      console.error("[AR] videoRef is still null — camera feed cannot attach.");
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("[AR] canvasRef is null — Three.js cannot initialize.");
      return;
    }

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.setClearAlpha(0);
    renderer.autoClear = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.2, 10);
    pointLight.position.set(0.5, 1.5, 2);
    scene.add(pointLight);

    // Create 1:1 artwork — initially hidden until user taps to place
    const artworkPkg = createArtworkMesh({
      dimensions: {
        widthCm: artwork.widthCm,
        heightCm: artwork.heightCm,
        depthCm: artwork.depthCm,
      },
      frameStyle,
      frameEnabled,
    });
    artworkPkgRef.current = artworkPkg;
    artworkPkg.group.visible = false; // Hidden until user taps to place
    scene.add(artworkPkg.group);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    textureLoader.load(artwork.coverImageUrl, (tex) => {
      artworkPkg.updateTexture(tex);
    });

    // Gesture Controller for pinch/drag/rotate after placement
    if (containerRef.current) {
      const gesture = new GestureController({
        domElement: containerRef.current,
        minScale,
        maxScale,
        defaultScale: artwork.arConfig?.defaultScale ?? 1.0,
        onTransformChange: (t: GestureTransform) => {
          if (artworkPkg.group && artworkPkg.group.visible) {
            artworkPkg.group.scale.set(t.scale, t.scale, t.scale);
            artworkPkg.group.rotation.z = t.rotationZ;
            artworkPkg.group.position.x = t.offsetX;
            artworkPkg.group.position.y = t.offsetY;
            setCurrentScale(t.scale);
          }
        },
      });
      gestureControllerRef.current = gesture;
    }

    // Start scanning — user taps to place the artwork
    setIsPlaced(false);
    setIsScanning(true);
    setSurfaceDetected(true); // Camera is a valid surface

    // Tap-to-place handler for camera-ar mode
    const handleTapPlace = (e: MouseEvent | TouchEvent) => {
      if (artworkPkg.group.visible) return; // Already placed
      e.preventDefault();
      artworkPkg.group.visible = true;
      artworkPkg.group.position.set(0, 0, 0);
      setIsPlaced(true);
      setIsScanning(false);
      console.log("[AR] Artwork placed via tap in camera-ar mode.");
    };
    canvas.addEventListener("click", handleTapPlace);
    canvas.addEventListener("touchend", handleTapPlace, { passive: false });

    const animate = () => {
      animIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);
  };

  const handleReset = () => {
    if (gestureControllerRef.current) {
      gestureControllerRef.current.reset();
      setCurrentScale(1.0);
    }
  };

  const handleFrameChange = (style: FrameStyle, enabled: boolean) => {
    setFrameStyle(style);
    setFrameEnabled(enabled);
    if (artworkPkgRef.current) {
      artworkPkgRef.current.updateFrame(style, enabled);
    }
  };

  // 7. RENDER DISPATCHER

  // If an AR error occurred, present luxury error banner (No browser alerts!)
  if (arError) {
    return (
      <ArErrorBanner
        error={arError}
        onSwitchTo3D={() => {
          setArError(null);
          teardownArSession();
          setViewerMode("3d-room");
        }}
        onRetry={() => {
          setArError(null);
          handleStartAr();
        }}
        onBack={() => {
          setArError(null);
          teardownArSession();
          setViewerMode("permission-screen");
        }}
      />
    );
  }

  // Pre-permission onboarding screen
  if (viewerMode === "permission-screen") {
    return (
      <ArPermissionScreen
        artwork={artwork}
        capabilities={capabilities}
        onStartAr={handleStartAr}
        onLaunchRoomFallback={() => setViewerMode("3d-room")}
        isStarting={arState === "starting"}
      />
    );
  }

  // Level 3 Interactive 3D Room Studio
  if (viewerMode === "3d-room") {
    return (
      <RoomFallbackViewer
        artwork={artwork}
        onLaunchArCamera={handleStartAr}
        canLaunchAr={Boolean(capabilities?.supported)}
      />
    );
  }

  // Active AR Modes ("webxr-ar" or "camera-ar")
  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 overflow-hidden select-none bg-black"
    >
      {/* Background Camera Video — always rendered so ref is available */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className={cn(
          "absolute inset-0 w-full h-full object-cover pointer-events-none",
          viewerMode !== "camera-ar" && "hidden"
        )}
      />

      {/* Scanning overlay — shown before user places artwork */}
      {viewerMode === "camera-ar" && !isPlaced && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none">
          {/* Scanning reticle */}
          <div className="w-48 h-48 rounded-3xl border-2 border-[#d1a86e]/60 flex items-center justify-center animate-pulse">
            <div className="w-36 h-36 rounded-2xl border border-[#d1a86e]/30 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 mx-auto rounded-full bg-[#d1a86e]/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#d1a86e] animate-ping" />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-6 text-sm text-white font-medium text-center px-6 drop-shadow-lg">
            Point your camera at a wall and tap to place the artwork
          </p>
          <p className="mt-1 text-[11px] text-white/60 font-mono text-center">
            {artwork.widthCm} × {artwork.heightCm} cm • 1:1 Scale
          </p>
        </div>
      )}

      {/* Three.js AR Canvas with guaranteed transparent background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none bg-transparent"
        style={{ backgroundColor: "transparent" }}
      />

      {/* Minimal HUD Controls Overlay */}
      <ArControlsOverlay
        artworkTitle={artwork.title}
        widthCm={artwork.widthCm}
        heightCm={artwork.heightCm}
        scale={currentScale}
        isPlaced={isPlaced}
        isScanning={isScanning}
        surfaceDetected={surfaceDetected}
        frameStyle={frameStyle}
        frameEnabled={frameEnabled}
        diagnostics={{
          mode: viewerMode,
          blendMode: activeSessionRef.current?.environmentBlendMode || "alpha-blend",
          referenceSpaceType: activeReferenceSpaceTypeRef.current || "local",
          hitTestReady: Boolean(hitTestSourceRef.current),
        }}
        onExit={() => {
          teardownArSession();
          setViewerMode("permission-screen");
        }}
        onReset={handleReset}
        onFrameChange={handleFrameChange}
        onSwitchTo3DRoom={() => {
          teardownArSession();
          setViewerMode("3d-room");
        }}
      />
    </div>
  );
}
