import type { RecipeWithDetails } from "@/types/recipe";

type Locale = "en" | "ta";

const LABELS = {
  en: {
    prep: "Prep time",
    cook: "Cook time",
    total: "Total time",
    servings: "Servings",
    difficulty: "Difficulty",
    minutes: "min",
    ingredients: "Ingredients",
    instructions: "Instructions",
    categories: "Categories",
  },
  ta: {
    prep: "தயாரிப்பு நேரம்",
    cook: "சமைக்கும் நேரம்",
    total: "மொத்த நேரம்",
    servings: "பேருக்கு",
    difficulty: "கடினத்தன்மை",
    minutes: "நிமிடங்கள்",
    ingredients: "பொருட்கள்",
    instructions: "செய்முறை",
    categories: "வகைகள்",
  },
} satisfies Record<Locale, Record<string, string>>;

const DIFFICULTY_LABELS = {
  en: { easy: "Easy", medium: "Medium", hard: "Hard" },
  ta: { easy: "எளிது", medium: "நடுத்தரம்", hard: "கடினம்" },
} satisfies Record<Locale, Record<string, string>>;

export function RecipeDetail({ recipe, locale }: { recipe: RecipeWithDetails; locale: Locale }) {
  const t = LABELS[locale];
  const title = locale === "ta" ? recipe.title_ta : recipe.title_en;
  const description = locale === "ta" ? recipe.description_ta : recipe.description_en;
  const imageAlt =
    (locale === "ta" ? recipe.featured_image_alt_ta : recipe.featured_image_alt_en) || title;

  const sortedIngredients = [...recipe.ingredients].sort(
    (a, b) => a.display_order - b.display_order,
  );
  const sortedInstructions = [...recipe.instructions].sort(
    (a, b) => a.display_order - b.display_order,
  );

  return (
    <article>
      {recipe.featured_image_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.featured_image_url}
          alt={imageAlt}
          className="mb-4 h-64 w-full rounded-lg object-cover"
        />
      ) : (
        <div
          role="img"
          aria-label={title}
          className="mb-4 flex h-64 w-full items-center justify-center rounded-lg bg-neutral-100 text-neutral-400"
        >
          {title}
        </div>
      )}

      <h1 className="text-2xl font-bold">{title}</h1>
      {description ? <p className="mt-2 text-neutral-600">{description}</p> : null}

      <dl className="mt-4 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
        {recipe.prep_time_minutes ? (
          <div>
            <dt className="text-neutral-500">{t.prep}</dt>
            <dd>
              {recipe.prep_time_minutes} {t.minutes}
            </dd>
          </div>
        ) : null}
        {recipe.cook_time_minutes ? (
          <div>
            <dt className="text-neutral-500">{t.cook}</dt>
            <dd>
              {recipe.cook_time_minutes} {t.minutes}
            </dd>
          </div>
        ) : null}
        {recipe.total_time_minutes ? (
          <div>
            <dt className="text-neutral-500">{t.total}</dt>
            <dd>
              {recipe.total_time_minutes} {t.minutes}
            </dd>
          </div>
        ) : null}
        {recipe.servings ? (
          <div>
            <dt className="text-neutral-500">{t.servings}</dt>
            <dd>{recipe.servings}</dd>
          </div>
        ) : null}
        {recipe.difficulty ? (
          <div>
            <dt className="text-neutral-500">{t.difficulty}</dt>
            <dd>{DIFFICULTY_LABELS[locale][recipe.difficulty]}</dd>
          </div>
        ) : null}
      </dl>

      {recipe.categories.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="sr-only">{t.categories}</span>
          {recipe.categories.map((category) => (
            <span
              key={category.slug}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600"
            >
              {locale === "ta" ? category.name_ta : category.name_en}
            </span>
          ))}
        </div>
      ) : null}

      <section className="mt-6">
        <h2 className="text-lg font-semibold">{t.ingredients}</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          {sortedIngredients.map((ingredient) => {
            const name = locale === "ta" ? ingredient.name_ta : ingredient.name_en;
            const unit = locale === "ta" ? ingredient.unit_ta : ingredient.unit_en;
            const notes = locale === "ta" ? ingredient.notes_ta : ingredient.notes_en;
            return (
              <li key={ingredient.id}>
                {[ingredient.quantity, unit, name].filter(Boolean).join(" ")}
                {notes ? ` (${notes})` : null}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-6">
        <h2 className="text-lg font-semibold">{t.instructions}</h2>
        <ol className="mt-2 list-decimal space-y-2 pl-5">
          {sortedInstructions.map((instruction) => (
            <li key={instruction.id}>
              {locale === "ta" ? instruction.instruction_ta : instruction.instruction_en}
            </li>
          ))}
        </ol>
      </section>
    </article>
  );
}
