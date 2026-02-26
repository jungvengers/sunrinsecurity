import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    // Disable built-in optimizer to reduce remote image attack surface.
    unoptimized: true,
  },
};

export default nextConfig;
