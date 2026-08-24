"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { RecipeWithDetails } from "@/types/recipe";
import { RecipeList } from "./RecipeList";

type Locale = "en" | "ta";

const LABELS = {
  en: {
    label: "Search recipes",
    placeholder: "Search recipes",
    clear: "Clear search",
    results: (n: number) => `${n} recipe${n === 1 ? "" : "s"} found`,
    noResults: "No recipes match your search.",
  },
  ta: {
    label: "சமையல் குறிப்புகளைத் தேடுங்கள்",
    placeholder: "சமையல் குறிப்புகளைத் தேடுங்கள்",
    clear: "தேடலை அழிக்கவும்",
    results: (n: number) => `${n} சமையல் குறிப்புகள் கிடைத்தன`,
    noResults: "உங்கள் தேடலுக்குப் பொருந்தும் சமையல் குறிப்புகள் இல்லை.",
  },
} satisfies Record<Locale, { label: string; placeholder: string; clear: string; results: (n: number) => string; noResults: string }>;

const URL_SYNC_DELAY_MS = 300;

// Lowercase (no-op on Tamil, correct for English), trim, and collapse repeated whitespace.
// Plain string methods are Unicode-safe, so this normalizes Tamil query/field text correctly
// without any special-casing.
function normalize(value: string): string {
  return value.toLowerCase().trim().replace(/\s+/g, " ");
}

function recipeMatchesQuery(recipe: RecipeWithDetails, normalizedQuery: string): boolean {
  if (!normalizedQuery) return true;

  const fields: string[] = [recipe.title_ta, recipe.title_en];
  for (const ingredient of recipe.ingredients) {
    fields.push(ingredient.name_ta, ingredient.name_en);
    if (ingredient.notes_ta) fields.push(ingredient.notes_ta);
    if (ingredient.notes_en) fields.push(ingredient.notes_en);
  }

  return fields.some((field) => normalize(field).includes(normalizedQuery));
}

export function RecipeSearch({
  recipes,
  locale,
}: {
  recipes: RecipeWithDetails[];
  locale: Locale;
}) {
  const t = LABELS[locale];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize from the URL once on mount, so refreshing/sharing a ?q= link works.
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");

  // Debounce writing the query back to the URL, so every keystroke doesn't push a navigation.
  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      const trimmed = query.trim();
      if (trimmed) {
        params.set("q", trimmed);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, URL_SYNC_DELAY_MS);

    return () => clearTimeout(handle);
  }, [query, pathname, router]);

  const normalizedQuery = normalize(query);

  const filteredRecipes = useMemo(
    () => recipes.filter((recipe) => recipeMatchesQuery(recipe, normalizedQuery)),
    [recipes, normalizedQuery],
  );

  const isSearching = normalizedQuery.length > 0;

  return (
    <div>
      <div className="relative w-full sm:max-w-md">
        <label htmlFor="recipe-search" className="sr-only">
          {t.label}
        </label>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="none"
          className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-neutral-400"
        >
          <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.5" />
          <path d="M17 17l-3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <input
          id="recipe-search"
          ref={inputRef}
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t.placeholder}
          aria-label={t.label}
          autoComplete="off"
          className="w-full rounded-lg border border-neutral-200 py-2 pr-9 pl-9 text-sm focus:border-brand focus:outline-none"
        />
        {query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            aria-label={t.clear}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-neutral-400 hover:text-brand focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="h-4 w-4">
              <path
                d="M5 5l10 10M15 5L5 15"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {isSearching ? (
        <p className="mt-3 text-sm text-neutral-500" role="status">
          {filteredRecipes.length > 0 ? t.results(filteredRecipes.length) : t.noResults}
        </p>
      ) : null}

      {!isSearching || filteredRecipes.length > 0 ? (
        <div className="mt-4">
          <RecipeList recipes={filteredRecipes} locale={locale} />
        </div>
      ) : null}
    </div>
  );
}
