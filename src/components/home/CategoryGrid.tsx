import Link from "next/link";
import type { Category } from "@/types/category";

type Locale = "en" | "ta";

export function CategoryGrid({
  categories,
  locale,
}: {
  categories: Category[];
  locale: Locale;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/${locale}/categories/${category.slug}/`}
          className="rounded-lg border border-neutral-200 bg-brand-light px-4 py-3 text-center text-sm font-medium text-brand-dark transition hover:border-brand hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {locale === "ta" ? category.name_ta : category.name_en}
        </Link>
      ))}
    </div>
  );
}
