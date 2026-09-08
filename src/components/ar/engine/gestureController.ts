"use client";

export interface GestureTransform {
  scale: number;
  rotationZ: number;
  offsetX: number;
  offsetY: number;
}

export interface GestureControllerOptions {
  domElement: HTMLElement;
  minScale?: number;
  maxScale?: number;
  defaultScale?: number;
  elevationLock?: boolean;
  onTransformChange: (transform: GestureTransform) => void;
}

export class GestureController {
  private domElement: HTMLElement;
  private minScale: number;
  private maxScale: number;
  private transform: GestureTransform;
  private onTransformChange: (transform: GestureTransform) => void;
  private isElevationLocked = false;

  // Touch tracking state
  private isPointerDown = false;
  private initialTouchDistance = 0;
  private initialTouchAngle = 0;
  private startScale = 1.0;
  private startRotation = 0.0;
  private lastPointerX = 0;
  private lastPointerY = 0;

  constructor(options: GestureControllerOptions) {
    this.domElement = options.domElement;
    this.minScale = options.minScale ?? 0.5;
    this.maxScale = options.maxScale ?? 2.0;
    this.isElevationLocked = options.elevationLock ?? false;
    this.transform = {
      scale: options.defaultScale ?? 1.0,
      rotationZ: 0.0,
      offsetX: 0.0,
      offsetY: 0.0,
    };
    this.onTransformChange = options.onTransformChange;

    this.bindEvents();
  }

  private bindEvents() {
    this.domElement.addEventListener("touchstart", this.onTouchStart, { passive: false });
    this.domElement.addEventListener("touchmove", this.onTouchMove, { passive: false });
    this.domElement.addEventListener("touchend", this.onTouchEnd);
    this.domElement.addEventListener("touchcancel", this.onTouchEnd);

    // Mouse fallbacks for desktop preview testing
    this.domElement.addEventListener("mousedown", this.onMouseDown);
    window.addEventListener("mousemove", this.onMouseMove);
    window.addEventListener("mouseup", this.onMouseUp);
    this.domElement.addEventListener("wheel", this.onWheel, { passive: false });
  }

  public destroy() {
    this.domElement.removeEventListener("touchstart", this.onTouchStart);
    this.domElement.removeEventListener("touchmove", this.onTouchMove);
    this.domElement.removeEventListener("touchend", this.onTouchEnd);
    this.domElement.removeEventListener("touchcancel", this.onTouchEnd);

    this.domElement.removeEventListener("mousedown", this.onMouseDown);
    window.removeEventListener("mousemove", this.onMouseMove);
    window.removeEventListener("mouseup", this.onMouseUp);
    this.domElement.removeEventListener("wheel", this.onWheel);
  }

  private onTouchStart = (e: TouchEvent) => {
    if (e.touches.length === 1) {
      // 1 Finger: Drag / Move
      this.isPointerDown = true;
      const touch = e.touches[0]!;
      this.lastPointerX = touch.clientX;
      this.lastPointerY = touch.clientY;
    } else if (e.touches.length === 2) {
      // 2 Fingers: Pinch-to-scale & two-finger rotate
      e.preventDefault();
      this.isPointerDown = true;
      const t1 = e.touches[0]!;
      const t2 = e.touches[1]!;

      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      this.initialTouchDistance = Math.hypot(dx, dy);
      this.initialTouchAngle = Math.atan2(dy, dx);
      this.startScale = this.transform.scale;
      this.startRotation = this.transform.rotationZ;
    }
  };

  private onTouchMove = (e: TouchEvent) => {
    if (!this.isPointerDown) return;

    if (e.touches.length === 1) {
      // 1 Finger Drag along wall
      const touch = e.touches[0]!;
      const deltaX = (touch.clientX - this.lastPointerX) * 0.002;
      const deltaY = -(touch.clientY - this.lastPointerY) * 0.002; // Invert Y for 3D space

      this.lastPointerX = touch.clientX;
      this.lastPointerY = touch.clientY;

      this.transform.offsetX += deltaX;
      if (!this.isElevationLocked) {
        this.transform.offsetY += deltaY;
      }

      this.onTransformChange(this.transform);
    } else if (e.touches.length === 2) {
      // 2 Fingers Pinch & Rotate
      e.preventDefault();
      const t1 = e.touches[0]!;
      const t2 = e.touches[1]!;

      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      const currentDistance = Math.hypot(dx, dy);
      const currentAngle = Math.atan2(dy, dx);

      if (this.initialTouchDistance > 0) {
        const ratio = currentDistance / this.initialTouchDistance;
        const newScale = this.startScale * ratio;
        // Strict boundary clamp
        this.transform.scale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
      }

      const angleDiff = currentAngle - this.initialTouchAngle;
      this.transform.rotationZ = this.startRotation + angleDiff;

      this.onTransformChange(this.transform);
    }
  };

  private onTouchEnd = (e: TouchEvent) => {
    if (e.touches.length === 0) {
      this.isPointerDown = false;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0]!;
      this.lastPointerX = touch.clientX;
      this.lastPointerY = touch.clientY;
    }
  };

  private onMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    this.isPointerDown = true;
    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;
  };

  private onMouseMove = (e: MouseEvent) => {
    if (!this.isPointerDown) return;
    const deltaX = (e.clientX - this.lastPointerX) * 0.002;
    const deltaY = -(e.clientY - this.lastPointerY) * 0.002;

    this.lastPointerX = e.clientX;
    this.lastPointerY = e.clientY;

    this.transform.offsetX += deltaX;
    if (!this.isElevationLocked) {
      this.transform.offsetY += deltaY;
    }

    this.onTransformChange(this.transform);
  };

  private onMouseUp = () => {
    this.isPointerDown = false;
  };

  private onWheel = (e: WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    const newScale = this.transform.scale * factor;
    this.transform.scale = Math.max(this.minScale, Math.min(this.maxScale, newScale));
    this.onTransformChange(this.transform);
  };

  public setElevationLock(locked: boolean) {
    this.isElevationLocked = locked;
  }

  public getElevationLock(): boolean {
    return this.isElevationLocked;
  }

  /**
   * Finely shifts the artwork elevation up/down in meters (e.g. +0.05 for +5cm)
   */
  public adjustElevation(deltaM: number) {
    this.transform.offsetY += deltaM;
    this.onTransformChange(this.transform);
  }

  public resetElevation() {
    this.transform.offsetY = 0;
    this.onTransformChange(this.transform);
  }

  public reset() {
    this.transform = {
      scale: 1.0,
      rotationZ: 0.0,
      offsetX: 0.0,
      offsetY: 0.0,
    };
    this.onTransformChange(this.transform);
  }

  public setScale(scale: number) {
    this.transform.scale = Math.max(this.minScale, Math.min(this.maxScale, scale));
    this.onTransformChange(this.transform);
  }

  public getTransform(): GestureTransform {
    return { ...this.transform };
  }
}
