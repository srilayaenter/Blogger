# Google Sheets Workbook Schema

Source of truth: `CLAUDE.md` §7. Spreadsheet name: **Recipe Content Pipeline**.

Google Sheets is a workflow and collaboration tool. **Google Sheets is not the production
database** — Supabase is. Nothing here is queried by the public website.

## Sheet: Recipe Tracker

One row per recipe/source scan. Primary key: `recipe_id`.

| Column                  | Type     | Written by                      | Notes                                                                                                                                                                                                                 |
| ----------------------- | -------- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `recipe_id`             | text     | `DriveWatcher.gs`               | Sequential, e.g. `recipe-0001`. Assigned once, never reused.                                                                                                                                                          |
| `source_file_id`        | text     | `DriveWatcher.gs`               | Google Drive file ID of the original scan.                                                                                                                                                                            |
| `source_file_name`      | text     | `DriveWatcher.gs`               | Original scan filename, for human reference.                                                                                                                                                                          |
| `source_page_number`    | number   | Owner                           | Filled in manually if not derivable from filename.                                                                                                                                                                    |
| `tamil_title`           | text     | Owner (via review Doc sync)     | Mirrors the Doc's Tamil Title field.                                                                                                                                                                                  |
| `english_title`         | text     | Owner (via review Doc sync)     | Mirrors the Doc's English Title field.                                                                                                                                                                                |
| `category`              | text     | Owner                           | Optional. Comma-separated category slugs (e.g. `millet,breakfast`) — see `import-export-format.md` for how this becomes the `categories[]` export field. Final assignment can still be adjusted in the Next.js admin. |
| `google_doc_id`         | text     | `GoogleDocsWorkflow.gs`         | ID of the structured review Doc.                                                                                                                                                                                      |
| `google_doc_url`        | text     | `GoogleDocsWorkflow.gs`         | Convenience link for the owner.                                                                                                                                                                                       |
| `ocr_status`            | enum     | `OcrWorkflow.gs`                | `pending`, `processing`, `extracted`, `failed`                                                                                                                                                                        |
| `tamil_review_status`   | enum     | Owner                           | `pending`, `in_progress`, `approved`                                                                                                                                                                                  |
| `translation_status`    | enum     | Owner                           | `pending`, `in_progress`, `approved`                                                                                                                                                                                  |
| `uncertainty_status`    | enum     | Owner                           | `none`, `needs_clarification`, `resolved`                                                                                                                                                                             |
| `website_import_status` | enum     | Owner, `ExportApproved.gs`      | `not_ready`, `ready_for_import`, `imported`, `rejected`, `published`                                                                                                                                                  |
| `website_recipe_id`     | text     | Set after import (future stage) | Supabase `recipes.id`, filled once the Next.js import endpoint responds.                                                                                                                                              |
| `last_updated`          | datetime | All scripts                     | Set on every write.                                                                                                                                                                                                   |
| `notes`                 | text     | Owner                           | Free-text working notes.                                                                                                                                                                                              |

### Allowed values

```text
ocr_status:            pending | processing | extracted | failed
tamil_review_status:   pending | in_progress | approved
translation_status:    pending | in_progress | approved
uncertainty_status:    none | needs_clarification | resolved
website_import_status: not_ready | ready_for_import | imported | rejected | published
```

**`website_import_status` meaning has shifted** since there's no more website API to confirm
anything (`architecture.md`): `ExportApproved.gs` sets `imported` once it has successfully written
`<slug>.json` to `07_Exports` — it means "exported, ready for the owner to copy into the repo,"
not "live on the site." `published` is never set automatically; set it by hand once you've
actually committed the file and confirmed it's live. `rejected` is effectively unused now (there's
no server left to reject anything) but stays in the enum for continuity with this column's
original design.

## Sheet: Ingredients

One row per ingredient. Foreign key: `recipe_id` → Recipe Tracker.

| Column              | Notes                             |
| ------------------- | --------------------------------- |
| `recipe_id`         |                                   |
| `display_order`     | Integer, 1-based                  |
| `ingredient_ta`     |                                   |
| `ingredient_en`     |                                   |
| `quantity`          | Free text (e.g. `1`, `1/2`)       |
| `unit_ta`           |                                   |
| `unit_en`           |                                   |
| `notes_ta`          |                                   |
| `notes_en`          |                                   |
| `is_uncertain`      | `TRUE` / `FALSE`                  |
| `uncertainty_notes` | Required if `is_uncertain = TRUE` |

## Sheet: Instructions

One row per step. Foreign key: `recipe_id` → Recipe Tracker.

| Column              | Notes                                     |
| ------------------- | ----------------------------------------- |
| `recipe_id`         |                                           |
| `step_number`       | Integer, 1-based, sequential with no gaps |
| `instruction_ta`    |                                           |
| `instruction_en`    |                                           |
| `is_uncertain`      | `TRUE` / `FALSE`                          |
| `uncertainty_notes` | Required if `is_uncertain = TRUE`         |

## Sheet: Categories

Reference list, not per-recipe. Kept in sync manually with Supabase `categories`.

| Column             | Notes                                 |
| ------------------ | ------------------------------------- |
| `category_slug`    | Must match Supabase `categories.slug` |
| `category_name_ta` |                                       |
| `category_name_en` |                                       |
| `description_ta`   |                                       |
| `description_en`   |                                       |

## Sheet: Import Errors

Append-only log written by `ErrorLogger.gs`.

| Column             | Notes                                                       |
| ------------------ | ----------------------------------------------------------- |
| `timestamp`        |                                                             |
| `recipe_id`        |                                                             |
| `source_file_id`   |                                                             |
| `error_type`       | e.g. `ocr_failed`, `export_rejected`, `doc_creation_failed` |
| `error_message`    |                                                             |
| `field_name`       | Optional, for field-level import validation errors          |
| `resolved`         | `TRUE` / `FALSE`                                            |
| `resolution_notes` |                                                             |

## Export eligibility gate

`ExportApproved.gs` only reads rows where every one of these holds (see
`import-export-format.md` for the full contract):

```text
tamil_review_status    = approved
translation_status     = approved
uncertainty_status     = resolved OR none
website_import_status  = ready_for_import
```
