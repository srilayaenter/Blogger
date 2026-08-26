"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Locale = "en" | "ta";

const LABELS = {
  en: { siteName: "SriLaYa Recipes", home: "Home", recipes: "Recipes", categories: "Categories" },
  ta: {
    siteName: "ஸ்ரீலயா சமையல் குறிப்புகள்",
    home: "முகப்பு",
    recipes: "சமையல் குறிப்புகள்",
    categories: "வகைகள்",
  },
} satisfies Record<Locale, Record<string, string>>;

export function Header({ locale }: { locale: Locale }) {
  const t = LABELS[locale];
  const pathname = usePathname();
  const homeHref = `/${locale}`;
  const isHome = pathname === homeHref || pathname === `${homeHref}/`;

  return (
    <header className="border-b-2 border-brand">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 p-4">
        <Link href={homeHref} className="text-lg font-bold text-brand">
          {t.siteName}
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link
            href={homeHref}
            aria-current={isHome ? "page" : undefined}
            className={isHome ? "font-semibold text-brand" : "font-medium hover:text-brand"}
          >
            {t.home}
          </Link>
          <Link href={`/${locale}/recipes`} className="font-medium hover:text-brand">
            {t.recipes}
          </Link>
          <Link href={`/${locale}/categories`} className="font-medium hover:text-brand">
            {t.categories}
          </Link>
          <LanguageSwitcher locale={locale} />
        </nav>
      </div>
    </header>
  );
}
