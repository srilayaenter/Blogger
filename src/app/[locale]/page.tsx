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
    categoriesKicker: "Browse by",
    categories: "Categories",
    recipesKicker: "Handpicked",
    recipesToTry: "Recipes to try",
    viewAll: "View all recipes",
    about: "About SriLaYa",
    aboutBody: "Browse the full SriLaYa Recipes collection, in English and Tamil.",
  },
  ta: {
    intro:
      "அச்சிடப்பட்ட சமையல் புத்தகத்திலிருந்து பாதுகாக்கப்பட்ட, இருமொழி தமிழ் சமையல் குறிப்புகளின் தொகுப்பு.",
    categoriesKicker: "வகை வாரியாக",
    categories: "வகைகள்",
    recipesKicker: "தேர்ந்தெடுக்கப்பட்டவை",
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

      <section className="mt-16">
        <span className="text-xs font-semibold tracking-wide text-brand uppercase">
          {t.categoriesKicker}
        </span>
        <h2 className="mt-1 text-2xl font-bold text-brand-dark">{t.categories}</h2>
        <div className="mt-6">
          <CategoryGrid categories={featuredCategories} locale={locale} />
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold tracking-wide text-brand uppercase">
              {t.recipesKicker}
            </span>
            <h2 className="mt-1 text-2xl font-bold text-brand-dark">{t.recipesToTry}</h2>
          </div>
          <Link
            href={`/${locale}/recipes`}
            className="shrink-0 text-sm font-medium text-brand underline-offset-4 hover:text-brand-dark hover:underline"
          >
            {t.viewAll}
          </Link>
        </div>
        <div className="mt-6">
          <RecipeList recipes={recipesToTry} locale={locale} />
        </div>
      </section>

      <section
        className="relative mt-20 overflow-hidden rounded-3xl bg-gradient-to-br from-brand-light via-white to-brand-light px-6 py-10 text-center shadow-sm sm:px-10"
        aria-labelledby="about-heading"
      >
        <div
          aria-hidden="true"
          className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-brand-accent/10 blur-2xl"
        />
        <h2 id="about-heading" className="relative text-2xl font-bold text-brand-dark">
          {t.about}
        </h2>
        <p className="relative mx-auto mt-3 max-w-2xl text-sm text-neutral-600 sm:text-base">
          {t.aboutBody}
        </p>
      </section>
    </div>
  );
}
