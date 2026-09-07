"use client";

import React from "react";
import {
  ProgressBar as AriaProgressBar,
  type ProgressBarProps as AriaProgressBarProps,
  Label,
} from "react-aria-components";
import { cn } from "@/lib/utils";

export function composeTailwindRenderProps<T>(
  className: string | ((values: T) => string) | undefined,
  tailwind: string
): string | ((values: T) => string) {
  return (values: T) => {
    return cn(tailwind, typeof className === "function" ? className(values) : className);
  };
}

export interface ProgressBarProps extends AriaProgressBarProps {
  label?: string;
  barClassName?: string;
}

export function ProgressBar({ label, barClassName, ...props }: ProgressBarProps) {
  return (
    <AriaProgressBar
      {...props}
      className={composeTailwindRenderProps(
        props.className,
        "flex flex-col gap-1.5 font-sans w-full"
      )}
    >
      {({ percentage, valueText, isIndeterminate }) => (
        <>
          <div className="flex justify-between items-center gap-2 text-xs">
            {label && (
              <Label className="text-zinc-300 font-medium tracking-wide">
                {label}
              </Label>
            )}
            <span className="text-xs font-mono text-[#d1a86e] font-semibold">
              {isIndeterminate ? "Processing..." : valueText || `${Math.round(percentage || 0)}%`}
            </span>
          </div>

          <div className="w-full h-2 rounded-full bg-neutral-800 border border-[#262833] relative overflow-hidden shadow-inner">
            {isIndeterminate ? (
              <div
                className={cn(
                  "absolute top-0 h-full w-2/5 rounded-full bg-gradient-to-r from-transparent via-[#d1a86e] to-transparent animate-[shimmer_1.5s_infinite]",
                  barClassName
                )}
                style={{ width: "45%" }}
              />
            ) : (
              <div
                className={cn(
                  "h-full rounded-full bg-[#d1a86e] transition-all duration-200 shadow-sm",
                  barClassName
                )}
                style={{ width: `${Math.min(100, Math.max(0, percentage || 0))}%` }}
              />
            )}
          </div>
        </>
      )}
    </AriaProgressBar>
  );
}
