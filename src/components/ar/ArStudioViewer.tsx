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
import { startARSession, stopARSession, createXRAnchor, ARSessionContext } from "./engine/arSession";
import { ARError, classifyARError } from "./engine/arErrors";
import {
  analyzeHitForWall,
  createHeuristicWallPlacement,
  WallPlacement,
  WallConfidence,
} from "./engine/wallDetector";
import { LightingEstimator } from "./engine/lightingEstimator";

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

/**
 * Creates a museum-grade wall-bracket reticle with corner guides matching
 * the artwork's exact aspect ratio and elevation center crosshair.
 */
function createWallBracketReticle(widthM: number, heightM: number) {
  const group = new THREE.Group();
  group.name = "wall_bracket_reticle";
  group.visible = false;

  // 1. Transparent aspect ratio plane
  const planeGeo = new THREE.PlaneGeometry(widthM, heightM);
  const planeMat = new THREE.MeshBasicMaterial({
    color: 0xd1a86e,
    transparent: true,
    opacity: 0.12,
    side: THREE.DoubleSide,
    depthWrite: false,
  });
  const planeMesh = new THREE.Mesh(planeGeo, planeMat);
  group.add(planeMesh);

  // 2. Corner bracket guides
  const bracketSize = Math.min(widthM, heightM) * 0.2;
  const bracketMat = new THREE.LineBasicMaterial({
    color: 0xd1a86e,
    linewidth: 2,
  });

  const halfW = widthM / 2;
  const halfH = heightM / 2;

  const createBracket = (x: number, y: number, dirX: number, dirY: number) => {
    const points = [
      new THREE.Vector3(x + dirX * bracketSize, y, 0.003),
      new THREE.Vector3(x, y, 0.003),
      new THREE.Vector3(x, y + dirY * bracketSize, 0.003),
    ];
    const geo = new THREE.BufferGeometry().setFromPoints(points);
    return new THREE.Line(geo, bracketMat);
  };

  const tl = createBracket(-halfW, halfH, 1, -1);
  const tr = createBracket(halfW, halfH, -1, -1);
  const bl = createBracket(-halfW, -halfH, 1, 1);
  const br = createBracket(halfW, -halfH, -1, 1);
  group.add(tl, tr, bl, br);

  // 3. Center crosshair (gallery standard 145cm elevation datum)
  const crossSize = 0.035;
  const crossPoints = [
    new THREE.Vector3(-crossSize, 0, 0.003),
    new THREE.Vector3(crossSize, 0, 0.003),
    new THREE.Vector3(0, -crossSize, 0.003),
    new THREE.Vector3(0, crossSize, 0.003),
  ];
  const crossGeo = new THREE.BufferGeometry().setFromPoints(crossPoints);
  const crossLines = new THREE.LineSegments(crossGeo, bracketMat);
  group.add(crossLines);

  const setWallLocked = (isLocked: boolean) => {
    if (isLocked) {
      bracketMat.color.setHex(0x34d399); // Emerald green when true wall is locked
      planeMat.color.setHex(0x34d399);
      planeMat.opacity = 0.18;
    } else {
      bracketMat.color.setHex(0xf59e0b); // Amber during searching or floor hit
      planeMat.color.setHex(0xf59e0b);
      planeMat.opacity = 0.08;
    }
  };

  const dispose = () => {
    planeGeo.dispose();
    planeMat.dispose();
    bracketMat.dispose();
    tl.geometry.dispose();
    tr.geometry.dispose();
    bl.geometry.dispose();
    br.geometry.dispose();
    crossGeo.dispose();
  };

  return { group, setWallLocked, dispose };
}

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
  const [wallDetected, setWallDetected] = useState<boolean>(false);
  const [wallConfidence, setWallConfidence] = useState<WallConfidence | null>(null);
  const [anchorLocked, setAnchorLocked] = useState<boolean>(false);
  const [elevationOffsetM, setElevationOffsetM] = useState<number>(0);
  const [elevationLocked, setElevationLocked] = useState<boolean>(false);

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
  const activeAnchorRef = useRef<any>(null);
  const lastWallPlacementRef = useRef<WallPlacement | null>(null);
  const lastHitResultRef = useRef<any>(null);
  const lastFrameRef = useRef<any>(null);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const pendingStreamRef = useRef<MediaStream | null>(null);
  const cameraArInitializedRef = useRef<boolean>(false);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animIdRef = useRef<number | null>(null);
  const artworkPkgRef = useRef<any>(null);
  const reticlePkgRef = useRef<ReturnType<typeof createWallBracketReticle> | null>(null);
  const lightingEstimatorRef = useRef<LightingEstimator | null>(null);
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

    // Release active XRAnchor
    if (activeAnchorRef.current) {
      try {
        if (typeof activeAnchorRef.current.delete === "function") {
          activeAnchorRef.current.delete();
        }
      } catch {}
      activeAnchorRef.current = null;
    }

    // Dispose lighting estimator
    if (lightingEstimatorRef.current) {
      lightingEstimatorRef.current.dispose();
      lightingEstimatorRef.current = null;
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

    // Dispose reticle
    if (reticlePkgRef.current) {
      reticlePkgRef.current.dispose();
      reticlePkgRef.current = null;
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

    lastWallPlacementRef.current = null;
    lastHitResultRef.current = null;
    lastFrameRef.current = null;

    setIsPlaced(false);
    setIsScanning(true);
    setSurfaceDetected(false);
    setWallDetected(false);
    setWallConfidence(null);
    setAnchorLocked(false);
    setElevationOffsetM(0);
    setElevationLocked(false);
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

      const timer = setTimeout(() => {
        initCameraArEngine(stream);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [viewerMode]);

  // 4. Launch AR Experience with Capability Cascade
  const handleStartAr = async () => {
    if (arState === "starting" || arState === "active") {
      console.log("[AR] Launch already in progress, ignoring duplicate trigger.");
      return;
    }

    setArState("starting");
    setArError(null);

    // Stage 1: Attempt WebXR Immersive AR (Android Chrome / ARCore)
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
        if (err?.code === "AR_PERMISSION_DENIED") {
          setArError(err);
          setArState("error");
          return;
        }
        console.log("[AR] Falling back to Camera Stream AR...");
      }
    }

    // Stage 2: Camera Stream AR Fallback (Safari / iOS / desktop test)
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
        pendingStreamRef.current = stream;
        cameraArInitializedRef.current = false;
        setViewerMode("camera-ar");
        setArState("active");
        return;
      } catch (err: any) {
        console.warn("[AR] Camera stream error:", err);
        const classified = classifyARError(err);
        setArError(classified);
        setArState("error");
        return;
      }
    }

    // Stage 3: 3D Studio Fallback
    console.log("[AR] Transitioning to Interactive 3D Room Studio.");
    setArState("idle");
    setViewerMode("3d-room");
  };

  // 5. Level 1: WebXR Spatial AR Engine with Real Wall Alignment & Lighting Estimation
  const initWebXrEngine = async (context: ARSessionContext) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { session, referenceSpace, hitTestSource, hasLightingEstimation } = context;

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

    renderer.setClearColor(0x000000, 0);
    renderer.setClearAlpha(0);
    renderer.autoClear = true;
    renderer.xr.enabled = true;

    try {
      await renderer.xr.setSession(session);
      if (referenceSpace) {
        renderer.xr.setReferenceSpace(referenceSpace);
      }
      console.log("[AR] Three.js WebXR session bound successfully.");
    } catch (bindErr) {
      console.warn("[AR] Error binding Three.js XR session:", bindErr);
    }

    const scene = new THREE.Scene();
    scene.background = null;
    scene.environment = null;

    const camera = new THREE.PerspectiveCamera();

    // Scene Lighting Setup with WebXR Adaptive Lighting Estimation
    const ambientLight = new THREE.AmbientLight(0xfffaee, 1.3);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xfff7e8, 1.5);
    directionalLight.position.set(0.4, 2.2, 1.2);
    scene.add(directionalLight);

    const lightingEstimator = new LightingEstimator({
      ambientLight,
      directionalLight,
    });
    lightingEstimatorRef.current = lightingEstimator;

    if (hasLightingEstimation) {
      lightingEstimator.initSessionLightProbe(session).catch((e) => {
        console.log("[AR Light] Light probe initialization error:", e);
      });
    }

    // 1:1 Metric Artwork Object
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

    // Wall-Bracket Aspect Ratio Reticle
    const reticlePkg = createWallBracketReticle(artworkPkg.widthM, artworkPkg.heightM);
    reticlePkgRef.current = reticlePkg;
    scene.add(reticlePkg.group);

    // Load high-resolution artwork texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.setCrossOrigin("anonymous");
    textureLoader.load(artwork.coverImageUrl, (tex) => {
      artworkPkg.updateTexture(tex);
    });

    // Gesture Controller with Wall Plane and Elevation Control
    if (containerRef.current) {
      const gesture = new GestureController({
        domElement: containerRef.current,
        minScale,
        maxScale,
        defaultScale: artwork.arConfig?.defaultScale ?? 1.0,
        elevationLock: elevationLocked,
        onTransformChange: (t: GestureTransform) => {
          if (artworkPkg.group && artworkPkg.group.visible) {
            artworkPkg.group.scale.set(t.scale, t.scale, t.scale);
            artworkPkg.group.rotation.z = t.rotationZ;
            setCurrentScale(t.scale);
            setElevationOffsetM(t.offsetY);
          }
        },
      });
      gestureControllerRef.current = gesture;
    }

    // Tap to place on detected wall surface
    const handleSelect = () => {
      if (!artworkPkg?.group) return;

      if (lastWallPlacementRef.current && reticlePkg.group.visible) {
        artworkPkg.alignToPlacement(lastWallPlacementRef.current);
        artworkPkg.group.visible = true;
        setIsPlaced(true);
        setIsScanning(false);
        reticlePkg.group.visible = false;

        console.log("[AR] Artwork mounted flush to wall at:", lastWallPlacementRef.current.position);

        // Establish spatial XRAnchor if supported
        if (context.hasAnchors && lastHitResultRef.current) {
          createXRAnchor(lastFrameRef.current, lastHitResultRef.current, referenceSpace)
            .then((anchor) => {
              if (anchor) {
                activeAnchorRef.current = anchor;
                setAnchorLocked(true);
                console.log("[AR Anchor] Spatial anchor established successfully.");
              }
            })
            .catch(() => {});
        }
      } else if (!artworkPkg.group.visible) {
        // Fallback: place in front of camera at gallery eye-level (1.45m)
        artworkPkg.group.position.set(0, 0, -1.8);
        artworkPkg.group.visible = true;
        setIsPlaced(true);
        setIsScanning(false);
      }
    };
    session.addEventListener("select", handleSelect);

    session.addEventListener("end", () => {
      console.log("[AR] WebXR session ended.");
      teardownArSession();
      setViewerMode("3d-room");
    });

    // Continuous WebXR Render Loop
    renderer.setAnimationLoop((timestamp, frame) => {
      lastFrameRef.current = frame;

      // Update real-world environmental lighting
      if (lightingEstimatorRef.current && frame) {
        lightingEstimatorRef.current.updateFromFrame(frame);
      }

      // Update hit-test & wall detection while scanning
      if (frame && hitTestSource && referenceSpace && !artworkPkg.group.visible) {
        try {
          const hitTestResults = frame.getHitTestResults(hitTestSource);
          if (hitTestResults.length > 0) {
            const hit = hitTestResults[0];
            const pose = hit.getPose(referenceSpace);
            if (pose) {
              setSurfaceDetected(true);
              lastHitResultRef.current = hit;

              // Camera position for outward normal orientation
              const viewerPose = frame.getViewerPose(referenceSpace);
              const camPos = viewerPose
                ? new THREE.Vector3(
                    viewerPose.transform.position.x,
                    viewerPose.transform.position.y,
                    viewerPose.transform.position.z
                  )
                : undefined;

              // Real wall vertical surface analysis
              const placement = analyzeHitForWall(
                pose.transform.matrix,
                { galleryStandardElevationM: 1.45 },
                activeReferenceSpaceTypeRef.current,
                camPos
              );

              if (placement) {
                lastWallPlacementRef.current = placement;
                reticlePkg.group.visible = true;
                reticlePkg.group.position.copy(placement.position);
                reticlePkg.group.quaternion.copy(placement.quaternion);
                reticlePkg.setWallLocked(true);
                setWallDetected(true);
                setWallConfidence(placement.confidence);
              } else {
                // Non-vertical surface (e.g. floor or ceiling)
                reticlePkg.group.visible = true;
                const hitMat = new THREE.Matrix4().fromArray(pose.transform.matrix);
                reticlePkg.group.position.setFromMatrixPosition(hitMat);
                reticlePkg.group.quaternion.setFromRotationMatrix(hitMat);
                reticlePkg.setWallLocked(false);
                setWallDetected(false);
                setWallConfidence(null);
              }
            }
          } else {
            reticlePkg.group.visible = false;
            setSurfaceDetected(false);
            setWallDetected(false);
            setWallConfidence(null);
          }
        } catch {
          // Graceful handling of transient XR frame drops
        }
      }

      renderer.render(scene, camera);
    });
  };

  // 6. Level 2: Camera Stream AR Engine (Heuristic Wall Placement + Museum Lighting)
  const initCameraArEngine = (stream: MediaStream) => {
    console.log("[AR] Initializing Camera AR Engine with wall heuristic...");

    if (videoRef.current) {
      videoRef.current.srcObject = stream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current?.play().catch((e) => {
          console.warn("[AR] Video play failed:", e);
        });
      };
    } else {
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

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

    // Museum Gallery Lighting Setup
    const ambientLight = new THREE.AmbientLight(0xfffaee, 1.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xfff5e6, 1.3, 10);
    pointLight.position.set(0.4, 1.8, 1.8);
    scene.add(pointLight);

    // 1:1 Metric Artwork Object
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
        elevationLock: elevationLocked,
        onTransformChange: (t: GestureTransform) => {
          if (artworkPkg.group && artworkPkg.group.visible) {
            artworkPkg.group.scale.set(t.scale, t.scale, t.scale);
            artworkPkg.group.rotation.z = t.rotationZ;
            artworkPkg.group.position.x = t.offsetX;
            artworkPkg.group.position.y = t.offsetY;
            setCurrentScale(t.scale);
            setElevationOffsetM(t.offsetY);
          }
        },
      });
      gestureControllerRef.current = gesture;
    }

    setIsPlaced(false);
    setIsScanning(true);
    setSurfaceDetected(true);
    setWallDetected(true); // Heuristic wall available immediately
    setWallConfidence("medium");

    // Tap-to-place handler with heuristic wall alignment
    const handleTapPlace = (e: MouseEvent | TouchEvent) => {
      if (artworkPkg.group.visible) return;
      e.preventDefault();

      const heuristic = createHeuristicWallPlacement(camera, 1.8, 1.45);
      artworkPkg.alignToPlacement(heuristic);
      artworkPkg.group.position.set(0, 0, 0); // Normalized centered space
      artworkPkg.group.visible = true;

      setIsPlaced(true);
      setIsScanning(false);
      console.log("[AR] Artwork placed via camera heuristic at 145cm eye-level.");
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
      setElevationOffsetM(0);
    }
  };

  const handleAdjustElevation = (deltaM: number) => {
    if (gestureControllerRef.current) {
      gestureControllerRef.current.adjustElevation(deltaM);
    }
  };

  const handleToggleElevationLock = () => {
    setElevationLocked((prev) => {
      const next = !prev;
      if (gestureControllerRef.current) {
        gestureControllerRef.current.setElevationLock(next);
      }
      return next;
    });
  };

  const handleFrameChange = (style: FrameStyle, enabled: boolean) => {
    setFrameStyle(style);
    setFrameEnabled(enabled);
    if (artworkPkgRef.current) {
      artworkPkgRef.current.updateFrame(style, enabled);
    }
  };

  // 7. RENDER DISPATCHER

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
      {/* Background Camera Feed */}
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

      {/* Wall scanning bracket overlay (camera-ar before placement) */}
      {viewerMode === "camera-ar" && !isPlaced && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none px-4">
          <div className="w-48 h-48 rounded-3xl border-2 border-[#d1a86e]/60 flex items-center justify-center animate-pulse">
            <div className="w-36 h-36 rounded-2xl border border-[#d1a86e]/30 flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="w-8 h-8 mx-auto rounded-full bg-[#d1a86e]/20 flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-[#d1a86e] animate-ping" />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-6 text-xs sm:text-sm text-white font-medium text-center px-6 drop-shadow-lg">
            Point camera toward a wall and tap to mount painting
          </p>
          <p className="mt-1 text-[10px] sm:text-[11px] text-[#d1a86e] font-mono text-center">
            {artwork.widthCm} × {artwork.heightCm} cm • 145 cm Eye-Level Standard
          </p>
        </div>
      )}

      {/* Three.js AR Canvas with guaranteed transparent background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full touch-none bg-transparent"
        style={{ backgroundColor: "transparent" }}
      />

      {/* Modern HUD Controls Overlay */}
      <ArControlsOverlay
        artworkTitle={artwork.title}
        widthCm={artwork.widthCm}
        heightCm={artwork.heightCm}
        scale={currentScale}
        isPlaced={isPlaced}
        isScanning={isScanning}
        surfaceDetected={surfaceDetected}
        wallDetected={wallDetected}
        wallConfidence={wallConfidence}
        anchorLocked={anchorLocked}
        elevationOffsetM={elevationOffsetM}
        elevationLocked={elevationLocked}
        frameStyle={frameStyle}
        frameEnabled={frameEnabled}
        diagnostics={{
          mode: viewerMode,
          blendMode: activeSessionRef.current?.environmentBlendMode || "alpha-blend",
          referenceSpaceType: activeReferenceSpaceTypeRef.current || "local",
          hitTestReady: Boolean(hitTestSourceRef.current),
          hasPlaneDetection: Boolean(activeSessionRef.current?.detectedPlanes),
          hasLightingEstimation: Boolean(lightingEstimatorRef.current),
          hasAnchors: anchorLocked,
        }}
        onExit={() => {
          teardownArSession();
          setViewerMode("permission-screen");
        }}
        onReset={handleReset}
        onAdjustElevation={handleAdjustElevation}
        onToggleElevationLock={handleToggleElevationLock}
        onFrameChange={handleFrameChange}
        onSwitchTo3DRoom={() => {
          teardownArSession();
          setViewerMode("3d-room");
        }}
      />
    </div>
  );
}
