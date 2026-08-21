# Apps Script — Recipe Content Pipeline

Automates the Google Workspace half of the recipe pipeline: detects new scans, runs Drive-native
OCR, builds the review Doc, tracks status in Sheets, and exports approved recipes to the website.

**Status: scaffold only.** No live deployment, no real folder/sheet IDs, no real credentials.
Every ID in `Config.gs` is read from Script Properties and must be filled in manually — see
`../docs/google-workspace-setup.md` for the full setup checklist.

## Files

| File                    | Purpose                                                                     |
| ----------------------- | --------------------------------------------------------------------------- |
| `appsscript.json`       | Manifest — Advanced Drive Service (v2), OAuth scopes, timezone              |
| `Config.gs`             | Script Properties accessor + validation                                     |
| `DriveWatcher.gs`       | Detects new scans, creates tracker rows                                     |
| `OcrWorkflow.gs`        | Drive-native OCR conversion                                                 |
| `GoogleDocsWorkflow.gs` | Builds/moves the review Doc, parses it back to structured fields for export |
| `SheetTracker.gs`       | Sheet read/write helpers, custom menu                                       |
| `ExportApproved.gs`     | Builds and POSTs the approved-recipe JSON export                            |
| `Notifications.gs`      | Owner email notifications                                                   |
| `ErrorLogger.gs`        | Writes to the Import Errors sheet + `09_Logs`                               |

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
5. Set up the `onOpen`, `checkForNewScans`, and (once the import endpoint exists)
   `exportApprovedRecipes` triggers.

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

- No folder ID, sheet ID, endpoint URL, or secret is hardcoded anywhere in these files — see
  `Config.gs`.
- `IMPORT_WEBHOOK_SECRET` authenticates the export POST to `/api/import/v1`; treat it like any
  other credential — Script Properties, never in code or committed anywhere.
- Do not place a Supabase service-role key in this project. `CLAUDE.md` §10 explicitly disallows
  that outside a separately approved, secure integration design.
