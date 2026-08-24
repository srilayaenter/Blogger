import type { MetadataRoute } from "next";
import { getAllCategories, getPublishedRecipes } from "@/lib/content/loader";
import { SITE_URL, SUPPORTED_LOCALES } from "@/lib/metadata";

// Required for output: "export" -- without this, Next treats sitemap.ts as potentially dynamic
// and the static export build fails.
export const dynamic = "force-static";

/**
 * Static sitemap (Next.js Metadata API route convention -- compiles to a static sitemap.xml
 * under output: "export", same mechanism as any other static route). Built from the same
 * build-time loaders generateStaticParams already uses for recipes/categories, so it can't drift
 * out of sync with what's actually generated.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const recipes = await getPublishedRecipes();
  const categories = await getAllCategories();

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    entries.push({ url: `${SITE_URL}/${locale}/` });
    entries.push({ url: `${SITE_URL}/${locale}/recipes/` });
    entries.push({ url: `${SITE_URL}/${locale}/categories/` });

    for (const recipe of recipes) {
      entries.push({ url: `${SITE_URL}/${locale}/recipes/${recipe.slug}/` });
    }

    for (const category of categories) {
      entries.push({ url: `${SITE_URL}/${locale}/categories/${category.slug}/` });
    }
  }

  return entries;
}
