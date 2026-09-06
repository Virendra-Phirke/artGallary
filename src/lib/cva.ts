import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export type VariantProps<T extends (...args: any) => any> =
  T extends (props?: infer P) => any
    ? P extends undefined
      ? Record<string, never>
      : NonNullable<P>
    : Record<string, never>;

export function cva<T extends Record<string, Record<string, ClassValue>>>(
  base?: ClassValue,
  config?: {
    variants?: T;
    defaultVariants?: {
      [K in keyof T]?: keyof T[K];
    };
  }
) {
  return (props?: {
    [K in keyof T]?: keyof T[K];
  } & { className?: string }): string => {
    const classes: ClassValue[] = [base];

    if (config?.variants) {
      for (const variantKey in config.variants) {
        const selected =
          props?.[variantKey] ?? config.defaultVariants?.[variantKey];
        if (selected && config.variants[variantKey]?.[selected as string]) {
          classes.push(config.variants[variantKey][selected as string]);
        }
      }
    }

    if (props?.className) {
      classes.push(props.className);
    }

    return twMerge(clsx(classes));
  };
}
