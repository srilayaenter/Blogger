# Google Docs Review Template

Source of truth: `CLAUDE.md` §8. One review Doc is created per recipe/source scan by
`GoogleDocsWorkflow.gs`, using the exact structure below.

## Template text

```text
Recipe ID:
Source Drive File ID:
Source Page Number:
Source Scan URL:

================================
TAMIL SOURCE AND PROOFREADING
================================

Tamil Title:

Tamil Description:

Tamil Ingredients:

1.
2.
3.

Tamil Instructions:

1.
2.
3.

Tamil Tips:

================================
ENGLISH TRANSLATION
================================

English Title:

English Description:

English Ingredients:

1.
2.
3.

English Instructions:

1.
2.
3.

English Tips:

================================
STRUCTURED DATA REVIEW
================================

Preparation Time:
Cooking Time:
Total Time:
Servings:
Difficulty:
Categories:

================================
UNCERTAINTY REVIEW
================================

Uncertain fields:

Uncertainty notes:

Resolution:

================================
APPROVAL
================================

Tamil reviewed by:

English reviewed by:

Final approval:

Approval date:
```

## What Apps Script fills in automatically

`GoogleDocsWorkflow.gs` creates the Doc immediately after `OcrWorkflow.gs` produces a raw OCR
result, and pre-fills only:

- `Recipe ID` — from the Recipe Tracker row.
- `Source Drive File ID` — the original scan's Drive file ID.
- `Source Page Number` — from the Recipe Tracker row, if already known.
- `Source Scan URL` — a Drive `webViewLink` to the original scan (not a public link).
- The raw OCR text is inserted as an unformatted block **before** the `TAMIL SOURCE AND
PROOFREADING` section heading — not inside it — clearly marked `[RAW OCR — VERIFY AGAINST
SCAN, DO NOT PUBLISH AS-IS]`. It's deliberately kept outside the section so it's never mistaken
  for corrected content, and so the export parser (`parseReviewDocument_` in
  `GoogleDocsWorkflow.gs`) never captures it as part of `Tamil Description`.

Everything else in the Doc starts blank and is filled in by the owner during proofreading and
translation.

## What the owner fills in manually

- Corrected Tamil title, description, ingredients, instructions, tips (replacing/editing the raw
  OCR block).
- English translation of every Tamil field, consistent with `translation-glossary.md`.
- Structured data: preparation/cooking/total time, servings, difficulty, categories (comma-
  separated slugs, matching the Categories sheet).
- Any uncertain field, with a note explaining what's unclear and a reference to the source page.
- Final approval: reviewer name(s) and date, once both Tamil and English are verified against the
  original scan.

## Rules

- The original scan must be visible or easily accessible during proofreading — the `Source Scan
URL` field exists specifically for this.
- Do not approve content without comparing it to the scan.
- Never overwrite the raw-OCR marker block until the corrected text has been reviewed — it exists
  so a reviewer can always see what the machine actually produced versus what was corrected.

## Where the Doc lives

The Doc is created in `03_Tamil_Proofread`, moved to `04_English_Translation` when
`tamil_review_status` becomes `approved`, and moved to `05_Approved_Recipes` when
`website_import_status` becomes `ready_for_import` and the export succeeds. See
`drive-folder-structure.md` for the full folder lifecycle.
