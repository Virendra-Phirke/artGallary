"use client";

import React, { useRef, createContext, useContext } from "react";
import {
  motion,
  MotionValue,
  useMotionValue,
  useSpring,
  useTransform,
} from "motion/react";
import type { MotionProps } from "motion/react";
import { cn } from "@/lib/utils";

export interface DockProps {
  className?: string;
  iconSize?: number;
  iconMagnification?: number;
  disableMagnification?: boolean;
  iconDistance?: number;
  direction?: "top" | "middle" | "bottom";
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
}

const DEFAULT_SIZE = 40;
const DEFAULT_MAGNIFICATION = 45;
const DEFAULT_DISTANCE = 70;
const DEFAULT_DISABLEMAGNIFICATION = false;

interface DockContextType {
  mouseCoord: MotionValue<number>;
  orientation: "horizontal" | "vertical";
  iconSize: number;
  iconMagnification: number;
  disableMagnification: boolean;
  iconDistance: number;
}

const DockContext = createContext<DockContextType | null>(null);

const Dock = React.forwardRef<HTMLDivElement, DockProps>(
  (
    {
      className,
      children,
      iconSize = DEFAULT_SIZE,
      iconMagnification = DEFAULT_MAGNIFICATION,
      disableMagnification = DEFAULT_DISABLEMAGNIFICATION,
      iconDistance = DEFAULT_DISTANCE,
      direction = "middle",
      orientation = "vertical",
      ...props
    },
    ref
  ) => {
    const mouseCoord = useMotionValue(Infinity);

    return (
      <DockContext.Provider
        value={{
          mouseCoord,
          orientation,
          iconSize,
          iconMagnification,
          disableMagnification,
          iconDistance,
        }}
      >
        <motion.div
          ref={ref}
          onMouseMove={(e) => {
            const coord = orientation === "vertical" ? e.clientY : e.clientX;
            mouseCoord.set(coord);
          }}
          onMouseLeave={() => mouseCoord.set(Infinity)}
          {...props}
          className={cn(
            "flex items-center justify-center rounded-2xl border border-[#262833] bg-[#0f1013]/90 shadow-2xl backdrop-blur-xl transition-all select-none",
            orientation === "vertical"
              ? "flex-col w-[62px] h-max py-3 px-2 gap-1.5"
              : "flex-row h-[58px] w-max px-3 py-2 gap-2",
            {
              "items-start": direction === "top",
              "items-center": direction === "middle",
              "items-end": direction === "bottom",
            },
            className
          )}
        >
          {children}
        </motion.div>
      </DockContext.Provider>
    );
  }
);

Dock.displayName = "Dock";

export interface DockIconProps
  extends Omit<
    MotionProps & React.HTMLAttributes<HTMLDivElement>,
    "children"
  > {
  size?: number;
  magnification?: number;
  disableMagnification?: boolean;
  distance?: number;
  mouseCoord?: MotionValue<number>;
  orientation?: "horizontal" | "vertical";
  className?: string;
  children?: React.ReactNode;
}

const DockIcon = ({
  size,
  magnification,
  disableMagnification,
  distance,
  mouseCoord,
  orientation,
  className,
  children,
  ...props
}: DockIconProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const context = useContext(DockContext);
  const fallbackCoord = useMotionValue(Infinity);

  const effectiveOrientation =
    orientation ?? context?.orientation ?? "vertical";
  const effectiveSize = size ?? context?.iconSize ?? DEFAULT_SIZE;
  const effectiveMagnification =
    magnification ?? context?.iconMagnification ?? DEFAULT_MAGNIFICATION;
  const effectiveDistance =
    distance ?? context?.iconDistance ?? DEFAULT_DISTANCE;
  const effectiveDisable =
    disableMagnification ?? context?.disableMagnification ?? DEFAULT_DISABLEMAGNIFICATION;
  const effectiveCoord = mouseCoord ?? context?.mouseCoord ?? fallbackCoord;

  const distanceCalc = useTransform(effectiveCoord, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      y: 0,
      width: 0,
      height: 0,
    };

    if (effectiveOrientation === "vertical") {
      return val - (bounds.y + bounds.height / 2);
    }
    return val - (bounds.x + bounds.width / 2);
  });

  const targetSize = effectiveDisable ? effectiveSize : effectiveMagnification;

  const sizeTransform = useTransform(
    distanceCalc,
    [-effectiveDistance, 0, effectiveDistance],
    [effectiveSize, targetSize, effectiveSize]
  );

  const scaleSize = useSpring(sizeTransform, {
    mass: 0.1,
    stiffness: 150,
    damping: 12,
  });

  return (
    <motion.div
      ref={ref}
      style={{
        width: scaleSize,
        height: scaleSize,
      }}
      className={cn(
        "flex aspect-square cursor-pointer items-center justify-center rounded-xl transition-colors duration-150 select-none",
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center w-full h-full pointer-events-none">
        {children}
      </div>
    </motion.div>
  );
};

DockIcon.displayName = "DockIcon";

export { Dock, DockIcon, DockContext };
