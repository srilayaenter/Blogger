import Link from "next/link";
import type { Metadata } from "next";
import { getCategoriesWithImages } from "@/lib/content/loader";
import {
  absoluteUrl,
  baseOpenGraph,
  fallbackOgImage,
  languageAlternates,
  type Locale,
} from "@/lib/metadata";

const LABELS = {
  en: {
    title: "Categories",
    description: "Browse SriLaYa recipes by category.",
  },
  ta: {
    title: "வகைகள்",
    description: "ஸ்ரீலயா சமையல் குறிப்புகளை வகைப்படி பார்வையிடுங்கள்.",
  },
} satisfies Record<Locale, { title: string; description: string }>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const path = `/${locale}/categories/`;
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

export default async function CategoriesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const categories = await getCategoriesWithImages();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{LABELS[locale].title}</h1>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((category) => {
          const name = locale === "ta" ? category.name_ta : category.name_en;
          const imageAlt = category.image
            ? locale === "ta"
              ? category.image.alt_ta
              : category.image.alt_en
            : null;
          return (
            <li key={category.slug}>
              <Link
                href={`/${locale}/categories/${category.slug}`}
                className="group block overflow-hidden rounded-lg border border-neutral-200 bg-white text-center font-medium shadow-sm transition hover:border-brand hover:text-brand hover:shadow-md"
              >
                <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-brand-light to-white">
                  {category.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={category.image.url}
                      alt={imageAlt ?? ""}
                      className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                    />
                  ) : (
                    <span
                      aria-hidden="true"
                      className="flex h-full w-full items-center justify-center text-xl font-bold text-brand-dark"
                    >
                      {name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="block px-3 py-3">{name}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
