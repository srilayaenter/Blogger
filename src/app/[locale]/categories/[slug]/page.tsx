import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getAllCategories,
  getCategoryBySlug,
  getPublishedRecipesByCategorySlug,
} from "@/lib/content/loader";
import { RecipeList } from "@/components/recipes/RecipeList";
import {
  absoluteUrl,
  baseOpenGraph,
  fallbackOgImage,
  languageAlternates,
  type Locale,
} from "@/lib/metadata";

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

  const title = locale === "ta" ? category.name_ta : category.name_en;
  // Only use the description if the source data actually has one for this locale -- never invent
  // category copy. Many categories have a null description; omit the field entirely rather than
  // fabricating text.
  const description = locale === "ta" ? category.description_ta : category.description_en;
  const path = `/${locale}/categories/${slug}/`;
  const url = absoluteUrl(path);
  const image = fallbackOgImage(locale);

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
      images: [image],
    },
  };
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
      <h1 className="text-2xl font-bold text-brand">
        {locale === "ta" ? category.name_ta : category.name_en}
      </h1>
      {description ? <p className="mt-2 text-neutral-600">{description}</p> : null}
      <div className="mt-6">
        <RecipeList recipes={recipes} locale={locale} />
      </div>
    </div>
  );
}
