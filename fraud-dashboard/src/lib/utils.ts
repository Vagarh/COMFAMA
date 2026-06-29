import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function fmt(n: number, decimals = 0) {
  return new Intl.NumberFormat("es-CO", { maximumFractionDigits: decimals }).format(n);
}

export function fmtUSD(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function fmtPct(n: number, decimals = 1) {
  return `${n.toFixed(decimals)}%`;
}
