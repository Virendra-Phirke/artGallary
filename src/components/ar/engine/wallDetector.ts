"use client";

import * as THREE from "three";

export type WallConfidence = "high" | "medium" | "low";
export type DetectionSource = "plane-detection" | "hit-test-normal" | "camera-heuristic";

export interface WallPlacement {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  wallNormal: THREE.Vector3;
  confidence: WallConfidence;
  source: DetectionSource;
  isVertical: boolean;
  distanceFromCameraM: number;
  elevationM: number; // Center height from floor datum (when local-floor is active)
}

export interface WallDetectorOptions {
  galleryStandardElevationM?: number; // Default: 1.45m
  wallClearanceM?: number; // Offset from wall surface to prevent z-fighting, default 0.018m (1.8cm)
  maxWallAngleDeg?: number; // Max deviation from vertical allowed for a wall, default 25 deg
}

const DEFAULT_GALLERY_ELEVATION_M = 1.45; // 145cm center-line standard
const DEFAULT_WALL_CLEARANCE_M = 0.018; // 1.8cm clearance
const MAX_VERTICAL_DEVIATION_DOT = 0.42; // |normal.y| < 0.42 means tilt is within ~25° of true vertical

/**
 * Analyzes a WebXR hit-test pose matrix to determine if it hit a vertical wall surface,
 * calculates the outward wall normal, and computes wall-flush position and orientation.
 */
export function analyzeHitForWall(
  poseMatrixArray: Float32Array | number[],
  options?: WallDetectorOptions,
  referenceSpaceType?: string,
  cameraPosition?: THREE.Vector3
): WallPlacement | null {
  const galleryElevation = options?.galleryStandardElevationM ?? DEFAULT_GALLERY_ELEVATION_M;
  const clearance = options?.wallClearanceM ?? DEFAULT_WALL_CLEARANCE_M;

  const hitMatrix = new THREE.Matrix4().fromArray(poseMatrixArray);

  // Extract translation (hit point position)
  const hitPosition = new THREE.Vector3();
  const hitQuaternion = new THREE.Quaternion();
  const hitScale = new THREE.Vector3();
  hitMatrix.decompose(hitPosition, hitQuaternion, hitScale);

  // Extract orientation axes from matrix columns
  // In WebXR hit test poses:
  // Column 1 (index 4, 5, 6) or Column 2 (index 8, 9, 10) defines surface orientation.
  const colY = new THREE.Vector3(
    poseMatrixArray[4],
    poseMatrixArray[5],
    poseMatrixArray[6]
  ).normalize();

  const colZ = new THREE.Vector3(
    poseMatrixArray[8],
    poseMatrixArray[9],
    poseMatrixArray[10]
  ).normalize();

  // Test which column aligns most horizontally (low |y| value) representing a wall normal
  let wallNormal: THREE.Vector3;
  if (Math.abs(colY.y) < Math.abs(colZ.y)) {
    wallNormal = colY;
  } else {
    wallNormal = colZ;
  }

  // Ensure normal points towards the camera if camera position is known
  if (cameraPosition) {
    const toCamera = new THREE.Vector3().subVectors(cameraPosition, hitPosition).normalize();
    if (wallNormal.dot(toCamera) < 0) {
      wallNormal.negate();
    }
  }

  // Calculate verticality:
  // A true vertical wall normal has normal.y = 0.
  const verticalTilt = Math.abs(wallNormal.y);
  const isVertical = verticalTilt < MAX_VERTICAL_DEVIATION_DOT;

  if (!isVertical) {
    // Hit is likely on floor, ceiling, or horizontal tabletop
    return null;
  }

  // Project wall normal strictly onto horizontal plane (X-Z) so the painting hangs plumb
  const horizontalNormal = new THREE.Vector3(wallNormal.x, 0, wallNormal.z).normalize();
  if (horizontalNormal.lengthSq() < 0.001) {
    return null;
  }

  // Compute wall-aligned rotation:
  // Painting's front is local +Z. We want +Z to point along horizontalNormal (facing user).
  // Painting's top is local +Y. We want +Y to point along world Up (0, 1, 0).
  const lookTarget = hitPosition.clone().add(horizontalNormal);
  const rotationMatrix = new THREE.Matrix4().lookAt(
    hitPosition,
    lookTarget,
    new THREE.Vector3(0, 1, 0)
  );
  const artworkQuaternion = new THREE.Quaternion().setFromRotationMatrix(rotationMatrix);

  // Calculate final placement position
  const placementPosition = hitPosition.clone();

  // If local-floor reference space is active and floor is known at Y = 0,
  // ensure the artwork center is naturally positioned at or near gallery eye-level:
  if (referenceSpaceType === "local-floor") {
    // If user tapped near the floor (e.g. baseboard), lift center to gallery standard
    if (placementPosition.y < 0.8 || placementPosition.y > 2.2) {
      placementPosition.y = galleryElevation;
    }
  }

  // Apply subtle wall clearance offset along normal to prevent Z-fighting with real wall
  placementPosition.addScaledVector(horizontalNormal, clearance);

  // Calculate distance from camera if available
  const distanceFromCameraM = cameraPosition
    ? cameraPosition.distanceTo(placementPosition)
    : 1.8;

  const confidence: WallConfidence = verticalTilt < 0.2 ? "high" : "medium";

  return {
    position: placementPosition,
    quaternion: artworkQuaternion,
    wallNormal: horizontalNormal,
    confidence,
    source: "hit-test-normal",
    isVertical: true,
    distanceFromCameraM,
    elevationM: placementPosition.y,
  };
}

