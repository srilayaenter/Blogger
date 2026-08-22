import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllCategories,
  getCategoryBySlug,
  getPublishedRecipesByCategorySlug,
} from "@/lib/content/loader";
import { RecipeList } from "@/components/recipes/RecipeList";

type Locale = "en" | "ta";

export async function generateStaticParams() {
  const categories = await getAllCategories();
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return {};

  return { title: locale === "ta" ? category.name_ta : category.name_en };
}

export default async function CategoryDetailPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>;
}) {
  const { locale, slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const recipes = await getPublishedRecipesByCategorySlug(slug);
  const description = locale === "ta" ? category.description_ta : category.description_en;

  return (
    <div>
      <h1 className="text-2xl font-bold">
        {locale === "ta" ? category.name_ta : category.name_en}
      </h1>
      {description ? <p className="mt-2 text-neutral-600">{description}</p> : null}
      <div className="mt-6">
        <RecipeList recipes={recipes} locale={locale} />
      </div>
    </div>
  );
}
