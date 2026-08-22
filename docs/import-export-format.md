# Recipe Export/Content Format

Source of truth: `CLAUDE.md` §12 and §22, adapted for the static-export architecture (see
`architecture.md`). There is no `/api/import/v1` and no database — this document now describes
the JSON file contract between `ExportApproved.gs` and `content/recipes/<slug>.json`, both of
which must match this shape exactly.

## Eligibility gate

`ExportApproved.gs` only exports a Recipe Tracker row when all of the following are true (this
part is unchanged from the original design):

```text
tamil_review_status    = approved
translation_status     = approved
uncertainty_status     = resolved  OR  none
website_import_status  = ready_for_import
```

Any row not meeting all four conditions is skipped silently (not an error) on each export run.

## Delivery — manual, not HTTP

There is no server to POST to. `ExportApproved.gs` writes `<slug>.json` to Drive's `07_Exports`
folder (overwriting in place on re-export). The owner:

1. Opens `07_Exports`, downloads the new/changed file(s).
2. Copies them into `content/recipes/` in the repository, replacing any existing file with the
   same name.
3. Commits and pushes. Cloudflare Pages rebuilds and redeploys automatically.

There is no dry-run validation step and no rejection response — if a file is malformed, the
Next.js build will simply fail loudly (the content loader does `JSON.parse` with no fallback), or
TypeScript will flag a shape mismatch. That build failure **is** the validation.

## JSON schema

```json
{
  "slug": "ragi-dosa",
  "title_ta": "கேழ்வரகு தோசை",
  "title_en": "Ragi Dosa",
  "description_ta": "...",
  "description_en": "...",
  "source_page_number": 12,
  "prep_time_minutes": 20,
  "cook_time_minutes": 15,
  "total_time_minutes": 35,
  "servings": 4,
  "difficulty": "easy",
  "featured_image_url": "/images/recipes/ragi-dosa/featured.svg",
  "featured_image_alt_ta": "கேழ்வரகு தோசையின் விளக்கப்படம்",
  "featured_image_alt_en": "Illustration representing ragi dosa",
  "seo_title_ta": null,
  "seo_title_en": null,
  "seo_description_ta": null,
  "seo_description_en": null,
  "published_at": "2026-08-22T00:00:00.000Z",
  "categories": ["millet", "breakfast"],
  "ingredients": [
    {
      "id": "ragi-dosa-ingredient-1",
      "name_ta": "கேழ்வரகு மாவு",
      "name_en": "Ragi flour",
      "quantity": "1",
      "unit_ta": "கப்",
      "unit_en": "cup",
      "notes_ta": null,
      "notes_en": null,
      "display_order": 1
    }
  ],
  "instructions": [
    {
      "id": "ragi-dosa-instruction-1",
      "step_number": 1,
      "instruction_ta": "...",
      "instruction_en": "...",
      "image_url": null,
      "display_order": 1
    }
  ]
}
```

This matches `src/types/recipe.ts`'s `RecipeContent` exactly. `categories` is an array of slugs,
resolved against `content/categories.json` by `src/lib/content/loader.ts` at build time.

## Image fields

`featured_image_url` is a repository-local path such as `/images/recipes/ragi-dosa/featured.svg`
(served from `public/images/recipes/<slug>/`) — never a Google Drive link, never an external
image host. `ExportApproved.gs` always writes `null` for both `featured_image_url` and the two
alt-text fields; images and their alt text are added by hand, separately from the OCR/export
pipeline. Full rules: `docs/cloudflare-pages-deployment.md`, "Image rules".

## Deliberately excluded fields

- **Any Google Drive file ID, Doc ID, or URL.** CLAUDE.md §6/§19/§23 all say not to expose these
  publicly, and this file ends up read directly by the public site build — so the safest design
  is to never write them here at all. `source_page_number` (a page number in the physical
  cookbook) is kept; it isn't private.
- **`is_uncertain` / `uncertainty_notes`.** By the time a recipe reaches the export gate,
  uncertainty is supposed to be resolved anyway — and since this field is simply never written to
  the export, there's nothing to accidentally leak downstream (a stronger guarantee than the old
  Supabase design, which had to actively hide these columns via RLS/column-revoke).
- **`status`.** A recipe is "published" by having a file in `content/recipes/` — there's no
  separate draft/review/archived flag to carry. Removing a recipe from the site means deleting
  its file, not flipping a status.
- **SEO fields have no source anywhere in the Workspace pipeline** (the Doc template has no SEO
  section) — always `null` here, same as before. If SEO copy is ever wanted, it would need to be
  added to the Doc template and the parser in `GoogleDocsWorkflow.gs`.

## Where each field comes from

Same as before this pivot: `title_ta`/`title_en` prefer the review Doc's `Tamil Title:`/
`English Title:` fields, falling back to the Sheet's mirrored columns. `description`/time/
servings/difficulty/`categories` are parsed from the Doc's structured-data section
(`parseReviewDocument_` in `GoogleDocsWorkflow.gs`) since the Sheet has no columns for them
(`sheet-schema.md`). Ingredients/instructions come from their respective Sheets.
