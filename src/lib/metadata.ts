/**
 * Shared metadata constants/helpers for the Metadata API (generateMetadata, robots.ts,
 * sitemap.ts). One source of truth for the production URL and OG defaults so every page builds
 * URLs the same way instead of re-deriving them.
 */

export const SITE_URL = "https://blogger-8js.pages.dev";

export const SUPPORTED_LOCALES = ["en", "ta"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const SITE_NAME: Record<Locale, string> = {
  en: "SriLaYa Recipes",
  ta: "ஸ்ரீலயா சமையல் குறிப்புகள்",
};

/** BCP 47 locale tags for og:locale / og:locale:alternate. */
export const OG_LOCALE: Record<Locale, string> = {
  en: "en_IN",
  ta: "ta_IN",
};

export const OG_ALTERNATE_LOCALE: Record<Locale, string> = {
  en: "ta_IN",
  ta: "en_IN",
};

export function absoluteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

/** Swap the leading locale segment of a `/xx/...` path to build the equivalent path in `locale`. */
export function localePath(path: string, locale: Locale): string {
  const segments = path.split("/");
  segments[1] = locale;
  return segments.join("/");
}

/** Absolute en/ta URLs for the same page, for `alternates.languages`. */
export function languageAlternates(currentPath: string): Record<Locale, string> {
  return {
    en: absoluteUrl(localePath(currentPath, "en")),
    ta: absoluteUrl(localePath(currentPath, "ta")),
  };
}

/**
 * Next.js does not deep-merge the `openGraph` object between a layout's generateMetadata and a
 * page's own -- once a page defines its own `openGraph`, siteName/locale/alternateLocale from the
 * layout are dropped, not inherited. Every page-level `openGraph` must spread this in explicitly.
 */
export function baseOpenGraph(locale: Locale) {
  return {
    siteName: SITE_NAME[locale],
    locale: OG_LOCALE[locale],
    alternateLocale: OG_ALTERNATE_LOCALE[locale],
  };
}

const FALLBACK_OG_IMAGE_ALT: Record<Locale, string> = {
  en: "SriLaYa Recipes — Traditional Tamil recipes, prepared simply",
  ta: "ஸ்ரீலயா சமையல் குறிப்புகள்",
};

/** The one shared branded OG image (public/images/og/fallback.png), used unless a page has its own. */
export function fallbackOgImage(locale: Locale) {
  return {
    url: absoluteUrl("/images/og/fallback.png"),
    width: 1200,
    height: 630,
    alt: FALLBACK_OG_IMAGE_ALT[locale],
  };
}

const RASTER_IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

/**
 * Most social crawlers (Facebook, Twitter/X) don't reliably render SVG for og:image -- and every
 * recipe with a featured_image_url today is an SVG placeholder (see the 3 demo recipes). Only use
 * a recipe's own image for OG once it's a real raster photo; otherwise fall back to the shared
 * branded image. The on-page <img> is unaffected -- it keeps using whatever featured_image_url
 * points to, SVG included.
 */
export function isOgSafeImage(url: string): boolean {
  const lower = url.toLowerCase();
  return RASTER_IMAGE_EXTENSIONS.some((ext) => lower.endsWith(ext));
}
