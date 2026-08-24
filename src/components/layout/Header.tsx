import Link from "next/link";
import { LanguageSwitcher } from "./LanguageSwitcher";

type Locale = "en" | "ta";

const LABELS = {
  en: { siteName: "SriLaYa Recipes", recipes: "Recipes", categories: "Categories" },
  ta: {
    siteName: "ஸ்ரீலயா சமையல் குறிப்புகள்",
    recipes: "சமையல் குறிப்புகள்",
    categories: "வகைகள்",
  },
} satisfies Record<Locale, Record<string, string>>;

export function Header({ locale }: { locale: Locale }) {
  const t = LABELS[locale];

  return (
    <header className="border-b-2 border-brand">
      <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 p-4">
        <Link href={`/${locale}`} className="text-lg font-bold text-brand">
          {t.siteName}
        </Link>
        <nav className="flex items-center gap-4 text-sm">
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
