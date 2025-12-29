import NextImage, { ImageProps } from "next/image";

/**
 * /storage/ 경로 이미지는 자동으로 unoptimized 적용
 * Next.js Image 최적화가 서버에서 fetch할 때 내부 네트워크 문제를 피함
 */
export function StorageImage(props: ImageProps) {
  const src = typeof props.src === "string" ? props.src : "";
  const isStoragePath = src.startsWith("/storage/");

  return <NextImage {...props} unoptimized={isStoragePath || props.unoptimized} />;
}
