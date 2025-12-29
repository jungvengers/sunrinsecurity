"use client";

import type { ImageLoaderProps } from "next/image";

export default function storageImageLoader({
  src,
  width,
  quality,
}: ImageLoaderProps): string {
  // 상대 경로 /storage/는 그대로 사용 (nginx가 처리)
  if (src.startsWith("/storage/")) {
    return `${src}?w=${width}&q=${quality || 75}`;
  }
  // 외부 URL은 Next.js 기본 최적화 사용
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${
    quality || 75
  }`;
}
