"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { ArPermissionScreen } from "./ui/ArPermissionScreen";
import { ArControlsOverlay } from "./ui/ArControlsOverlay";
import { RoomFallbackViewer } from "./ui/RoomFallbackViewer";
import { detectARCapabilities, ARCapabilities } from "./engine/arCapability";
import { FrameStyle, createArtworkMesh, ArtworkMeshPackage } from "./engine/artworkMesh";
import { GestureController, GestureTransform } from "./engine/gestureController";

interface ArStudioViewerProps {
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
      frameType: FrameStyle;
      frameDepthCm: number;
      frameWidthCm: number;
      matColor: string;
      defaultScale?: number;
      defaultRotation?: number;
      minScale?: number;
      maxScale?: number;
      placementMode?: "wall" | "floor";
    };
  };
}

type ViewerMode = "permission-screen" | "webxr-ar" | "camera-ar" | "3d-room";

export function ArStudioViewer({ artwork }: ArStudioViewerProps) {
  const [capabilities, setCapabilities] = useState<ARCapabilities | null>(null);
  const [viewerMode, setViewerMode] = useState<ViewerMode>("permission-screen");
  const [isStartingAr, setIsStartingAr] = useState(false);

  // AR Session State
  const [isPlaced, setIsPlaced] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [surfaceDetected, setSurfaceDetected] = useState(false);
  const [currentScale, setCurrentScale] = useState(artwork.arConfig?.defaultScale || 1.0);
  const [frameStyle, setFrameStyle] = useState<FrameStyle>(
    artwork.arConfig?.frameType || "minimal_black"
  );
  const [frameEnabled, setFrameEnabled] = useState(
    artwork.arConfig?.frameEnabled ?? true
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // References for Three.js and AR objects
  const gestureControllerRef = useRef<GestureController | null>(null);
  const artworkPkgRef = useRef<ArtworkMeshPackage | null>(null);
  const activeSessionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const minScale = artwork.arConfig?.minScale ?? 0.5;
  const maxScale = artwork.arConfig?.maxScale ?? 2.0;

  // 1. Initial Capability Check on Mount
  useEffect(() => {
    detectARCapabilities().then((caps) => {
      setCapabilities(caps);
    });
  }, []);

  // 2. Teardown helper
  const teardownArSession = () => {
    if (activeSessionRef.current) {
      try {
        activeSessionRef.current.end();
      } catch {}
      activeSessionRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (gestureControllerRef.current) {
      gestureControllerRef.current.destroy();
      gestureControllerRef.current = null;
    }

    if (artworkPkgRef.current) {
      artworkPkgRef.current.dispose();
      artworkPkgRef.current = null;
    }

    setIsPlaced(false);
    setIsScanning(true);
    setSurfaceDetected(false);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      teardownArSession();
    };
  }, []);

  // 3. Launch AR Experience
  const handleStartAr = async () => {
    setIsStartingAr(true);

    // If WebXR immersive-ar is supported, start WebXR session
    if (capabilities?.hasWebXr && "xr" in navigator) {
      try {
        // @ts-ignore
        const session = await navigator.xr.requestSession("immersive-ar", {
          requiredFeatures: ["hit-test"],
          optionalFeatures: ["dom-overlay"],
          domOverlay: containerRef.current ? { root: containerRef.current } : undefined,
        });

        activeSessionRef.current = session;
        setViewerMode("webxr-ar");
        setIsStartingAr(false);
        initWebXrEngine(session);
        return;
      } catch (err) {
        console.warn("WebXR request failed, trying camera fallback:", err);
      }
    }

    // Level 2 Camera Stream AR Fallback (for mobile Safari, Chrome without WebXR flags, etc.)
    if (capabilities?.hasCamera && navigator.mediaDevices?.getUserMedia) {
      try {
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
        setIsStartingAr(false);
        initCameraArEngine(stream);
        return;
      } catch (err: any) {
        console.warn("Camera stream denied or unavailable:", err);
        alert(
          "Camera access could not be granted (" +
            (err.message || "Permission denied") +
            "). Switching to interactive 3D Room Studio."
        );
      }
    }

    // Fallback to Level 3 Interactive 3D Room Studio
    setIsStartingAr(false);
    setViewerMode("3d-room");
  };

  // 4. WebXR Immersive AR Engine (Level 1)
  const initWebXrEngine = (session: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    // Natural lighting for AR
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xfffaed, 1.5);
    directionalLight.position.set(0.5, 2, 1);
    scene.add(directionalLight);

    // Reticle for surface placement
    const reticleGeo = new THREE.RingGeometry(0.15, 0.18, 32).rotateX(-Math.PI / 2);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xd1a86e,
      side: THREE.DoubleSide,
    });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    reticle.matrixAutoUpdate = false;
    reticle.visible = false;
    scene.add(reticle);

    // Create 1:1 artwork object
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

    // Load texture
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

    // Tap to place
    const handleSelect = () => {
      if (reticle.visible) {
        artworkPkg.group.position.setFromMatrixPosition(reticle.matrix);
        artworkPkg.group.quaternion.setFromRotationMatrix(reticle.matrix);
        artworkPkg.group.visible = true;
        setIsPlaced(true);
        setIsScanning(false);
        reticle.visible = false;
      }
    };
    session.addEventListener("select", handleSelect);

    session.addEventListener("end", () => {
      setViewerMode("3d-room");
      teardownArSession();
    });

    let hitTestSource: any = null;
    let localSpace: any = null;

    session
      .requestReferenceSpace("viewer")
      .then((viewerSpace: any) => {
        session.requestHitTestSource({ space: viewerSpace }).then((source: any) => {
          hitTestSource = source;
        });
      })
      .catch(() => {});

    session
      .requestReferenceSpace("local")
      .then((refSpace: any) => {
        localSpace = refSpace;
        renderer.xr.setReferenceSpace(refSpace);
        renderer.xr.setSession(session);
      })
      .catch(() => {});

    // WebXR Render Loop
    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame && hitTestSource && localSpace && !artworkPkg.group.visible) {
        const hitTestResults = frame.getHitTestResults(hitTestSource);
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(localSpace);
          if (pose) {
            reticle.visible = true;
            reticle.matrix.fromArray(pose.transform.matrix);
            setSurfaceDetected(true);
          }
        } else {
          reticle.visible = false;
          setSurfaceDetected(false);
        }
      }

      renderer.render(scene, camera);
    });
  };

  // 5. Camera Stream Web AR Engine (Level 2 Fallback)
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
    // Position camera ~2.2m from virtual wall plane
    camera.position.set(0, 0, 2.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.4);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.2, 10);
    pointLight.position.set(0.5, 1.5, 2);
    scene.add(pointLight);

    // Create framed artwork package
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

    // Auto-place initially in center of view
    setIsPlaced(true);
    setIsScanning(false);
    setSurfaceDetected(true);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
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

  // 6. RENDER LOGIC BASED ON VIEWER MODE
  if (viewerMode === "permission-screen") {
    return (
      <ArPermissionScreen
        artwork={artwork}
        onStartAr={handleStartAr}
        onLaunchRoomFallback={() => setViewerMode("3d-room")}
        isStarting={isStartingAr}
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
      className="fixed inset-0 z-50 bg-black overflow-hidden select-none"
    >
      {/* Background Camera Video for Level 2 Camera AR Fallback */}
      {viewerMode === "camera-ar" && (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}

      {/* Three.js AR Canvas Overlay */}
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
