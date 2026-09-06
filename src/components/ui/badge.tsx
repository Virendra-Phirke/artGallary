import * as React from "react";
import { cva, type VariantProps } from "@/lib/cva";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider transition-colors focus:outline-none focus:ring-2 focus:ring-[#d1a86e]",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[#d1a86e] text-[#0d0e12] shadow",
        secondary:
          "border-[#262833] bg-[#1a1c23] text-zinc-300",
        destructive:
          "border-transparent bg-red-950 text-red-300 border-red-800",
        outline:
          "text-[#f4f4f6] border-[#262833]",
        gold:
          "border-[#d1a86e]/30 bg-[#d1a86e]/15 text-[#d1a86e]",
        success:
          "border-emerald-800/80 bg-emerald-950/80 text-emerald-300",
        warning:
          "border-amber-800/80 bg-amber-950/80 text-amber-300",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof badgeVariants>;

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
