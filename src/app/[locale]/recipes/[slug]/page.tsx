import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedRecipeBySlug, getPublishedRecipes } from "@/lib/content/loader";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";
import {
  absoluteUrl,
  baseOpenGraph,
  fallbackOgImage,
  isOgSafeImage,
  languageAlternates,
  type Locale,
} from "@/lib/metadata";

export async function generateStaticParams() {
  const recipes = await getPublishedRecipes();
  return recipes.map((recipe) => ({ slug: recipe.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const recipe = await getPublishedRecipeBySlug(slug);
  if (!recipe) return {};

  const title = locale === "ta" ? recipe.title_ta : recipe.title_en;
  // Only use a description if the source data actually has one for this locale -- the vast
  // majority of recipes (translated from the PDF) have no description, and none is invented here.
  const description = locale === "ta" ? recipe.description_ta : recipe.description_en;
  const path = `/${locale}/recipes/${slug}/`;
  const url = absoluteUrl(path);

  const image =
    recipe.featured_image_url && isOgSafeImage(recipe.featured_image_url)
      ? {
          url: absoluteUrl(recipe.featured_image_url),
          width: 1200,
          height: 630,
          alt:
            (locale === "ta" ? recipe.featured_image_alt_ta : recipe.featured_image_alt_en) ||
            title,
        }
      : fallbackOgImage(locale);

  return {
    title,
    description: description ?? undefined,
    alternates: {
      canonical: url,
      languages: languageAlternates(path),
    },
    openGraph: {
      ...baseOpenGraph(locale),
      url,
      title,
      description: description ?? undefined,
      type: "article",
      images: [image],
    },
  };
}

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const recipe = await getPublishedRecipeBySlug(slug);

  if (!recipe) {
    notFound();
  }

  return <RecipeDetail recipe={recipe} locale={locale} />;
}
