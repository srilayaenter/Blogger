# Google Workspace Setup Guide

This is a manual setup checklist for the owner. Nothing in this document is automated — Apps
Script cannot create its own container Sheet or Drive folders on first run. Everything here uses
placeholders; **no real IDs, credentials, or deployments are created by this repository.**

## 1. Create the Drive folder structure

Create a top-level folder named `Recipe Project` with the 9 subfolders listed in
`drive-folder-structure.md`. Record each folder's ID (from its Drive URL, the segment after
`/folders/`) — you'll need all nine in step 4.

## 2. Create the Sheets workbook

Create a new Google Sheet named **Recipe Content Pipeline**, with five tabs matching
`sheet-schema.md` exactly: `Recipe Tracker`, `Ingredients`, `Instructions`, `Categories`,
`Import Errors`. Add the header row to each tab using the column names from that document —
Apps Script assumes header row 1 matches those names exactly.

## 3. Create and bind the Apps Script project

From the Recipe Content Pipeline spreadsheet: **Extensions → Apps Script**. This creates a
container-bound script tied to the spreadsheet (required so `onOpen()` can add the custom menu).

Copy the contents of `apps-script/*.gs` and `apps-script/appsscript.json` into the bound project
(via the Apps Script editor, or `clasp push` if using the CLI — see `apps-script/README.md`).

### Enable the Advanced Drive Service

In the Apps Script editor: **Services → +** → select **Drive API**, version **v2** (not v3 —
v3 dropped the `ocr`/`ocrLanguage` conversion parameters that native OCR relies on). This also
requires the Drive API to be enabled in the linked Google Cloud project (Apps Script prompts for
this automatically the first time the service is used).

> **Verify before relying on this in production.** Google's OCR-via-conversion behavior on the
> Drive API has changed over time and is inconsistently documented. Before processing the real
> collection, run `OcrWorkflow.gs` against 2–3 sample scans and manually confirm the OCR quality
> and that Tamil text is actually recognized — see `CLAUDE.md`'s OCR-implementation addendum.

## 4. Set Script Properties

In the Apps Script editor: **Project Settings → Script Properties**. Add every key below with
the owner's actual values — none of these are in code:

```text
ORIGINAL_SCANS_FOLDER_ID
OCR_OUTPUT_FOLDER_ID
TAMIL_PROOFREAD_FOLDER_ID
ENGLISH_TRANSLATION_FOLDER_ID
APPROVED_RECIPES_FOLDER_ID
RECIPE_IMAGES_FOLDER_ID
EXPORTS_FOLDER_ID
LOGS_FOLDER_ID
RECIPE_TRACKER_SHEET_ID
GOOGLE_CLOUD_PROJECT_ID
OCR_LANGUAGE_HINT
IMPORT_ENDPOINT_URL
IMPORT_WEBHOOK_SECRET
NOTIFICATION_EMAIL
```

Notes:

- `RECIPE_TRACKER_SHEET_ID` is the spreadsheet ID (from the Sheet's URL), used so the script can
  find its sheets even though it's container-bound.
- `GOOGLE_CLOUD_PROJECT_ID` is reserved for a possible future Cloud Vision fallback (see
  `architecture.md` §4) — currently unused by `OcrWorkflow.gs`.
- `OCR_LANGUAGE_HINT` should be `ta`.
- `IMPORT_ENDPOINT_URL` and `IMPORT_WEBHOOK_SECRET` are placeholders until the Next.js
  `/api/import/v1` endpoint exists — do not point these at a real deployment yet.

## 5. Set up triggers

From the Apps Script editor **Triggers** page:

- `onOpen` — installable trigger, **On open**, so the custom menu appears every time the
  spreadsheet is opened. (A simple `onOpen(e)` also works for the basic menu, but an installable
  trigger is required if the menu needs to call functions that access services requiring
  authorization.)
- `checkForNewScans` (in `DriveWatcher.gs`) — time-driven, recommended every 15–30 minutes, to
  pick up newly uploaded scans automatically. Manual processing via the menu is also always
  available.
- `exportApprovedRecipes` (in `ExportApproved.gs`) — time-driven, recommended hourly or daily,
  once the import endpoint exists. Leave this trigger **disabled** until then; use the manual
  menu item for testing instead.

## 6. Test with a sample scan

1. Upload one sample scanned page to `01_Original_Scans`.
2. Open the spreadsheet, use **Recipe Pipeline → Process selected scan** (or wait for the
   scheduled trigger).
3. Confirm a new row appears in `Recipe Tracker` with `ocr_status = extracted` (or `failed`, in
   which case check the `Import Errors` sheet and `09_Logs`).
4. Confirm a review Doc was created in `03_Tamil_Proofread` and matches
   `google-doc-template.md`.
5. Manually proofread, translate, and approve the sample recipe, then run
   **Recipe Pipeline → Export approved recipes** and confirm a JSON file appears in
   `07_Exports` matching `import-export-format.md`. The HTTP POST will fail until
   `IMPORT_ENDPOINT_URL` points at a real endpoint — that's expected at this stage.

## Out of scope for this stage

- Creating the actual Google Cloud project or enabling billing.
- Generating or storing real credentials.
- Deploying the Apps Script project for live/production use.
- Implementing `/api/import/v1`.
