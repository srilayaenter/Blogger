import Link from "next/link";
import type { RecipeWithDetails } from "@/types/recipe";

type Locale = "en" | "ta";

const LABELS = {
  en: { minutes: "min", servings: "servings" },
  ta: { minutes: "நிமிடங்கள்", servings: "பேருக்கு" },
} satisfies Record<Locale, Record<string, string>>;

export function RecipeCard({ recipe, locale }: { recipe: RecipeWithDetails; locale: Locale }) {
  const t = LABELS[locale];
  const title = locale === "ta" ? recipe.title_ta : recipe.title_en;
  const description = locale === "ta" ? recipe.description_ta : recipe.description_en;
  const imageAlt =
    (locale === "ta" ? recipe.featured_image_alt_ta : recipe.featured_image_alt_en) || title;

  return (
    <Link
      href={`/${locale}/recipes/${recipe.slug}`}
      className="block overflow-hidden rounded-lg border border-neutral-200 transition hover:shadow-md"
    >
      {recipe.featured_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={recipe.featured_image_url} alt={imageAlt} className="h-40 w-full object-cover" />
      ) : (
        <div
          role="img"
          aria-label={title}
          className="flex h-40 w-full items-center justify-center bg-neutral-100 text-sm text-neutral-400"
        >
          {title}
        </div>
      )}
      <div className="p-4">
        <h3 className="font-semibold">{title}</h3>
        {description ? <p className="mt-1 text-sm text-neutral-600">{description}</p> : null}
        {recipe.total_time_minutes ? (
          <p className="mt-2 text-xs text-neutral-500">
            {recipe.total_time_minutes} {t.minutes}
            {recipe.servings ? ` · ${recipe.servings} ${t.servings}` : null}
          </p>
        ) : null}
      </div>
    </Link>
  );
}
