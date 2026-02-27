import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCycleName(year: number, name: string) {
  const yearPrefix = `${year}년`;
  const normalizedName = name.trim().startsWith(yearPrefix)
    ? name.trim().slice(yearPrefix.length).trim()
    : name.trim();
  return `${yearPrefix} ${normalizedName}`.trim();
}