/**
 * Analyzes an XRPlane object from the WebXR Plane Detection API.
 */
export function analyzePlaneForWall(
  plane: any, // XRPlane
  frame: any, // XRFrame
  referenceSpace: any, // XRReferenceSpace
  options?: WallDetectorOptions,
  cameraPosition?: THREE.Vector3
): WallPlacement | null {
  if (!plane || !frame || !referenceSpace) return null;

  // Plane Detection API provides plane.orientation: "horizontal" or "vertical"
  if (plane.orientation !== "vertical") {
    return null;
  }

  const planePose = frame.getPose(plane.planeSpace, referenceSpace);
  if (!planePose) return null;

  const poseMatrix = planePose.transform.matrix;
  return analyzeHitForWall(poseMatrix, options, "local-floor", cameraPosition);
}

/**
 * Generates an intelligent heuristic wall placement for Camera-AR mode (when WebXR is unavailable).
 * Projects a virtual wall directly in front of the camera at comfortable eye level (1.45m).
 */
export function createHeuristicWallPlacement(
  camera: THREE.Camera,
  distanceM = 1.8,
  galleryElevationM = DEFAULT_GALLERY_ELEVATION_M
): WallPlacement {
  // Get camera position and forward direction
  const cameraPos = new THREE.Vector3();
  camera.getWorldPosition(cameraPos);

  const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
  // Flatten forward vector onto horizontal plane
  const horizontalForward = new THREE.Vector3(forward.x, 0, forward.z).normalize();

  // Wall normal points back at camera
  const wallNormal = horizontalForward.clone().negate();

  // Target position on virtual wall
  const position = cameraPos.clone().addScaledVector(horizontalForward, distanceM);
  // Center artwork at gallery standard height relative to camera/room
  position.y = galleryElevationM;

  // Compute rotation facing camera
  const lookTarget = position.clone().add(wallNormal);
  const rotMatrix = new THREE.Matrix4().lookAt(position, lookTarget, new THREE.Vector3(0, 1, 0));
  const quaternion = new THREE.Quaternion().setFromRotationMatrix(rotMatrix);

  return {
    position,
    quaternion,
    wallNormal,
    confidence: "medium",
    source: "camera-heuristic",
    isVertical: true,
    distanceFromCameraM: distanceM,
    elevationM: galleryElevationM,
  };
}

/**
 * Helper to test if a normal vector qualifies as a vertical wall surface.
 */
export function isNormalVertical(normal: THREE.Vector3, maxTilt = MAX_VERTICAL_DEVIATION_DOT): boolean {
  return Math.abs(normal.y) < maxTilt;
}
