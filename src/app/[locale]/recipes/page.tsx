import { getPublishedRecipes } from "@/lib/content/loader";
import { RecipeList } from "@/components/recipes/RecipeList";

type Locale = "en" | "ta";

const LABELS = {
  en: { title: "Recipes" },
  ta: { title: "சமையல் குறிப்புகள்" },
} satisfies Record<Locale, Record<string, string>>;

export default async function RecipesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const recipes = await getPublishedRecipes();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{LABELS[locale].title}</h1>
      <RecipeList recipes={recipes} locale={locale} />
    </div>
  );
}
