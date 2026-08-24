import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/metadata";

// Required for output: "export" -- without this, Next treats robots.ts as potentially dynamic
// and the static export build fails.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
