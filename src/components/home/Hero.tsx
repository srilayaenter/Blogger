"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Locale = "en" | "ta";

const LABELS = {
  en: {
    headline: "Preserving Tamil recipes, one dish at a time.",
    supporting:
      "A bilingual collection of Tamil recipes, preserved from a printed cookbook and translated for home cooks everywhere.",
    searchLabel: "Search recipes",
    searchPlaceholder: "Search recipes",
    searchSubmit: "Search",
  },
  ta: {
    headline: "தமிழ் சமையல் குறிப்புகளைப் பாதுகாக்கிறோம்.",
    supporting:
      "அச்சிடப்பட்ட சமையல் புத்தகத்திலிருந்து பாதுகாக்கப்பட்ட, இருமொழி தமிழ் சமையல் குறிப்புகளின் தொகுப்பு.",
    searchLabel: "சமையல் குறிப்புகளைத் தேடுங்கள்",
    searchPlaceholder: "சமையல் குறிப்புகளைத் தேடுங்கள்",
    searchSubmit: "தேடு",
  },
} satisfies Record<Locale, Record<string, string>>;

// A homepage-only search entry point: submitting always navigates to /[locale]/recipes/,
// where RecipeSearch owns all actual filtering. This form holds no filtered results itself,
// so there is only ever one search implementation on the site.
export function Hero({ locale }: { locale: Locale }) {
  const t = LABELS[locale];
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    router.push(
      trimmed ? `/${locale}/recipes/?q=${encodeURIComponent(trimmed)}` : `/${locale}/recipes/`,
    );
  }

  return (
    <section className="grid items-center gap-6 py-6 md:grid-cols-2 md:gap-10 md:py-10">
      <div>
        <h1 className="text-3xl font-bold text-brand-dark md:text-4xl">{t.headline}</h1>
        <p className="mt-3 max-w-md text-neutral-600">{t.supporting}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex max-w-md gap-2">
          <div className="flex-1">
            <label htmlFor="hero-recipe-search" className="sr-only">
              {t.searchLabel}
            </label>
            <input
              id="hero-recipe-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t.searchPlaceholder}
              autoComplete="off"
              className="w-full rounded-lg border border-neutral-200 bg-white px-4 py-2.5 text-sm focus:border-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
            />
          </div>
          <button
            type="submit"
            className="shrink-0 rounded-lg bg-brand px-4 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-dark"
          >
            {t.searchSubmit}
          </button>
        </form>
      </div>

      <div
        aria-hidden="true"
        className="relative h-24 overflow-hidden rounded-2xl md:h-56 md:rounded-3xl"
      >
        <div className="absolute inset-0 bg-brand-light" />
        <div className="absolute top-2 right-6 h-16 w-16 rounded-full bg-brand md:top-6 md:right-10 md:h-28 md:w-28" />
        <div className="absolute bottom-2 left-6 h-12 w-12 rounded-full bg-brand-accent md:bottom-6 md:left-10 md:h-20 md:w-20" />
        <div className="absolute top-1/2 left-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rotate-45 rounded-lg bg-brand-dark md:h-16 md:w-16 md:rounded-2xl" />
      </div>
    </section>
  );
}
