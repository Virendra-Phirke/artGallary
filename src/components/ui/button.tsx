import * as React from "react";
import { cva, type VariantProps } from "@/lib/cva";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-xs font-semibold uppercase tracking-wider transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#d1a86e] disabled:pointer-events-none disabled:opacity-50 select-none cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[#d1a86e] text-[#0d0e12] hover:bg-[#e2c18d] shadow-md shadow-[#d1a86e]/15",
        destructive:
          "bg-red-600 text-white hover:bg-red-700 shadow-sm",
        outline:
          "border border-[#262833] bg-transparent text-[#f4f4f6] hover:bg-[#1a1c23] hover:border-[#d1a86e] hover:text-[#d1a86e]",
        secondary:
          "bg-[#1a1c23] text-[#f4f4f6] border border-[#262833] hover:bg-[#22242d]",
        ghost:
          "text-zinc-400 hover:bg-[#1a1c23] hover:text-[#f4f4f6]",
        link:
          "text-[#d1a86e] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-[11px]",
        lg: "h-11 rounded-xl px-7 text-xs font-bold",
        icon: "h-9 w-9 rounded-lg p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, children, ...props }, ref) => {
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        ref,
        className: cn(
          buttonVariants({ variant, size }),
          (children.props as any)?.className,
          className
        ),
        ...props,
      });
    }

    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
