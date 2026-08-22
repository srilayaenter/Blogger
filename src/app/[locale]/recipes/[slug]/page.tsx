import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublishedRecipeBySlug, getPublishedRecipes } from "@/lib/content/loader";
import { RecipeDetail } from "@/components/recipes/RecipeDetail";

type Locale = "en" | "ta";

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

  return { title: locale === "ta" ? recipe.title_ta : recipe.title_en };
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
