import type { RecipeWithDetails } from "@/types/recipe";
import { RecipeCard } from "./RecipeCard";

type Locale = "en" | "ta";

const LABELS = {
  en: { empty: "No recipes here yet." },
  ta: { empty: "இங்கு இன்னும் சமையல் குறிப்புகள் இல்லை." },
} satisfies Record<Locale, Record<string, string>>;

export function RecipeList({ recipes, locale }: { recipes: RecipeWithDetails[]; locale: Locale }) {
  if (recipes.length === 0) {
    return <p className="text-neutral-500">{LABELS[locale].empty}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:grid-cols-3">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.slug} recipe={recipe} locale={locale} />
      ))}
    </div>
  );
}
