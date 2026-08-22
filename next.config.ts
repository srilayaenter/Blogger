import type { NextConfig } from "next";

// Cloudflare Pages deployment target -- see docs/cloudflare-pages-deployment.md.
// No database, no API routes, no server runtime: everything is prerendered from
// content/*.json at build time into a static out/ directory.
const nextConfig: NextConfig = {
  output: "export",
  // Required whenever next/image is used under output: "export" (no Image Optimization API is
  // available for static hosting). Not currently used by any component, but set defensively so
  // adding next/image later doesn't hard-fail the build.
  images: { unoptimized: true },
};

export default nextConfig;
