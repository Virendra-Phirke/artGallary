"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

interface DropdownMenuContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  containerRef: React.RefObject<HTMLDivElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextValue | null>(null);

function useDropdownMenu() {
  const context = React.useContext(DropdownMenuContext);
  if (!context) {
    throw new Error("DropdownMenu components must be used within <DropdownMenu />");
  }
  return context;
}

export function DropdownMenu({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const contentRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        contentRef.current?.contains(target) ||
        containerRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <DropdownMenuContext.Provider value={{ open, setOpen, containerRef, contentRef }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  );
}

export function DropdownMenuTrigger({
  children,
  asChild,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { asChild?: boolean }) {
  const { open, setOpen } = useDropdownMenu();

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        setOpen(!open);
      },
    });
  }

  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownMenuContent({
  children,
  className,
  align = "end",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { align?: "start" | "end" | "center" }) {
  const { open, setOpen, containerRef, contentRef } = useDropdownMenu();
  const [mounted, setMounted] = React.useState(false);
  const [coords, setCoords] = React.useState<{
    top?: number;
    bottom?: number;
    left: number;
    maxHeight: number;
    placement: "top" | "bottom";
  } | null>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const calculatePosition = React.useCallback(() => {
    const anchor =
      (containerRef.current?.firstElementChild as HTMLElement) ||
      containerRef.current;
    if (!anchor) return null;
    const rect = anchor.getBoundingClientRect();

    // If trigger scrolled off viewport completely, dismiss menu
    if (rect.bottom < 0 || rect.top > window.innerHeight) {
      setOpen(false);
      return null;
    }

    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    // Prefer placing below unless there's not enough room below AND more room above
    const placeTop = spaceBelow < 280 && spaceAbove > spaceBelow;

    let top: number | undefined;
    let bottom: number | undefined;
    let maxHeight: number;

    if (placeTop) {
      bottom = window.innerHeight - rect.top + 6;
      maxHeight = Math.max(140, rect.top - 16);
    } else {
      top = rect.bottom + 6;
      maxHeight = Math.max(140, window.innerHeight - rect.bottom - 16);
    }

    const menuWidth = contentRef.current?.offsetWidth || 256;
    let left: number;
    if (align === "start") {
      left = rect.left;
    } else if (align === "end") {
      left = rect.right - menuWidth;
    } else {
      left = rect.left + (rect.width - menuWidth) / 2;
    }

    // Keep dropdown inside screen boundaries with 8px margin
    left = Math.max(8, Math.min(left, window.innerWidth - menuWidth - 8));

    return {
      top,
      bottom,
      left,
      maxHeight: Math.min(520, maxHeight),
      placement: placeTop ? ("top" as const) : ("bottom" as const),
    };
  }, [align, containerRef, contentRef, setOpen]);

  React.useLayoutEffect(() => {
    if (open) {
      const handleUpdate = () => {
        const next = calculatePosition();
        if (next) setCoords(next);
      };

      handleUpdate();
      // Re-measure after DOM paint with actual measured width & height
      const frameId = requestAnimationFrame(handleUpdate);

      window.addEventListener("resize", handleUpdate);
      window.addEventListener("scroll", handleUpdate, true);
      return () => {
        cancelAnimationFrame(frameId);
        window.removeEventListener("resize", handleUpdate);
        window.removeEventListener("scroll", handleUpdate, true);
      };
    } else {
      setCoords(null);
    }
  }, [open, calculatePosition]);

  // NEVER render when coords is null, preventing any top-left corner flash!
  if (!open || !mounted || !coords) return null;

  return createPortal(
    <div
      ref={contentRef}
      style={{
        position: "fixed",
        ...(coords.top !== undefined ? { top: `${coords.top}px` } : {}),
        ...(coords.bottom !== undefined ? { bottom: `${coords.bottom}px` } : {}),
        left: `${coords.left}px`,
        maxHeight: `${coords.maxHeight}px`,
        zIndex: 9999,
        backgroundColor: "#121319",
      }}
      className={cn(
        "min-w-[170px] max-w-[calc(100vw-16px)] overflow-y-auto rounded-xl border border-[#262833] bg-[#121319] p-1.5 text-xs text-[#f4f4f6] shadow-2xl shadow-black/95 overscroll-contain",
        coords.placement === "top"
          ? "animate-in fade-in-0 slide-in-from-bottom-2 duration-150"
          : "animate-in fade-in-0 slide-in-from-top-2 duration-150",
        className
      )}
      {...props}
    >
      {children}
    </div>,
    document.body
  );
}

export function DropdownMenuItem({
  children,
  className,
  asChild,
  onClick,
  closeOnClick = true,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { asChild?: boolean; closeOnClick?: boolean }) {
  const { setOpen } = useDropdownMenu();

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onClick: (e: React.MouseEvent) => {
        child.props.onClick?.(e);
        onClick?.(e as any);
        if (closeOnClick) setOpen(false);
      },
      className: cn(
        "flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-zinc-300 transition-colors hover:bg-[#1f212b] hover:text-white",
        child.props.className,
        className
      ),
    });
  }

  return (
    <div
      role="menuitem"
      onClick={(e) => {
        onClick?.(e);
        if (closeOnClick) setOpen(false);
      }}
      className={cn(
        "flex w-full cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-xs text-zinc-300 transition-colors hover:bg-[#1f212b] hover:text-white",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function DropdownMenuLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-zinc-500", className)}
      {...props}
    />
  );
}

export function DropdownMenuSeparator({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("-mx-1 my-1 h-px bg-[#262833]", className)}
      {...props}
    />
  );
}
