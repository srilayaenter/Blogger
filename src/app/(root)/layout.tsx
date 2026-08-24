import type { Metadata } from "next";
import "../globals.css";

/**
 * Root layout for the bare `/` redirect stub only (see ./page.tsx). This is a separate "root"
 * from src/app/[locale]/layout.tsx -- Next.js's documented "multiple root layouts" pattern via
 * route groups. There is no shared top-level app/layout.tsx: each top-level segment ((root) and
 * [locale]) supplies its own <html>/<body>, which is what lets [locale]/layout.tsx set a real,
 * static, crawler-visible `lang` per locale instead of a single hardcoded value for the whole
 * app. This page's own `lang="en"` is a reasonable fixed default -- it has no real content, and
 * in production Cloudflare's public/_redirects intercepts `/` at the edge before this HTML is
 * ever served (see docs/cloudflare-pages-deployment.md).
 */
export const metadata: Metadata = {
  title: "SriLaYa Recipes",
  description: "Bilingual Tamil-English recipe collection",
};

export default function RootRedirectLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
