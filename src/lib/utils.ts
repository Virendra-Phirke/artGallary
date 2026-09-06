import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | null | undefined, currency = "USD"): string {
  if (amount === null || amount === undefined) return "Price on inquiry";
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return "Price on inquiry";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatDimensions(
  widthCm: number | string | null | undefined,
  heightCm: number | string | null | undefined,
  depthCm?: number | string | null | undefined
): string {
  if (!widthCm || !heightCm) return "Dimensions upon request";
  const w = parseFloat(String(widthCm));
  const h = parseFloat(String(heightCm));
  const wIn = (w / 2.54).toFixed(1);
  const hIn = (h / 2.54).toFixed(1);

  if (depthCm) {
    const d = parseFloat(String(depthCm));
    const dIn = (d / 2.54).toFixed(1);
    return `${w} × ${h} × ${d} cm (${wIn}″ × ${hIn}″ × ${dIn}″)`;
  }

  return `${w} × ${h} cm (${wIn}″ × ${hIn}″)`;
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w-]+/g, "")
    .replace(/--+/g, "-");
}
