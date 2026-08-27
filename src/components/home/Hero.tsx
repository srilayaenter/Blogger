"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Locale = "en" | "ta";

const LABELS = {
  en: {
    eyebrow: "SriLaYa Recipes",
    headline: "Preserving Tamil recipes, one dish at a time.",
    supporting:
      "A bilingual collection of Tamil recipes, preserved from a printed cookbook and translated for home cooks everywhere.",
    searchLabel: "Search recipes",
    searchPlaceholder: "Search recipes",
    searchSubmit: "Search",
  },
  ta: {
    eyebrow: "ஸ்ரீலயா சமையல் குறிப்புகள்",
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
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-dark via-brand to-brand px-6 py-10 shadow-lg sm:px-10 md:py-14">
      {/* Decorative background texture -- CSS-only, no image assets. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-16 -right-16 h-56 w-56 rounded-full bg-brand-accent/20 blur-2xl md:h-72 md:w-72" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-brand-light/10 blur-2xl md:h-64 md:w-64" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)] bg-[length:20px_20px] opacity-40" />
      </div>

      <div className="relative grid items-center gap-8 md:grid-cols-[2fr_1fr] md:gap-12">
        <div className="min-w-0">
          <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold tracking-wide text-white uppercase backdrop-blur-sm">
            {t.eyebrow}
          </span>
          <h1 className="mt-4 break-words text-3xl leading-tight font-bold text-white md:text-4xl">
            {t.headline}
          </h1>
          <p className="mt-4 max-w-md text-sm text-white/85 md:text-base">{t.supporting}</p>

          <form onSubmit={handleSubmit} className="mt-7 flex max-w-md gap-2">
            <div className="relative flex-1">
              <label htmlFor="hero-recipe-search" className="sr-only">
                {t.searchLabel}
              </label>
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-neutral-400"
              >
                <path
                  d="M9 16A7 7 0 1 0 9 2a7 7 0 0 0 0 14Zm9 2-4.35-4.35"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <input
                id="hero-recipe-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={t.searchPlaceholder}
                autoComplete="off"
                className="w-full rounded-full border-0 bg-white py-3 pr-4 pl-10 text-sm text-neutral-800 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-accent"
              />
            </div>
            <button
              type="submit"
              className="shrink-0 rounded-full bg-brand-accent px-5 py-3 text-sm font-semibold text-brand-dark shadow-md transition hover:brightness-105 focus-visible:[outline:3px_solid_white] focus-visible:outline-offset-2"
            >
              {t.searchSubmit}
            </button>
          </form>
        </div>

        <div aria-hidden="true" className="relative hidden h-64 md:block">
          {/* Editorial "recipe card" collage motif -- CSS shapes only, matching the brand palette. */}
          <div className="absolute top-4 right-4 h-48 w-40 rotate-3 rounded-2xl bg-white/95 p-4 shadow-xl transition-transform duration-300 hover:rotate-0">
            <div className="h-20 w-full rounded-lg bg-gradient-to-br from-brand-light to-brand/20" />
            <div className="mt-3 h-2.5 w-4/5 rounded-full bg-neutral-200" />
            <div className="mt-2 h-2.5 w-3/5 rounded-full bg-neutral-200" />
            <div className="mt-3 flex gap-1.5">
              <span className="h-5 w-14 rounded-full bg-brand-light" />
              <span className="h-5 w-10 rounded-full bg-brand-light" />
            </div>
          </div>
          <div className="absolute top-16 left-0 h-40 w-32 -rotate-6 rounded-2xl bg-white/90 p-3 shadow-lg">
            <div className="h-16 w-full rounded-lg bg-gradient-to-br from-brand-accent/30 to-brand-accent/10" />
            <div className="mt-2.5 h-2 w-full rounded-full bg-neutral-200" />
            <div className="mt-1.5 h-2 w-2/3 rounded-full bg-neutral-200" />
          </div>
        </div>
      </div>
    </section>
  );
}
