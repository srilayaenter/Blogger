"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

type Locale = "en" | "ta";

const LABELS = {
  en: {
    eyebrow: "SriLaYa Recipes",
    headline: "Indian Recipes: A Bilingual Collection",
    supporting:
      "A bilingual collection of Indian recipes, preserved from a printed cookbook and translated for home cooks everywhere.",
    searchLabel: "Search recipes",
    searchPlaceholder: "Search recipes",
    searchSubmit: "Search",
  },
  ta: {
    eyebrow: "ஸ்ரீலயா சமையல் குறிப்புகள்",
    headline: "இந்திய சமையல் குறிப்புகள் இருமொழித் தொகுப்பு",
    supporting:
      "அச்சிடப்பட்ட சமையல் புத்தகத்திலிருந்து பாதுகாக்கப்பட்ட, இருமொழி இந்திய சமையல் குறிப்புகளின் தொகுப்பு.",
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
    <section className="relative overflow-hidden rounded-3xl px-6 py-10 shadow-lg sm:px-10 md:py-14">
      {/* Real spice/wood photography behind a brand-tinted gradient, replacing the old flat-color +
          CSS-blob background so the hero reads as photographed rather than illustrated. */}
      <Image
        src="/images/hero-bg.jpg"
        alt=""
        fill
        priority
        sizes="(min-width: 896px) 900px, 100vw"
        className="object-cover"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-brand-dark/70 via-brand-dark/45 to-brand/20"
      />

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

        <div aria-hidden="true" className="relative hidden h-64 items-center justify-center md:flex">
          <div className="relative h-56 w-full max-w-[220px] -rotate-3 overflow-hidden rounded-2xl shadow-xl ring-4 ring-white/25 transition-transform duration-300 hover:rotate-0">
            <Image src="/images/hero-collage.jpg" alt="" fill sizes="220px" className="object-cover" />
          </div>
        </div>
      </div>
    </section>
  );
}
