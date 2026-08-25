import Link from "next/link";
import type { Metadata } from "next";
import { getAllCategories, getPublishedRecipes } from "@/lib/content/loader";
import { RecipeList } from "@/components/recipes/RecipeList";
import { Hero } from "@/components/home/Hero";
import { CategoryGrid } from "@/components/home/CategoryGrid";
import {
  absoluteUrl,
  baseOpenGraph,
  fallbackOgImage,
  languageAlternates,
  type Locale,
} from "@/lib/metadata";

// The `intro` string is also used, verbatim, as Hero's supporting copy (src/components/home/Hero.tsx) --
// kept here too because generateMetadata below needs it for the page description.
const LABELS = {
  en: {
    intro:
      "A bilingual collection of Tamil recipes, preserved from a printed cookbook and translated for home cooks everywhere.",
    categories: "Categories",
    recipesToTry: "Recipes to try",
    viewAll: "View all recipes",
    about: "About SriLaYa",
    aboutBody: "Browse the full SriLaYa Recipes collection, in English and Tamil.",
  },
  ta: {
    intro:
      "அச்சிடப்பட்ட சமையல் புத்தகத்திலிருந்து பாதுகாக்கப்பட்ட, இருமொழி தமிழ் சமையல் குறிப்புகளின் தொகுப்பு.",
    categories: "வகைகள்",
    recipesToTry: "முயற்சிக்க வேண்டிய சமையல் குறிப்புகள்",
    viewAll: "அனைத்தையும் காண்க",
    about: "ஸ்ரீலயா பற்றி",
    aboutBody:
      "ஸ்ரீலயா சமையல் குறிப்புகளின் முழுத் தொகுப்பையும் தமிழிலும் ஆங்கிலத்திலும் பார்வையிடுங்கள்.",
  },
} satisfies Record<Locale, Record<string, string>>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = `/${locale}/`;
  const url = absoluteUrl(path);

  return {
    description: LABELS[locale].intro,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      ...baseOpenGraph(locale),
      url,
      description: LABELS[locale].intro,
      images: [fallbackOgImage(locale)],
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const t = LABELS[locale];
  const recipes = await getPublishedRecipes();
  const categories = await getAllCategories();
  // Preserves existing order from content/categories.json and content/recipes/*.json --
  // no sorting or reordering is applied, just a slice of the first 6.
  const featuredCategories = categories.slice(0, 6);
  const recipesToTry = recipes.slice(0, 6);

  return (
    <div>
      <Hero locale={locale} />

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-brand-dark">{t.categories}</h2>
        <div className="mt-4">
          <CategoryGrid categories={featuredCategories} locale={locale} />
        </div>
      </section>

      <section className="mt-10">
        <div className="flex items-baseline justify-between">
          <h2 className="text-lg font-semibold text-brand-dark">{t.recipesToTry}</h2>
          <Link href={`/${locale}/recipes`} className="text-sm font-medium text-brand underline">
            {t.viewAll}
          </Link>
        </div>
        <div className="mt-4">
          <RecipeList recipes={recipesToTry} locale={locale} />
        </div>
      </section>

      <section
        className="mt-10 rounded-xl bg-brand-light px-4 py-6 text-center"
        aria-labelledby="about-heading"
      >
        <h2 id="about-heading" className="text-lg font-semibold text-brand-dark">
          {t.about}
        </h2>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-600">{t.aboutBody}</p>
      </section>
    </div>
  );
}
