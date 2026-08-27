/**
 * Single source of truth for classifying a recipe as vegetarian, egg, or non-vegetarian.
 *
 * Recipes imported after the chicken/egg/mutton batches always carry an explicit
 * `dietary_type`, which is used directly. Recipes from the original vegetarian batch
 * predate that field and have it unset -- for those, the classification is derived from
 * the ingredient list using a fixed, whole-word keyword match (never a substring match,
 * which produces false positives in Tamil: e.g. "கறிவேப்பிலை" (curry leaf) contains "கறி"
 * (meat) as a substring but is not a meat ingredient).
 *
 * If a recipe has no ingredients to inspect and no explicit dietary_type, classification
 * is genuinely unknown and callers must render no tag rather than guess.
 */

import type { Ingredient, RecipeContent } from "@/types/recipe";

export type DietaryTag = "vegetarian" | "egg" | "non-vegetarian";

// Whole-word matches only. Lowercased for English; Tamil has no case to normalize.
const MEAT_FISH_TOKENS_EN = new Set([
  "chicken",
  "mutton",
  "goat",
  "fish",
  "prawn",
  "meat",
  "liver",
  "brain",
  "blood",
  "intestine",
  "lung",
  "tongue",
  "kidney",
]);
const MEAT_FISH_TOKENS_TA = new Set([
  "கோழி",
  "மட்டன்",
  "ஆடு",
  "மீன்",
  "இறால்",
  "கறி",
  "ஈரல்",
  "மூளை",
  "இரத்தம்",
  "குடல்",
  "நுரையீரல்",
]);
const EGG_TOKENS_EN = new Set(["egg", "eggs"]);
const EGG_TOKENS_TA = new Set(["முட்டை"]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[\s,()/]+/)
    .filter(Boolean);
}

function ingredientSignal(ingredients: Pick<Ingredient, "name_en" | "name_ta">[]): DietaryTag | null {
  let sawEgg = false;
  for (const ingredient of ingredients) {
    const tokensEn = tokenize(ingredient.name_en ?? "");
    const tokensTa = (ingredient.name_ta ?? "").split(/[\s,()/]+/).filter(Boolean);
    for (const token of tokensEn) {
      if (MEAT_FISH_TOKENS_EN.has(token)) return "non-vegetarian";
      if (EGG_TOKENS_EN.has(token)) sawEgg = true;
    }
    for (const token of tokensTa) {
      if (MEAT_FISH_TOKENS_TA.has(token)) return "non-vegetarian";
      if (EGG_TOKENS_TA.has(token)) sawEgg = true;
    }
  }
  if (sawEgg) return "egg";
  return null;
}

export function getDietaryTag(
  recipe: Pick<RecipeContent, "dietary_type"> & {
    ingredients: Pick<Ingredient, "name_en" | "name_ta">[];
  },
): DietaryTag | null {
  if (recipe.dietary_type) return recipe.dietary_type;

  if (recipe.ingredients.length === 0) return null;

  const signal = ingredientSignal(recipe.ingredients);
  if (signal) return signal;

  // No meat, fish, or egg tokens found anywhere in the ingredient list -- vegetarian.
  return "vegetarian";
}
