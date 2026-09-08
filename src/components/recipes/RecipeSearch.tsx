"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { RecipeDifficulty, RecipeWithDetails } from "@/types/recipe";
import { RecipeList } from "./RecipeList";

type Locale = "en" | "ta";

const LABELS = {
  en: {
    label: "Search recipes",
    placeholder: "Search recipes",
    clear: "Clear search",
    results: (n: number) => `${n} recipe${n === 1 ? "" : "s"} found`,
    noResults: "No recipes match your search.",
    category: "Category",
    difficulty: "Difficulty",
  },
  ta: {
    label: "சமையல் குறிப்புகளைத் தேடுங்கள்",
    placeholder: "சமையல் குறிப்புகளைத் தேடுங்கள்",
    clear: "தேடலை அழிக்கவும்",
    results: (n: number) => `${n} சமையல் குறிப்புகள் கிடைத்தன`,
    noResults: "உங்கள் தேடலுக்குப் பொருந்தும் சமையல் குறிப்புகள் இல்லை.",
    category: "வகை",
    difficulty: "கடினத்தன்மை",
  },
} satisfies Record<
  Locale,
  {
    label: string;
    placeholder: string;
    clear: string;
    results: (n: number) => string;
    noResults: string;
    category: string;
    difficulty: string;
  }
>;

// Same order/labels RecipeDetail.tsx and RecipeCard.tsx already use for difficulty elsewhere;
// duplicated locally rather than shared, matching how those two components each keep their own copy.
const DIFFICULTY_ORDER: RecipeDifficulty[] = ["easy", "medium", "hard"];
const DIFFICULTY_LABELS = {
  en: { easy: "Easy", medium: "Medium", hard: "Hard" },
  ta: { easy: "எளிது", medium: "நடுத்தரம்", hard: "கடினம்" },
} satisfies Record<Locale, Record<RecipeDifficulty, string>>;

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

  // Initialize from the URL once on mount, so refreshing/sharing a ?q=&category=&difficulty= link works.
  const [query, setQuery] = useState(() => searchParams.get("q") ?? "");
  const [category, setCategory] = useState<string | null>(() => searchParams.get("category"));
  const [difficulty, setDifficulty] = useState<RecipeDifficulty | null>(() => {
    const value = searchParams.get("difficulty");
    return value === "easy" || value === "medium" || value === "hard" ? value : null;
  });

  // Debounce writing the query back to the URL, so every keystroke doesn't push a navigation.
  // Chip toggles (category/difficulty) are discrete clicks, not typing, so they sync immediately.
  useEffect(() => {
    const handle = setTimeout(() => {
      const params = new URLSearchParams();
      const trimmed = query.trim();
      if (trimmed) {
        params.set("q", trimmed);
      }
      if (category) {
        params.set("category", category);
      }
      if (difficulty) {
        params.set("difficulty", difficulty);
      }
      const qs = params.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, URL_SYNC_DELAY_MS);

    return () => clearTimeout(handle);
  }, [query, category, difficulty, pathname, router]);

  const normalizedQuery = normalize(query);

  // Derived from the recipes actually passed in, not a fixed list -- a category with zero
  // recipes (e.g. one with no content yet) simply produces no chip, and a difficulty value
  // that never occurs in the data never renders either.
  const availableCategories = useMemo(() => {
    const seen = new Map<string, { slug: string; name_ta: string; name_en: string }>();
    for (const recipe of recipes) {
      for (const recipeCategory of recipe.categories) {
        if (!seen.has(recipeCategory.slug)) {
          seen.set(recipeCategory.slug, {
            slug: recipeCategory.slug,
            name_ta: recipeCategory.name_ta,
            name_en: recipeCategory.name_en,
          });
        }
      }
    }
    return [...seen.values()].sort((a, b) =>
      (locale === "ta" ? a.name_ta : a.name_en).localeCompare(locale === "ta" ? b.name_ta : b.name_en, locale),
    );
  }, [recipes, locale]);

  const availableDifficulties = useMemo(() => {
    const present = new Set(recipes.map((recipe) => recipe.difficulty).filter(Boolean));
    return DIFFICULTY_ORDER.filter((value) => present.has(value));
  }, [recipes]);

  const filteredRecipes = useMemo(
    () =>
      recipes.filter((recipe) => {
        if (!recipeMatchesQuery(recipe, normalizedQuery)) return false;
        if (category && !recipe.categories.some((c) => c.slug === category)) return false;
        if (difficulty && recipe.difficulty !== difficulty) return false;
        return true;
      }),
    [recipes, normalizedQuery, category, difficulty],
  );

  const isSearching = normalizedQuery.length > 0 || category !== null || difficulty !== null;

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

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2">
        {availableCategories.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-neutral-500">{t.category}:</span>
            {availableCategories.map((c) => {
              const selected = category === c.slug;
              return (
                <button
                  key={c.slug}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setCategory(selected ? null : c.slug)}
                  className={
                    selected
                      ? "rounded-full bg-brand px-2.5 py-1 text-xs font-medium text-white"
                      : "rounded-full bg-brand-light px-2.5 py-1 text-xs font-medium text-brand-dark hover:bg-brand/20"
                  }
                >
                  {locale === "ta" ? c.name_ta : c.name_en}
                </button>
              );
            })}
          </div>
        ) : null}

        {availableDifficulties.length > 0 ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-medium text-neutral-500">{t.difficulty}:</span>
            {availableDifficulties.map((value) => {
              const selected = difficulty === value;
              return (
                <button
                  key={value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => setDifficulty(selected ? null : value)}
                  className={
                    selected
                      ? "rounded-full bg-brand px-2.5 py-1 text-xs font-medium text-white"
                      : "rounded-full bg-brand-accent/20 px-2.5 py-1 text-xs font-medium text-brand-dark hover:bg-brand-accent/30"
                  }
                >
                  {DIFFICULTY_LABELS[locale][value]}
                </button>
              );
            })}
          </div>
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
