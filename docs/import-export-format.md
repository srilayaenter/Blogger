# Approved Export Format

Source of truth: `CLAUDE.md` §12 and §22. This is the contract between `ExportApproved.gs` and
the future Next.js `/api/import/v1` endpoint. **The endpoint itself is not implemented yet** —
this document defines the interface both sides will be built against.

## Eligibility gate

`ExportApproved.gs` only exports a Recipe Tracker row when all of the following are true:

```text
tamil_review_status    = approved
translation_status     = approved
uncertainty_status     = resolved  OR  none
website_import_status  = ready_for_import
```

Any row not meeting all four conditions is skipped silently (not an error) on each export run.

## Delivery

- **Method:** `POST`
- **URL:** value of the `IMPORT_ENDPOINT_URL` Script Property, with path `/api/import/v1`
  appended (e.g. `https://<site>/api/import/v1`) — placeholder until the site is deployed.
- **Headers:**
  - `Content-Type: application/json`
  - `X-Import-Webhook-Secret: <value of IMPORT_WEBHOOK_SECRET Script Property>`
- **Body:** one JSON object per recipe (see schema below). `ExportApproved.gs` sends one HTTP
  request per eligible recipe, not a batch array, so a single bad recipe can't block the rest.
- A copy of every payload sent is saved to `07_Exports/recipe-XXXX-export.json` regardless of
  the HTTP response, for audit purposes.

## Response contract (expected from the future endpoint)

- `200` — recipe accepted and created/updated as a Supabase draft. Response body includes the
  new Supabase `recipes.id`, which `ExportApproved.gs` writes back into
  `website_recipe_id` and sets `website_import_status = imported`.
- `4xx` — validation failure. Response body includes a list of field-level errors, which
  `ErrorLogger.gs` writes to the Import Errors sheet. `website_import_status` is left unchanged
  (not `rejected`) so it can be retried after correction — see §22, "never overwrite a published
  recipe automatically" and "reject the import" rules.
- `5xx` / network failure — treated as transient; `Notifications.gs` emails the owner, and the
  row is retried on the next export run.

## JSON schema

```json
{
  "recipeId": "recipe-0001",
  "source": {
    "driveFileId": "google-drive-file-id",
    "sourcePageNumber": 1,
    "googleDocId": "google-doc-id"
  },
  "recipe": {
    "slug": "ragi-dosa",
    "title": {
      "ta": "கேழ்வரகு தோசை",
      "en": "Ragi Dosa"
    },
    "description": {
      "ta": "...",
      "en": "..."
    },
    "prepTimeMinutes": 20,
    "cookTimeMinutes": 15,
    "totalTimeMinutes": 35,
    "servings": 4,
    "difficulty": "easy",
    "seo": {
      "titleTa": "...",
      "titleEn": "...",
      "descriptionTa": "...",
      "descriptionEn": "..."
    }
  },
  "categories": ["millet", "breakfast"],
  "ingredients": [
    {
      "displayOrder": 1,
      "name": { "ta": "கேழ்வரகு மாவு", "en": "Ragi flour" },
      "quantity": "1",
      "unit": { "ta": "கப்", "en": "cup" },
      "notes": { "ta": null, "en": null },
      "isUncertain": false,
      "uncertaintyNotes": null
    }
  ],
  "instructions": [
    {
      "stepNumber": 1,
      "ta": "...",
      "en": "...",
      "isUncertain": false,
      "uncertaintyNotes": null
    }
  ],
  "approval": {
    "tamilApproved": true,
    "translationApproved": true,
    "uncertaintyResolved": true
  }
}
```

### Notes on fields not in `CLAUDE.md`'s example

- **`categories`** — `CLAUDE.md` §12's example doesn't include a categories field, but the
  Recipe Tracker's `category` column (documented in `sheet-schema.md`) needs to go somewhere.
  This field is populated from the review Doc's `Categories:` field if present (comma-separated
  slugs), falling back to the Sheet's `category` column otherwise. It's advisory either way: the
  Next.js admin's `structure` step (§21) can still add/remove categories before publish.

### Where each `recipe.*` field actually comes from

The Recipe Tracker sheet only has columns for `tamil_title`/`english_title` (see
`sheet-schema.md`) — it has no columns for description, prep/cook/total time, servings, or
difficulty. Those only exist in the approved review Doc's `STRUCTURED DATA REVIEW` section
(`google-doc-template.md`), so `ExportApproved.gs` parses the Doc at export time
(`parseReviewDocument_` in `GoogleDocsWorkflow.gs`) to fill them in. Title prefers the Doc's
`Tamil Title:`/`English Title:` fields, falling back to the Sheet's mirrored columns if the Doc
fields are somehow empty. `recipe.seo.*` has no source anywhere in the Workspace pipeline — the
Doc template doesn't include SEO fields — so it is always `null` here and gets filled in later in
the Next.js admin, never sourced from Workspace.

Everything else matches `CLAUDE.md` §12 exactly — do not rename or restructure fields without
updating both this document and §12.

## Required fields (from §12)

- Recipe ID
- Google Drive source file ID
- Google Docs ID
- Source page number
- Tamil fields (title, description, ingredients, instructions)
- English fields (title, description, ingredients, instructions)
- Ingredients (full list)
- Instructions (full list)
- Approval statuses
- Uncertainty statuses

## Validation performed on the receiving side (future work, listed here for contract clarity)

Per `CLAUDE.md` §22, the Next.js endpoint will: validate JSON syntax and schema (Zod), check
required bilingual fields, reject duplicate recipe IDs or conflicting slugs, verify category
existence, check ingredient/instruction ordering, verify approval and uncertainty statuses, and
produce a dry-run report before any Supabase write. None of this is implemented in this stage.
