"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import * as THREE from "three";
import { ArPermissionScreen } from "./ui/ArPermissionScreen";
import { RoomFallbackViewer } from "./ui/RoomFallbackViewer";
import { ArControlsOverlay } from "./ui/ArControlsOverlay";
import { ArErrorBanner } from "./ui/ArErrorBanner";
import { createArtworkMesh, FrameStyle } from "./engine/artworkMesh";
import { GestureController, GestureTransform } from "./engine/gestureController";
import { detectARCapabilities, ARCapabilities } from "./engine/arCapability";
import { startARSession, stopARSession, ARSessionContext } from "./engine/arSession";
import { ARError, classifyARError } from "./engine/arErrors";

interface ArStudioViewerProps {
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
  const mediaStreamRef = useRef<MediaStream | null>(null);
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
        setViewerMode("camera-ar");
        setArState("active");
        initCameraArEngine(stream);
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

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    // Bind session to Three.js WebXR Manager
    try {
      await renderer.xr.setSession(session);
      renderer.xr.setReferenceSpace(referenceSpace);
      console.log("[AR] Three.js WebXR session bound successfully.");
    } catch (bindErr) {
      console.warn("[AR] Error binding Three.js XR session:", bindErr);
    }

    const scene = new THREE.Scene();
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
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const width = window.innerWidth;
    const height = window.innerHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 2.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    rendererRef.current = renderer;
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.2, 10);
    pointLight.position.set(0.5, 1.5, 2);
    scene.add(pointLight);

    // Create 1:1 artwork
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
    scene.add(artworkPkg.group);

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
            artworkPkg.group.position.x = t.offsetX;
            artworkPkg.group.position.y = t.offsetY;
            setCurrentScale(t.scale);
          }
        },
      });
      gestureControllerRef.current = gesture;
    }

    setIsPlaced(true);
    setIsScanning(false);
    setSurfaceDetected(true);

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
      className="fixed inset-0 z-50 bg-black overflow-hidden select-none"
    >
      {/* Background Camera Video for Level 2 Camera AR */}
      {viewerMode === "camera-ar" && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* Three.js AR Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none"
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
