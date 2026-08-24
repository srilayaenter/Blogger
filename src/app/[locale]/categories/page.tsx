import Link from "next/link";
import { getAllCategories } from "@/lib/content/loader";

type Locale = "en" | "ta";

const LABELS = {
  en: { title: "Categories" },
  ta: { title: "வகைகள்" },
} satisfies Record<Locale, Record<string, string>>;

export default async function CategoriesPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
  const categories = await getAllCategories();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">{LABELS[locale].title}</h1>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((category) => (
          <li key={category.slug}>
            <Link
              href={`/${locale}/categories/${category.slug}`}
              className="block rounded-lg border border-neutral-200 p-4 text-center font-medium transition hover:border-brand hover:text-brand hover:shadow-md"
            >
              {locale === "ta" ? category.name_ta : category.name_en}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
