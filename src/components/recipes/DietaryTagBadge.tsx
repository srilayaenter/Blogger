import type { Ingredient, RecipeContent } from "@/types/recipe";
import { getDietaryTag } from "@/lib/dietary";

type Locale = "en" | "ta";

const LABELS = {
  en: { vegetarian: "Veg", egg: "Egg", "non-vegetarian": "Non-Veg" },
  ta: { vegetarian: "சைவம்", egg: "முட்டை", "non-vegetarian": "அசைவம்" },
} satisfies Record<Locale, Record<string, string>>;

const DOT_COLOR = {
  vegetarian: "bg-brand",
  egg: "bg-brand-accent",
  "non-vegetarian": "bg-red-500",
};

// The single place every component renders a dietary tag from -- never duplicate this
// markup or the classification logic (see src/lib/dietary.ts) elsewhere.
export function DietaryTagBadge({
  recipe,
  locale,
}: {
  recipe: Pick<RecipeContent, "dietary_type"> & { ingredients: Pick<Ingredient, "name_en" | "name_ta">[] };
  locale: Locale;
}) {
  const tag = getDietaryTag(recipe);
  if (!tag) return null;

  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-neutral-200 bg-white/90 px-2 py-0.5 text-[11px] font-medium text-neutral-700 shadow-sm">
      <span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${DOT_COLOR[tag]}`} />
      {LABELS[locale][tag]}
    </span>
  );
}
