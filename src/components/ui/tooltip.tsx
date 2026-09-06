"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TooltipContextValue {
  visible: boolean;
  setVisible: (val: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | null>(null);

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function Tooltip({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = React.useState(false);
  return (
    <TooltipContext.Provider value={{ visible, setVisible }}>
      <div className="relative inline-flex">{children}</div>
    </TooltipContext.Provider>
  );
}

export function TooltipTrigger({
  children,
  asChild,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { asChild?: boolean }) {
  const context = React.useContext(TooltipContext);

  const eventHandlers = {
    onMouseEnter: () => context?.setVisible(true),
    onMouseLeave: () => context?.setVisible(false),
    onFocus: () => context?.setVisible(true),
    onBlur: () => context?.setVisible(false),
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      ...eventHandlers,
      className: cn((children as React.ReactElement<any>).props.className, className),
    });
  }

  return (
    <span className={cn("inline-flex cursor-pointer", className)} {...eventHandlers} {...props}>
      {children}
    </span>
  );
}

export function TooltipContent({
  className,
  side = "top",
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  side?: "top" | "bottom" | "left" | "right";
}) {
  const context = React.useContext(TooltipContext);
  if (!context?.visible) return null;

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  return (
    <div
      role="tooltip"
      className={cn(
        "absolute z-50 whitespace-nowrap rounded-md border border-[#262833] bg-[#14151a] px-2.5 py-1 text-[11px] font-medium tracking-wide text-[#f4f4f6] shadow-xl animate-in fade-in-0 zoom-in-95 pointer-events-none",
        positionClasses[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
