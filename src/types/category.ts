/**
 * Shape of an entry in content/categories.json. No `id`/timestamps -- there's no database, so
 * `slug` is the only identity a category needs (also used as the React key wherever categories
 * are rendered).
 */
export type Category = {
  slug: string;
  name_ta: string;
  name_en: string;
  description_ta: string | null;
  description_en: string | null;
};

/** A representative photo borrowed from one recipe in the category -- see getCategoriesWithImages. */
export type CategoryImage = {
  url: string;
  alt_ta: string;
  alt_en: string;
  recipeSlug: string;
};

export type CategoryWithImage = Category & {
  image: CategoryImage | null;
};
