# Google Drive Folder Structure

Source of truth: `CLAUDE.md` §6. This document expands each folder's purpose and rules so the
Apps Script scaffold and setup guide can reference it.

## Folder tree

```text
Recipe Project/
├── 01_Original_Scans/
├── 02_OCR_Output/
├── 03_Tamil_Proofread/
├── 04_English_Translation/
├── 05_Approved_Recipes/
├── 06_Recipe_Images/
├── 07_Exports/
├── 08_Archive/
└── 09_Logs/
```

## Folder-by-folder purpose

| Folder                   | Purpose                                                                                                                                                                                                                                                                                                                                                                                  | Written by                                                 | Read by                                             |
| ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- | --------------------------------------------------- |
| `01_Original_Scans`      | The private, permanent source of truth — raw scanned pages (JPG/PNG/PDF) as uploaded by the owner. **Never modified or overwritten.**                                                                                                                                                                                                                                                    | Owner (manual upload)                                      | `DriveWatcher.gs`, `OcrWorkflow.gs`                 |
| `02_OCR_Output`          | Raw Drive-OCR conversion result (a Google Doc containing unedited OCR text) for each scan. Kept separate from the proofread version so the original machine output is always recoverable.                                                                                                                                                                                                | `OcrWorkflow.gs`                                           | `GoogleDocsWorkflow.gs`                             |
| `03_Tamil_Proofread`     | The structured review Google Doc (see `google-doc-template.md`) while Tamil correction is in progress or complete.                                                                                                                                                                                                                                                                       | `GoogleDocsWorkflow.gs`, owner (editing)                   | Owner, `SheetTracker.gs`                            |
| `04_English_Translation` | The same review Doc once it has moved into the English-translation stage. Implementation choice: the Doc is moved here (not copied) when `tamil_review_status` becomes `approved`, so there is always exactly one live copy of the review Doc.                                                                                                                                           | Owner (editing), `SheetTracker.gs` (move on status change) | Owner                                               |
| `05_Approved_Recipes`    | Final copy of the review Doc once the recipe reaches `website_import_status = ready_for_import`. The Doc is moved here as a durable record of what was approved, independent of later edits.                                                                                                                                                                                             | `ExportApproved.gs`                                        | Owner (audit)                                       |
| `06_Recipe_Images`       | Curated public-facing photos the owner wants to use for a recipe, staged here before being copied into `public/images/recipes/<slug>/` in the repository (no Supabase Storage — see `cloudflare-pages-deployment.md`, "Image rules"). **Not** a source for `source_scans` — categorically separate from private original scans, and never linked directly from Drive on the public site. | Owner                                                      | Owner (copies into `public/images/recipes/<slug>/`) |
| `07_Exports`             | The actual publishing hand-off point: each approved recipe as `<slug>.json`, in exactly the shape `content/recipes/<slug>.json` expects. The owner copies these into the repo and commits — that's what makes a recipe live. Re-running the export overwrites the file in place.                                                                                                         | `ExportApproved.gs`                                        | Owner (copies into `content/recipes/`)              |
| `08_Archive`             | Recipes withdrawn from the pipeline (duplicates, abandoned scans, rejected content) — moved here instead of deleted.                                                                                                                                                                                                                                                                     | Owner (manual), Apps Script (future)                       | Owner                                               |
| `09_Logs`                | Daily error/log files written by `ErrorLogger.gs`, supplementing the "Import Errors" sheet with a durable file-based log.                                                                                                                                                                                                                                                                | `ErrorLogger.gs`                                           | Owner                                               |

## Rules

- Never modify files in `01_Original_Scans`.
- Never overwrite original scan files.
- Every source file must retain its Google Drive file ID — this ID is stored in the Recipe
  Tracker sheet. It is never written to `content/recipes/*.json` (see `import-export-format.md`,
  "Deliberately excluded fields").
- Keep OCR output separate from original scans.
- Keep review documents separate from OCR output.
- Keep approved exports separate from working files.
- Keep private source files private — never share `01_Original_Scans`–`05_Approved_Recipes`
  outside the owner/editor accounts.
- Do not expose Google Drive URLs on public recipe pages.
- Do not copy private source scans into `public/` or anywhere else in the repository
  (`cloudflare-pages-deployment.md`, "Image rules").

## File naming convention

```text
scan-page-001.jpg
scan-page-002.jpg
recipe-0001-review          (Google Doc, in 03_Tamil_Proofread / 04_English_Translation)
recipe-0001-approved        (Google Doc, in 05_Approved_Recipes)
ragi-dosa.json               (in 07_Exports, and later content/recipes/ -- named by slug, not recipe_id)
```

`recipe_id` values are sequential, zero-padded to 4 digits, assigned by `DriveWatcher.gs` when a
new scan is first detected -- used for internal tracking (Sheet rows, Doc/folder names). Exported
JSON files are named by the recipe's `slug` instead, since that's what the website actually routes
on.

## Folder IDs

Every folder ID referenced by Apps Script is a placeholder until the owner creates the actual
Drive folders and records their IDs in Script Properties (see `Config.gs` and
`google-workspace-setup.md`). No folder ID is ever hardcoded in code.
