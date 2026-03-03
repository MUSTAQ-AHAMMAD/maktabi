import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export is used when building for Capacitor (Android/iOS).
  // Running `npm run build:static` will produce the `out/` directory that
  // Capacitor copies into the native projects.
  output: process.env.NEXT_STATIC_EXPORT === "true" ? "export" : undefined,
};

export default nextConfig;
