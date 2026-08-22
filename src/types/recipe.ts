/**
 * Shapes for content/recipes/*.json. Field names deliberately match the old Supabase-era types
 * (title_ta/title_en, snake_case, etc.) even though there's no database anymore -- this is what
 * let RecipeCard/RecipeList/RecipeDetail survive the Supabase-to-static-content pivot with only
 * import-path changes, not field-access rewrites.
 *
 * No `id`, `status`, `created_at`/`updated_at`, `created_by`/`updated_by`, or any Google Drive
 * file/doc reference -- none of those concepts exist in a git-committed content file. A recipe
 * is "published" simply by having a file in content/recipes/; there's no draft state to track.
 */

import type { Category } from "./category";

export type RecipeDifficulty = "easy" | "medium" | "hard";

export type Ingredient = {
  id: string;
  name_ta: string;
  name_en: string;
  quantity: string | null;
  unit_ta: string | null;
  unit_en: string | null;
  notes_ta: string | null;
  notes_en: string | null;
  display_order: number;
};

export type Instruction = {
  id: string;
  step_number: number;
  instruction_ta: string;
  instruction_en: string;
  image_url: string | null;
  display_order: number;
};

/** The raw shape of a content/recipes/<slug>.json file on disk -- categories are slugs. */
export type RecipeContent = {
  slug: string;
  title_ta: string;
  title_en: string;
  description_ta: string | null;
  description_en: string | null;
  source_page_number: number | null;
  prep_time_minutes: number | null;
  cook_time_minutes: number | null;
  total_time_minutes: number | null;
  servings: number | null;
  difficulty: RecipeDifficulty | null;
  featured_image_url: string | null;
  // Public, repository-local photos only (public/images/recipes/<slug>/) -- never a Google Drive
  // reference. See docs/cloudflare-pages-deployment.md, "Image rules".
  featured_image_alt_ta: string | null;
  featured_image_alt_en: string | null;
  seo_title_ta: string | null;
  seo_title_en: string | null;
  seo_description_ta: string | null;
  seo_description_en: string | null;
  published_at: string | null;
  categories: string[];
  ingredients: Ingredient[];
  instructions: Instruction[];
};

/** What src/lib/content/loader.ts actually returns -- category slugs resolved to full objects. */
export type RecipeWithDetails = Omit<RecipeContent, "categories"> & {
  categories: Category[];
};
