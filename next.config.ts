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
  // Without this, `next build` writes each route as BOTH a sibling "<route>.html" file AND a
  // same-named directory containing only internal RSC payloads (no index.html). Cloudflare Pages
  // resolves a clean-URL request like /en/recipes/ragi-dosa against that empty directory first,
  // finds no index.html, and 404s -- it never falls back to the sibling .html file. Setting this
  // makes every route emit a real index.html inside its own directory instead, which every
  // static host (Cloudflare Pages included) resolves unambiguously. next/link normalizes hrefs
  // to match automatically; no component changes needed.
  trailingSlash: true,
};

export default nextConfig;
