import Link from "next/link";
import { getPublishedRecipes } from "@/lib/content/loader";
import { RecipeList } from "@/components/recipes/RecipeList";

type Locale = "en" | "ta";

const LABELS = {
  en: {
    intro:
      "A bilingual collection of Tamil recipes, preserved from a printed cookbook and translated for home cooks everywhere.",
    recent: "Recent recipes",
    viewAll: "View all recipes",
  },
  ta: {
    intro:
      "அச்சிடப்பட்ட சமையல் புத்தகத்திலிருந்து பாதுகாக்கப்பட்ட, இருமொழி தமிழ் சமையல் குறிப்புகளின் தொகுப்பு.",
    recent: "சமீபத்திய சமையல் குறிப்புகள்",
    viewAll: "அனைத்தையும் காண்க",
  },
} satisfies Record<Locale, Record<string, string>>;

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = LABELS[locale];
  const recipes = await getPublishedRecipes();
  const recent = recipes.slice(0, 3);

  return (
    <div>
      <p className="text-neutral-600">{t.intro}</p>

      <section className="mt-8">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">{t.recent}</h2>
          <Link href={`/${locale}/recipes`} className="text-sm font-medium text-brand underline">
            {t.viewAll}
          </Link>
        </div>
        <div className="mt-4">
          <RecipeList recipes={recent} locale={locale} />
        </div>
      </section>
    </div>
  );
}
