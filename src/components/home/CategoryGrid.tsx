import Link from "next/link";
import type { CategoryWithImage } from "@/types/category";

type Locale = "en" | "ta";

export function CategoryGrid({
  categories,
  locale,
}: {
  categories: CategoryWithImage[];
  locale: Locale;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      {categories.map((category) => {
        const name = locale === "ta" ? category.name_ta : category.name_en;
        const imageAlt = category.image
          ? locale === "ta"
            ? category.image.alt_ta
            : category.image.alt_en
          : null;
        return (
          <Link
            key={category.slug}
            href={`/${locale}/categories/${category.slug}/`}
            className="group block overflow-hidden rounded-xl border border-neutral-200 bg-white text-center shadow-sm transition-all duration-200 hover:border-brand pointer-fine:hover:-translate-y-1 pointer-fine:hover:shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-brand motion-reduce:transition-none motion-reduce:pointer-fine:hover:translate-y-0"
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
                  className="flex h-full w-full items-center justify-center text-2xl font-bold text-stone-800 transition-colors duration-200 group-hover:bg-brand group-hover:text-white"
                >
                  {name.charAt(0)}
                </span>
              )}
            </div>
            <span className="block px-3 py-3 text-sm leading-snug font-medium text-stone-800">
              {name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
