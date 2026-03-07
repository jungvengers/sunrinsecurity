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

// 마감 시각을 해당 분의 끝(59.999초)으로 보정
export function toEndOfMinute(date: Date): Date {
  const d = new Date(date);
  if (d.getSeconds() === 0 && d.getMilliseconds() === 0) {
    d.setSeconds(59, 999);
  }
  return d;
}
