"use client";

/**
 * Swaps only the leading locale segment of the current path (CLAUDE.md section 16: "The
 * language switcher changes only the locale segment"). Needs usePathname(), so this is the one
 * layout component that has to be a Client Component.
 *
 * TODO: these two labels belong in src/lib/i18n/dictionaries once that stage exists (CLAUDE.md
 * section 29) -- inlined here for now since that file list is out of scope for this stage.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";

const SUPPORTED_LOCALES = ["en", "ta"] as const;
type Locale = (typeof SUPPORTED_LOCALES)[number];

const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  ta: "தமிழ்",
};

function pathForLocale(pathname: string, targetLocale: Locale): string {
  const segments = pathname.split("/");
  // segments[0] is always "" (path starts with "/"); segments[1] is the current locale.
  segments[1] = targetLocale;
  return segments.join("/") || "/";
}

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname();

  return (
    <nav aria-label="Language switcher" className="flex gap-2 text-sm">
      {SUPPORTED_LOCALES.map((candidate) => (
        <Link
          key={candidate}
          href={pathForLocale(pathname, candidate)}
          aria-current={candidate === locale ? "true" : undefined}
          className={
            candidate === locale
              ? "font-semibold underline"
              : "text-neutral-500 hover:text-neutral-800"
          }
        >
          {LOCALE_LABELS[candidate]}
        </Link>
      ))}
    </nav>
  );
}
