import Link from "next/link";
import type { RecipeWithDetails } from "@/types/recipe";
import { DietaryTagBadge } from "./DietaryTagBadge";

type Locale = "en" | "ta";

const LABELS = {
  en: { minutes: "min", servings: "servings" },
  ta: { minutes: "நிமிடங்கள்", servings: "பேருக்கு" },
} satisfies Record<Locale, Record<string, string>>;

const DIFFICULTY_LABELS = {
  en: { easy: "Easy", medium: "Medium", hard: "Hard" },
  ta: { easy: "எளிது", medium: "நடுத்தரம்", hard: "கடினம்" },
} satisfies Record<Locale, Record<string, string>>;

export function RecipeCard({ recipe, locale }: { recipe: RecipeWithDetails; locale: Locale }) {
  const t = LABELS[locale];
  const title = locale === "ta" ? recipe.title_ta : recipe.title_en;
  const description = locale === "ta" ? recipe.description_ta : recipe.description_en;
  const imageAlt =
    (locale === "ta" ? recipe.featured_image_alt_ta : recipe.featured_image_alt_en) || title;
  const hasMeta = Boolean(recipe.total_time_minutes || recipe.servings || recipe.difficulty);

  return (
    <Link
      href={`/${locale}/recipes/${recipe.slug}`}
      className="group block overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <div className="absolute top-2 left-2 z-10">
          <DietaryTagBadge recipe={recipe} locale={locale} />
        </div>
        {recipe.featured_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={recipe.featured_image_url}
            alt={imageAlt}
            className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-[1.05] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
          />
        ) : (
          <div
            role="img"
            aria-label={title}
            className="relative flex h-full w-full items-center justify-center overflow-hidden bg-gradient-to-br from-brand-light to-white p-4 text-center text-sm font-medium text-brand-dark"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(0,106,56,0.12)_1px,transparent_0)] bg-[length:16px_16px]"
            />
            <span className="relative">{title}</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-semibold text-neutral-900 transition-colors group-hover:text-brand-dark">
          {title}
        </h3>
        {description ? (
          <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{description}</p>
        ) : null}
        {hasMeta ? (
          <div className="mt-3 flex flex-wrap gap-1.5 border-t border-neutral-100 pt-3">
            {recipe.total_time_minutes ? (
              <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand-dark">
                {recipe.total_time_minutes} {t.minutes}
              </span>
            ) : null}
            {recipe.servings ? (
              <span className="rounded-full bg-brand-light px-2.5 py-0.5 text-xs font-medium text-brand-dark">
                {recipe.servings} {t.servings}
              </span>
            ) : null}
            {recipe.difficulty ? (
              <span className="rounded-full bg-brand-accent/20 px-2.5 py-0.5 text-xs font-medium text-brand-dark">
                {DIFFICULTY_LABELS[locale][recipe.difficulty]}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
