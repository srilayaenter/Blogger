/**
 * Reads content/categories.json and content/recipes/*.json from disk at build time. This is the
 * permanent architecture, not a temporary stand-in -- there is no database to eventually swap
 * this out for (see docs/architecture.md).
 *
 * Function names and Promise-returning signatures deliberately match the old
 * src/lib/recipes/mock.ts exactly, which is why swapping every page's import from
 * "@/lib/recipes/mock" to "@/lib/content/loader" was the only change needed there.
 *
 * Uses Node's fs/path directly -- safe here because this only ever runs at build time in Server
 * Components/generateStaticParams, never in the browser. A Client Component importing this would
 * fail to bundle (fs doesn't exist client-side), so no extra guard is needed.
 */

import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import type { Category } from "@/types/category";
import type { RecipeContent, RecipeWithDetails } from "@/types/recipe";
import { getVegNonVegCategory } from "@/lib/dietary";

const CONTENT_DIR = path.join(process.cwd(), "content");
const RECIPES_DIR = path.join(CONTENT_DIR, "recipes");
const CATEGORIES_FILE = path.join(CONTENT_DIR, "categories.json");

function loadAllCategories(): Category[] {
  const raw = readFileSync(CATEGORIES_FILE, "utf-8");
  return JSON.parse(raw) as Category[];
}

function loadAllRecipeContent(): RecipeContent[] {
  const files = readdirSync(RECIPES_DIR).filter((file) => file.endsWith(".json"));
  return files.map((file) => {
    const raw = readFileSync(path.join(RECIPES_DIR, file), "utf-8");
    return JSON.parse(raw) as RecipeContent;
  });
}

function resolveCategories(slugs: string[], allCategories: Category[]): Category[] {
  return slugs
    .map((slug) => allCategories.find((category) => category.slug === slug))
    .filter((category): category is Category => Boolean(category));
}

function withResolvedCategories(
  recipe: RecipeContent,
  allCategories: Category[],
): RecipeWithDetails {
  const { categories, ...rest } = recipe;
  return { ...rest, categories: resolveCategories(categories, allCategories) };
}

export async function getPublishedRecipes(): Promise<RecipeWithDetails[]> {
  const categories = loadAllCategories();
  return loadAllRecipeContent().map((recipe) => withResolvedCategories(recipe, categories));
}

export async function getPublishedRecipeBySlug(slug: string): Promise<RecipeWithDetails | null> {
  const recipes = await getPublishedRecipes();
  return recipes.find((recipe) => recipe.slug === slug) ?? null;
}

export async function getPublishedRecipesByCategorySlug(
  categorySlug: string,
): Promise<RecipeWithDetails[]> {
  const recipes = await getPublishedRecipes();

  // "veg" and "non-veg" are virtual categories: no recipe file lists them in its own
  // `categories` array (that field is reserved for dish-type categories like "kuzhambu").
  // Membership is instead derived live from the same dietary classifier used everywhere
  // else, so this never drifts out of sync with the tag shown on cards/detail pages and
  // never requires editing any of the recipe content files.
  if (categorySlug === "veg" || categorySlug === "non-veg") {
    return recipes.filter((recipe) => getVegNonVegCategory(recipe) === categorySlug);
  }

  return recipes.filter((recipe) =>
    recipe.categories.some((category) => category.slug === categorySlug),
  );
}

export async function getAllCategories(): Promise<Category[]> {
  return loadAllCategories();
}

export async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const categories = loadAllCategories();
  return categories.find((category) => category.slug === slug) ?? null;
}
