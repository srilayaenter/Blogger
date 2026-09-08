import Link from "next/link";
import type { AdjacentRecipe } from "@/lib/content/loader";

type Locale = "en" | "ta";

const LABELS = {
  en: { previous: "Previous", next: "Next", nav: "Recipe navigation" },
  ta: { previous: "முந்தையது", next: "அடுத்தது", nav: "சமையல் குறிப்பு வழிசெலுத்தல்" },
} satisfies Record<Locale, Record<string, string>>;

function ChevronLeft() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0">
      <path
        d="M12 4l-6 6 6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5 shrink-0">
      <path
        d="M8 4l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function RecipePrevNextNav({
  previous,
  next,
  locale,
}: {
  previous: AdjacentRecipe | null;
  next: AdjacentRecipe | null;
  locale: Locale;
}) {
  if (!previous && !next) return null;
  const t = LABELS[locale];

  return (
    <nav
      aria-label={t.nav}
      className="mt-8 grid grid-cols-2 gap-4 border-t border-neutral-100 pt-4 text-sm"
    >
      <div>
        {previous ? (
          <Link
            href={`/${locale}/recipes/${previous.slug}`}
            className="group flex items-center gap-1.5 text-neutral-600 hover:text-brand"
          >
            <ChevronLeft />
            <span className="min-w-0">
              <span className="block text-xs text-neutral-400 group-hover:text-brand">
                {t.previous}
              </span>
              <span className="block truncate font-medium text-brand-dark group-hover:text-brand">
                {locale === "ta" ? previous.title_ta : previous.title_en}
              </span>
            </span>
          </Link>
        ) : null}
      </div>
      <div className="text-right">
        {next ? (
          <Link
            href={`/${locale}/recipes/${next.slug}`}
            className="group flex items-center justify-end gap-1.5 text-neutral-600 hover:text-brand"
          >
            <span className="min-w-0">
              <span className="block text-xs text-neutral-400 group-hover:text-brand">
                {t.next}
              </span>
              <span className="block truncate font-medium text-brand-dark group-hover:text-brand">
                {locale === "ta" ? next.title_ta : next.title_en}
              </span>
            </span>
            <ChevronRight />
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
