import { Suspense } from "react";
import type { Metadata } from "next";
import { getPublishedRecipes } from "@/lib/content/loader";
import { RecipeList } from "@/components/recipes/RecipeList";
import { RecipeSearch } from "@/components/recipes/RecipeSearch";
import {
  absoluteUrl,
  baseOpenGraph,
  fallbackOgImage,
  languageAlternates,
  type Locale,
} from "@/lib/metadata";

const LABELS = {
  en: {
    title: "Recipes",
    description: "Browse the full SriLaYa Recipes collection, in English and Tamil.",
  },
  ta: {
    title: "சமையல் குறிப்புகள்",
    description: "ஸ்ரீலயா சமையல் குறிப்புகளின் முழுத் தொகுப்பையும் தமிழிலும் ஆங்கிலத்திலும் பார்வையிடுங்கள்.",
  },
} satisfies Record<Locale, { title: string; description: string }>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = `/${locale}/recipes/`;
  const url = absoluteUrl(path);

  return {
    title: LABELS[locale].title,
    description: LABELS[locale].description,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      ...baseOpenGraph(locale),
      url,
      title: LABELS[locale].title,
      description: LABELS[locale].description,
      images: [fallbackOgImage(locale)],
    },
  };
}

export default async function RecipesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const recipes = await getPublishedRecipes();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-brand">{LABELS[locale].title}</h1>
      <Suspense fallback={<RecipeList recipes={recipes} locale={locale} />}>
        <RecipeSearch recipes={recipes} locale={locale} />
      </Suspense>
    </div>
  );
}
