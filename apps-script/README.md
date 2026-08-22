# Apps Script — Recipe Content Pipeline

Automates the Google Workspace half of the recipe pipeline: detects new scans, runs Drive-native
OCR, builds the review Doc, tracks status in Sheets, and exports each approved recipe as a
standalone JSON file. The website has no database and no API to push to — Cloudflare Pages serves
a static build of `content/recipes/*.json` (see `../docs/architecture.md`). The owner copies the
exported files from Drive into that folder and commits them; that's what actually publishes a
recipe.

**Status: scaffold only.** No live deployment, no real folder/sheet IDs, no real credentials.
Every ID in `Config.gs` is read from Script Properties and must be filled in manually — see
`../docs/google-workspace-setup.md` for the full setup checklist.

## Files

| File                    | Purpose                                                                                  |
| ----------------------- | ---------------------------------------------------------------------------------------- |
| `appsscript.json`       | Manifest — Advanced Drive Service (v2), OAuth scopes, timezone                           |
| `Config.gs`             | Script Properties accessor + validation                                                  |
| `DriveWatcher.gs`       | Detects new scans, creates tracker rows                                                  |
| `OcrWorkflow.gs`        | Drive-native OCR conversion                                                              |
| `GoogleDocsWorkflow.gs` | Builds/moves the review Doc, parses it back to structured fields for export              |
| `SheetTracker.gs`       | Sheet read/write helpers, custom menu                                                    |
| `ExportApproved.gs`     | Writes each approved recipe as `content/recipes/<slug>.json`-shaped file to `07_Exports` |
| `Notifications.gs`      | Owner email notifications                                                                |
| `ErrorLogger.gs`        | Writes to the Import Errors sheet + `09_Logs`                                            |

## Why Drive-native OCR, not Cloud Vision

Earlier sections of `CLAUDE.md` (§9, §11, §34) describe Google Cloud Vision as the approved OCR
provider. A later addendum at the end of `CLAUDE.md` ("Google Drive OCR Implementation")
supersedes that and requires the Advanced Drive Service instead. This scaffold follows the
addendum — see `../docs/architecture.md` section 4 for the full explanation. If Cloud Vision is
reintroduced later, `OcrWorkflow.gs` is the only file that needs to change; every other script
only knows about "OCR happened, here's the text," not which provider produced it.

## Setting up this project

1. Create the Drive folders, Sheets workbook, and bind an Apps Script project to the spreadsheet
   (**Extensions → Apps Script**) — full steps in `../docs/google-workspace-setup.md`.
2. Copy these files into the bound project, either through the Apps Script editor directly, or
   with [`clasp`](https://github.com/google/clasp) (`clasp push` from this directory, after
   `clasp login` and pointing `.clasp.json` — not included here — at the bound project's script
   ID).
3. Enable the Drive API **v2** advanced service (Services → + → Drive API).
4. Fill in every Script Property listed in `Config.gs`'s `REQUIRED_SCRIPT_PROPERTIES_`.
5. Set up the `onOpen` and `checkForNewScans` triggers. `exportApprovedRecipes` is run manually
   from the menu — there's no reason to schedule it, since a file landing in `07_Exports` doesn't
   do anything until a human copies it into the repo.

## Custom menu

Once bound and opened, the spreadsheet shows:

```text
Recipe Pipeline
├── Process selected scan
├── Retry failed OCR
├── Create review document
├── Mark selected recipe ready for import
├── Export approved recipes
└── Open project documentation
```

## Security

- No folder ID, sheet ID, or credential is hardcoded anywhere in these files — see `Config.gs`.
- No network calls leave this project anymore (`script.external_request` was removed from
  `appsscript.json` along with the last `UrlFetchApp` call) — everything Apps Script writes stays
  inside Drive/Sheets/Docs until a human moves it.
- Exported files never include a Google Drive file ID, Doc ID, or URL, or `is_uncertain`/
  `uncertainty_notes` — those fields are simply never written to the export, not filtered out
  downstream. See the comment block in `ExportApproved.gs`'s `buildRecipeContent_`.
