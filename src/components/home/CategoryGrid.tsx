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
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      {categories.map((category) => {
        const name = locale === "ta" ? category.name_ta : category.name_en;
        return (
          <Link
            key={category.slug}
            href={`/${locale}/categories/${category.slug}/`}
            className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-gradient-to-br from-brand-light to-white px-4 py-5 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <span
              aria-hidden="true"
              className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-base font-bold text-brand-dark transition-colors duration-200 group-hover:bg-brand group-hover:text-white"
            >
              {name.charAt(0)}
            </span>
            <span className="mt-3 block text-sm leading-snug font-medium text-brand-dark">
              {name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
