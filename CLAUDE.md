# CLAUDE.md

# Tamil-English Recipe Website

## 1. Project Constitution

You are the senior solution architect, technical lead, and development assistant for this project.

The project is a greenfield bilingual Tamil-English recipe website based on a scanned Tamil recipe collection.

The system consists of two connected layers:

1. Google Workspace content pipeline.
2. Next.js public recipe website.

Google Workspace is used for source storage, OCR coordination, Tamil proofreading, English translation, recipe review, and approved content export.

Supabase is used for the final structured website database.

Next.js and Vercel are used for the public website and admin interface.

The owner of this project is Srikanth Ramasamy.

Do not change the approved architecture without first explaining the reason, impact, alternatives, and migration requirements.

Do not write application code until the requested architecture or implementation task is clearly understood.

---

## 2. Product Vision

Build a professional bilingual recipe platform from a collection of printed Tamil recipes.

The website must:

- Preserve the original Tamil content.
- Extract Tamil text from scanned pages.
- Allow manual Tamil proofreading.
- Provide accurate English translations.
- Store Tamil and English content independently.
- Support recipe search.
- Support many-to-many recipe categories.
- Display preparation and cooking information.
- Provide mobile-friendly recipe pages.
- Support search-engine optimization.
- Preserve source-page references.
- Prevent unverified content from being published.
- Support future millet products, digital cookbooks, food sales, and cooking content.

The first release is a recipe publishing platform.

The first release is not an e-commerce platform.

---

## 3. Approved Technology Stack

### Public Website

Use:

- Next.js with App Router.
- TypeScript.
- Tailwind CSS.
- Supabase PostgreSQL.
- Supabase Storage.
- Supabase Auth.
- Supabase generated TypeScript types.
- Vercel.
- GitHub.
- ESLint.
- Prettier.
- Vitest.
- Zod for validation.

### Content Pipeline

Use:

- Google Drive for original scans and project files.
- Google Sheets for recipe processing status.
- Google Docs for recipe proofreading and translation review.
- Google Apps Script for workflow automation.
- Google Cloud Vision API for Tamil OCR.

Google Apps Script is suitable for connecting and automating Drive, Sheets, Docs, and other Google Workspace services. [web:30]

Google Drive operations may use the built-in Drive service or the Advanced Drive service when required. [web:38][web:39]

Google Cloud Vision supports Tamil OCR using the language hint code `ta`. [web:11]

Do not use Prisma for MVP.

Use the Supabase server client and generated database types.

Do not add another CMS unless explicitly approved.

---

## 4. System Responsibilities

### Google Drive

Google Drive owns:

- Original scanned pages.
- OCR output.
- Review documents.
- Translation documents.
- Approved JSON exports.
- Private source backups.

### Google Sheets

Google Sheets owns:

- Recipe processing status.
- Import tracking.
- Ingredient and instruction preparation.
- Categories.
- Review notes.
- Error tracking.

### Google Docs

Google Docs owns:

- Human-readable Tamil proofreading.
- English translation review.
- Recipe content review notes.
- Approval information.

### Google Apps Script

Apps Script owns:

- New scan detection.
- Drive file tracking.
- OCR workflow coordination.
- Google Docs template creation.
- Sheet updates.
- Review notifications.
- Approved JSON export.
- Error logging.

### Google Cloud Vision

Google Cloud Vision owns:

- Tamil text extraction from scanned images and documents.

OCR output is only a draft.

OCR output must always be checked against the original scan.

### Supabase

Supabase owns:

- Approved recipe records.
- Ingredients.
- Instructions.
- Categories.
- Public recipe images.
- Website status.
- Admin users.
- Website query and search data.

### Next.js

Next.js owns:

- Public bilingual pages.
- Locale routing.
- Recipe browsing.
- Search and filtering.
- Admin dashboard.
- Import validation.
- Supabase database access.
- SEO metadata.
- Recipe structured data.

---

## 5. Important Data Boundary

The approved content flow is:

```text
Google Drive
    ↓
Google Cloud Vision OCR
    ↓
Google Docs and Google Sheets review
    ↓
Approved JSON export
    ↓
Next.js dry-run import
    ↓
Supabase draft recipe
    ↓
Website review
    ↓
Published bilingual recipe
```

Do not create a live two-way synchronization system for MVP.

Use a controlled approved-export and import process.

This prevents:

- Accidental overwrites.
- Spreadsheet changes from modifying published recipes.
- Unclear ownership of content.
- Synchronization conflicts.
- Unreviewed OCR or translation reaching the website.

---

## 6. Google Drive Folder Structure

Create the following folder structure in Google Drive:

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

Rules:

- Never modify files in `01_Original_Scans`.
- Never overwrite original scan files.
- Every source file must retain its Google Drive file ID.
- Keep OCR output separate from original scans.
- Keep review documents separate from OCR output.
- Keep approved exports separate from working files.
- Keep private source files private.
- Do not expose Google Drive URLs on public recipe pages.
- Do not upload private source scans to public Supabase Storage.

Recommended file names:

```text
scan-page-001.jpg
scan-page-002.jpg
recipe-0001-review
recipe-0001-approved
recipe-0001-export.json
```

---

## 7. Google Sheets Workbook

Create a Google Spreadsheet named:

```text
Recipe Content Pipeline
```

### Sheet: Recipe Tracker

Columns:

```text
recipe_id
source_file_id
source_file_name
source_page_number
tamil_title
english_title
category
google_doc_id
google_doc_url
ocr_status
tamil_review_status
translation_status
uncertainty_status
website_import_status
website_recipe_id
last_updated
notes
```

Allowed values:

```text
ocr_status:
pending
processing
extracted
failed

tamil_review_status:
pending
in_progress
approved

translation_status:
pending
in_progress
approved

uncertainty_status:
none
needs_clarification
resolved

website_import_status:
not_ready
ready_for_import
imported
rejected
published
```

### Sheet: Ingredients

Columns:

```text
recipe_id
display_order
ingredient_ta
ingredient_en
quantity
unit_ta
unit_en
notes_ta
notes_en
is_uncertain
uncertainty_notes
```

### Sheet: Instructions

Columns:

```text
recipe_id
step_number
instruction_ta
instruction_en
is_uncertain
uncertainty_notes
```

### Sheet: Categories

Columns:

```text
category_slug
category_name_ta
category_name_en
description_ta
description_en
```

### Sheet: Import Errors

Columns:

```text
timestamp
recipe_id
source_file_id
error_type
error_message
field_name
resolved
resolution_notes
```

Google Sheets is a workflow and collaboration tool.

Google Sheets is not the production database.

---

## 8. Google Docs Review Template

Create one review Google Doc per recipe or per source scan.

Use this structure:

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

The original scan must be visible or easily accessible during proofreading.

Do not approve content without comparing it to the scan.

---

## 9. OCR Workflow

The approved OCR provider is Google Cloud Vision.

Use Tamil language hints:

```text
languageHints: ["ta"]
```

Use document text detection for scanned recipe pages.

Workflow:

1. Upload a scan to `01_Original_Scans`.
2. Detect the new file through Apps Script.
3. Create a recipe tracker row.
4. Assign a unique `recipe_id`.
5. Send the scan to Google Cloud Vision.
6. Save raw OCR text to `02_OCR_Output`.
7. Create a Google Docs review document.
8. Link the review document to the tracker.
9. Compare OCR text with the original scan.
10. Correct Tamil text manually.
11. Mark Tamil proofreading as approved.
12. Add English translation.
13. Review the English translation.
14. Structure ingredients and instructions.
15. Mark ambiguous content as uncertain.
16. Resolve all uncertainties.
17. Mark the recipe as ready for import.
18. Export approved content as JSON.
19. Upload JSON to the website admin import page.
20. Run dry-run validation.
21. Import the recipe as a website draft.
22. Review the website preview.
23. Publish only after final approval.

Rules:

- Never automatically publish OCR output.
- Never automatically treat machine translation as final.
- Never guess unclear quantities.
- Never guess unclear ingredients.
- Never silently change the Tamil meaning.
- Preserve source-page references.
- Preserve raw OCR output.
- Preserve corrected Tamil text.

---

## 10. Apps Script Project

Create the Apps Script project under:

```text
apps-script/
```

Suggested files:

```text
apps-script/
├── README.md
├── appsscript.json
├── Config.gs
├── DriveWatcher.gs
├── OcrWorkflow.gs
├── GoogleDocsWorkflow.gs
├── SheetTracker.gs
├── ExportApproved.gs
├── Notifications.gs
└── ErrorLogger.gs
```

Required Apps Script features:

- Custom Google Sheets menu.
- Manual scan processing.
- Scheduled scan detection.
- OCR processing.
- Google Docs creation.
- Recipe tracker updates.
- Failed-job retry.
- Review notifications.
- Approved JSON export.
- Error logging.

Custom menu:

```text
Recipe Pipeline
├── Process selected scan
├── Retry failed OCR
├── Create review document
├── Mark selected recipe ready for import
├── Export approved recipes
└── Open project documentation
```

Configuration must use Script Properties:

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
OCR_ENDPOINT
NOTIFICATION_EMAIL
```

Do not hardcode:

- Folder IDs.
- Spreadsheet IDs.
- Document IDs.
- API keys.
- Service credentials.
- Email addresses.

Do not place Supabase service-role keys in Apps Script unless a separately approved secure integration is designed.

---

## 11. Google Cloud Vision Configuration

Required Google Cloud configuration:

- Create or use a dedicated Google Cloud project.
- Enable the Cloud Vision API.
- Configure billing if required.
- Create appropriate credentials.
- Restrict credentials to the required API.
- Do not commit credentials to Git.
- Store credentials securely.
- Log OCR failures without logging secrets.

OCR requests must use Tamil language configuration.

Example conceptual configuration:

```json
{
  "imageContext": {
    "languageHints": ["ta"]
  }
}
```

OCR accuracy must be tested using a small sample of actual scanned pages before processing the complete collection.

---

## 12. Approved Export Format

Export only recipes where:

```text
tamil_review_status = approved
translation_status = approved
uncertainty_status = resolved or none
website_import_status = ready_for_import
```

Use JSON as the primary exchange format.

Example:

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
  "ingredients": [
    {
      "displayOrder": 1,
      "name": {
        "ta": "கேழ்வரகு மாவு",
        "en": "Ragi flour"
      },
      "quantity": "1",
      "unit": {
        "ta": "கப்",
        "en": "cup"
      },
      "notes": {
        "ta": null,
        "en": null
      },
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

The export must include:

- Recipe ID.
- Google Drive source file ID.
- Google Docs ID.
- Source page number.
- Tamil fields.
- English fields.
- Ingredients.
- Instructions.
- Approval statuses.
- Uncertainty statuses.

---

## 13. Database Schema

Create these tables:

```text
admin_users
categories
recipes
ingredients
instructions
recipe_categories
source_scans
```

### `admin_users`

```text
id
email
role
created_at
```

### `categories`

```text
id
slug
name_ta
name_en
description_ta
description_en
created_at
updated_at
```

### `recipes`

```text
id
slug
title_ta
title_en
description_ta
description_en
source_page_number
prep_time_minutes
cook_time_minutes
total_time_minutes
servings
difficulty
featured_image_url
status
seo_title_ta
seo_title_en
seo_description_ta
seo_description_en
google_drive_source_file_id
created_by
updated_by
published_at
created_at
updated_at
```

### `ingredients`

```text
id
recipe_id
name_ta
name_en
quantity
unit_ta
unit_en
notes_ta
notes_en
display_order
is_uncertain
uncertainty_notes
```

### `instructions`

```text
id
recipe_id
step_number
instruction_ta
instruction_en
image_url
display_order
is_uncertain
uncertainty_notes
```

### `recipe_categories`

```text
recipe_id
category_id
```

### `source_scans`

```text
id
recipe_id
page_number
image_url
google_drive_file_id
google_doc_id
ocr_provider
ocr_raw_text
ocr_status
corrected_text_ta
review_status
uploaded_by
created_at
updated_at
```

The `source_scans` table must preserve the relationship between the website recipe and the private Google Drive source.

---

## 14. Database Rules

Use these enum values:

```text
recipe_status:
draft
review
published
archived

recipe_difficulty:
easy
medium
hard

scan_ocr_status:
pending
processing
extracted
failed
corrected
verified

admin_role:
owner
editor
```

Use foreign keys and cascading deletes carefully.

Deleting a recipe may delete its structured ingredients and instructions.

Deleting a source scan must not delete the recipe.

Do not delete original Drive source files from the website application.

Use `updated_at` triggers for mutable tables.

Use generated Supabase TypeScript types.

---

## 15. Row-Level Security

Enable Row-Level Security on all Supabase tables.

Public users may read:

- Published recipes.
- Ingredients belonging to published recipes.
- Instructions belonging to published recipes.
- Categories.
- Recipe-category relationships belonging to published recipes.

Public users must not read:

- Draft recipes.
- Review recipes.
- Archived recipes.
- Source scans.
- Raw OCR text.
- Corrected source text unless intentionally exposed.
- Admin users.
- Internal uncertainty notes.

Admin users may create and modify content only after authentication and authorization checks.

Never expose the Supabase service-role key to the browser.

Use server-side Supabase clients for privileged operations.

---

## 16. Bilingual Routing

Supported locales:

```text
en
ta
```

Default locale:

```text
en
```

Use explicit locale routes:

```text
/en
/ta
/en/recipes/{slug}
/ta/recipes/{slug}
/en/categories/{slug}
/ta/categories/{slug}
```

Rules:

- `/` redirects to `/en`.
- Locale remains visible in the URL.
- The language switcher changes only the locale segment.
- Recipe slugs are shared between languages.
- Each locale page has its own canonical URL.
- Add `hreflang` alternates.
- Tamil pages use Tamil metadata.
- English pages use English metadata.
- Use Unicode Tamil characters.
- Use Tamil-compatible fonts.
- Do not use transliteration instead of Tamil unless explicitly requested.

Next.js supports localized routing and rendering patterns for multi-language applications. [web:20]

---

## 17. Translation Rules

Tamil is the source language.

English translations must be:

- Faithful.
- Clear.
- Natural.
- Suitable for home cooks.
- Consistent with the translation glossary.
- Free from invented ingredients or instructions.

Do not:

- Add information not present in the Tamil source.
- Remove important cooking context.
- Guess unclear quantities.
- Replace a culturally specific ingredient with an incorrect equivalent.
- Translate a Tamil ingredient inconsistently.

Maintain:

```text
docs/translation-glossary.md
```

Example glossary:

```text
கேழ்வரகு = ragi / finger millet
கம்பு = pearl millet
சாமை = little millet
தினை = foxtail millet
வரகு = kodo millet
துவரம் பருப்பு = toor dal
கடுகு = mustard seeds
உளுத்தம் பருப்பு = urad dal
பெருங்காயம் = asafoetida
```

If no exact English equivalent exists:

- Preserve the Tamil term.
- Add a short explanation if verified.
- Do not guess.

---

## 18. Public Website Structure

Use this public route structure:

```text
src/app/
└── [locale]/
    ├── layout.tsx
    ├── page.tsx
    ├── recipes/
    │   ├── page.tsx
    │   └── [slug]/
    │       └── page.tsx
    ├── categories/
    │   ├── page.tsx
    │   └── [slug]/
    │       └── page.tsx
    ├── about/
    │   └── page.tsx
    └── contact/
        └── page.tsx
```

Required public features:

- Home page.
- Recipe listing.
- Recipe detail page.
- Category listing.
- Category detail page.
- Recipe search.
- Category filtering.
- Related recipes.
- Language switcher.
- Print recipe button.
- Share button.
- Responsive design.
- Loading states.
- Empty states.
- Error states.

---

## 19. Recipe Page Requirements

Every recipe page should display:

- Localized title.
- Localized description.
- Featured image.
- Preparation time.
- Cooking time.
- Total time.
- Servings.
- Difficulty.
- Ingredients.
- Step-by-step instructions.
- Cooking tips.
- Related recipes.
- Print action.
- Share action.

Do not show:

- Raw OCR text.
- Internal uncertainty notes.
- Private Drive links.
- Google Docs links.
- Admin review notes.

Every image must have localized alt text.

---

## 20. SEO Requirements

Every published recipe page must include:

- Localized title.
- Localized meta description.
- Canonical URL.
- Open Graph metadata.
- Twitter or social metadata where appropriate.
- Recipe JSON-LD.
- Breadcrumb JSON-LD.
- Hreflang alternates.
- Sitemap inclusion.
- Correct image alt text.

Only published recipes may be included in:

- Search engine results.
- Sitemap.
- Recipe JSON-LD.
- Public category pages.
- Public related-recipe sections.

Do not create fake ratings or reviews.

Do not include structured data that is not visible or supported by the actual page content.

---

## 21. Admin Website Structure

Use:

```text
src/app/admin/
├── layout.tsx
├── login/
│   └── page.tsx
├── page.tsx
├── recipes/
│   ├── page.tsx
│   ├── new/
│   │   └── page.tsx
│   └── [id]/
│       └── edit/
│           └── page.tsx
├── categories/
│   └── page.tsx
└── import/
    ├── page.tsx
    ├── [scanId]/
    │   ├── review/
    │   │   └── page.tsx
    │   ├── structure/
    │   │   └── page.tsx
    │   └── preview/
    │       └── page.tsx
```

Admin functions:

- Login.
- Dashboard.
- Recipe CRUD.
- Ingredient management.
- Instruction management.
- Category management.
- Image upload.
- JSON import.
- Dry-run validation.
- Draft/review/publish workflow.
- Source scan reference.
- Uncertainty review.

---

## 22. Import Validation Rules

Before importing JSON:

1. Validate JSON syntax.
2. Validate schema using Zod.
3. Check required bilingual fields.
4. Check recipe ID duplicates.
5. Check slug conflicts.
6. Check category existence.
7. Check ingredient order.
8. Check instruction order.
9. Check approval statuses.
10. Check uncertainty statuses.
11. Verify source file ID.
12. Generate a dry-run report.

Reject the import if:

- Tamil approval is incomplete.
- English approval is incomplete.
- Any uncertainty is unresolved.
- Required fields are missing.
- The recipe ID already exists.
- The slug conflicts.
- The JSON structure is invalid.
- Ingredients or instructions are incomplete.

Never overwrite a published recipe automatically.

---

## 23. Storage Rules

### Google Drive

Use Google Drive for:

- Original scans.
- OCR results.
- Review documents.
- Translation documents.
- Approved exports.
- Private backups.

### Supabase Storage

Use Supabase Storage for:

- Public featured recipe images.
- Public recipe step images.
- Website media.

Do not store public recipe images by linking directly to private Google Drive files.

Do not expose private source documents to website visitors.

---

## 24. Security Requirements

Never commit:

- `.env` files.
- Google Cloud credentials.
- Supabase service-role keys.
- API keys.
- Private Drive URLs.
- Admin passwords.

Use environment variables for the website:

```text
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GOOGLE_CLOUD_PROJECT_ID=
GOOGLE_CLOUD_CREDENTIALS=
```

Use Script Properties for Apps Script configuration.

Restrict Google Drive sharing.

Enable two-step verification for project accounts.

Use separate accounts or roles for:

- Owner.
- Editor.
- Automation.

Check authorization for every admin mutation.

Do not trust client-side authorization alone.

---

## 25. Coding Standards

Use TypeScript strict mode.

Avoid `any`.

Use descriptive variable and function names.

Prefer small reusable components.

Use Server Components by default.

Use Client Components only for interaction.

Keep database logic outside page components.

Keep validation schemas in the validation module.

Handle loading, empty, and error states.

Do not leave debug logs in production code.

Do not use mock data in production paths.

Do not claim completion without running relevant checks.

---

## 26. Project Folder Structure

Use this structure:

```text
blogger/
├── .env.local.example
├── CLAUDE.md
├── package.json
├── next.config.ts
├── tsconfig.json
├── eslint.config.mjs
├── .prettierrc
├── vitest.config.ts
│
├── apps-script/
│   ├── README.md
│   ├── appsscript.json
│   ├── Config.gs
│   ├── DriveWatcher.gs
│   ├── OcrWorkflow.gs
│   ├── GoogleDocsWorkflow.gs
│   ├── SheetTracker.gs
│   ├── ExportApproved.gs
│   ├── Notifications.gs
│   └── ErrorLogger.gs
│
├── docs/
│   ├── architecture.md
│   ├── google-workspace-setup.md
│   ├── drive-folder-structure.md
│   ├── sheet-schema.md
│   ├── google-doc-template.md
│   ├── translation-glossary.md
│   ├── database-schema.md
│   ├── import-export-format.md
│   └── deployment.md
│
├── supabase/
│   ├── migrations/
│   │   └── 0001_init.sql
│   └── seed.sql
│
├── public/
│   └── images/site/
│
├── src/
│   ├── middleware.ts
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── types/
│   ├── config/
│   └── content/
│
└── tests/
    ├── unit/
    └── fixtures/
```

---

## 27. Supabase Library Structure

Use:

```text
src/lib/supabase/
├── client.ts
├── server.ts
├── admin.ts
└── database.types.ts
```

Rules:

- `client.ts` is for browser-safe operations.
- `server.ts` is for server-side authenticated operations.
- `admin.ts` is for service-role operations only.
- Never import `admin.ts` into Client Components.
- Never expose service-role credentials to the browser.
- Regenerate database types whenever the schema changes.

---

## 28. Recipe Library Structure

Use:

```text
src/lib/recipes/
├── queries.ts
├── mutations.ts
├── import.ts
├── slug.ts
├── search.ts
└── publish.ts
```

Rules:

- Public queries must filter for published status.
- Admin queries may access drafts only after authorization.
- Mutations must validate input.
- Publish operations must check all approval conditions.
- Import operations must support dry-run mode.
- Slugs must be unique and stable.

---

## 29. Internationalization Structure

Use:

```text
src/lib/i18n/
├── config.ts
├── getDictionary.ts
└── dictionaries/
    ├── en.json
    └── ta.json
```

Do not hardcode user-facing interface labels inside components.

Use dictionaries for:

- Navigation.
- Buttons.
- Error messages.
- Form labels.
- Search labels.
- Empty states.
- Accessibility labels.
- Metadata defaults.

Recipe content must come from Supabase bilingual fields.

---

## 30. Git Workflow

Initialize Git before application implementation.

Use small focused commits.

Commit format:

```text
feat: add bilingual route shell
feat: add recipe database migration
feat: add Google Workspace import validation
fix: correct Tamil language switcher
refactor: extract recipe query functions
docs: add Google Drive setup guide
test: add recipe import validation tests
chore: configure project tooling
```

Never:

- Delete user work.
- Reset the repository without approval.
- Rewrite history without approval.
- Commit secrets.
- Commit private scanned documents.
- Commit large generated files unnecessarily.

---

## 31. Development Workflow

For every task:

1. Restate the task.
2. Inspect the repository.
3. Identify relevant files.
4. Identify risks.
5. Propose a plan.
6. Ask approval for architectural changes.
7. Implement one focused change.
8. Run relevant checks.
9. Report changed files.
10. Report validation results.
11. Report limitations.
12. Suggest one next task.

Before writing code, use this format:

```text
Task:
[Short task description]

Understanding:
[What needs to be done]

Plan:
1. ...
2. ...
3. ...

Files likely affected:
- ...

Risks:
- ...

Approval required:
[Yes or No]
```

After writing code, use this format:

```text
Completed:
[What was implemented]

Files changed:
- ...

Validation:
- Lint: ...
- Type check: ...
- Tests: ...
- Build: ...

Known limitations:
- ...

Suggested next task:
[One logical next step]
```

---

## 32. Required Commands

Use the package manager defined by the repository.

Expected commands:

```bash
npm run dev
npm run lint
npm run typecheck
npm run test
npm run build
```

Inspect `package.json` before running or adding commands.

If a required command is missing, report it before changing project configuration.

---

## 33. MVP Milestones

### M0 — Bootstrap

- Initialize Git.
- Create Next.js application.
- Configure TypeScript.
- Configure Tailwind CSS.
- Configure ESLint.
- Configure Prettier.
- Configure Vitest.
- Create environment example.
- Create documentation folders.
- Add basic site shell.
- Confirm development and build commands.

Exit criteria:

```text
npm run dev succeeds
npm run lint succeeds
npm run typecheck succeeds
npm run build succeeds
```

### M1 — Supabase Database and Auth

- Create Supabase project.
- Add database migration.
- Add RLS.
- Add generated TypeScript types.
- Add Supabase clients.
- Add admin login.
- Add admin route protection.

Exit criteria:

- Owner can log in.
- Unauthenticated users cannot access admin pages.
- Public users cannot read draft recipes.

### M2 — Bilingual Website Shell

- Add `/en` and `/ta`.
- Add locale middleware.
- Add dictionaries.
- Add Tamil font.
- Add language switcher.
- Add responsive layout.

Exit criteria:

- Both locales render.
- Language switcher works.
- URLs remain locale-specific.

### M3 — Recipe Management

- Add recipe CRUD.
- Add ingredient editor.
- Add instruction editor.
- Add categories.
- Add image upload.
- Add recipe statuses.

Exit criteria:

- Owner can create and save a bilingual draft recipe.

### M4 — Public Website

- Add home page.
- Add recipe listing.
- Add recipe details.
- Add category pages.
- Add search.
- Add related recipes.
- Add responsive mobile design.

Exit criteria:

- Published recipe is browsable in both languages.

### M5 — Google Workspace Pipeline

- Document Drive folder setup.
- Create Sheet template.
- Create Docs template.
- Create Apps Script project.
- Add Drive scan tracking.
- Add OCR workflow.
- Add Tamil review workflow.
- Add English review workflow.
- Add uncertainty tracking.
- Add approved JSON export.

Exit criteria:

- One scanned recipe completes the full Workspace review process.

### M6 — Website Import

- Add JSON upload.
- Add dry-run validation.
- Add duplicate detection.
- Add uncertainty validation.
- Add Supabase import.
- Preserve Drive and Docs source references.

Exit criteria:

- One approved recipe imports as a website draft.

### M7 — SEO and Launch

- Add localized metadata.
- Add Recipe JSON-LD.
- Add canonical URLs.
- Add hreflang.
- Add sitemap.
- Add robots.
- Add print action.
- Add share action.
- Complete accessibility review.
- Complete performance review.
- Deploy to Vercel.

Exit criteria:

- Website is live with at least one verified published recipe.

---

## 34. Decisions Already Approved

The following decisions are final:

- Google Workspace is the content pipeline.
- Google Drive stores original scans.
- Google Sheets tracks workflow.
- Google Docs supports proofreading and translation review.
- Google Apps Script automates the workflow.
- Google Cloud Vision performs Tamil OCR.
- Tamil OCR requires manual verification.
- English translation requires human review.
- Supabase stores approved structured website data.
- Next.js provides the bilingual public website.
- Vercel hosts the website.
- Many-to-many categories are supported.
- Supabase server client is used.
- Generated Supabase types are used.
- Prisma is not used for MVP.
- Separate `/en` and `/ta` routes are used.
- Approved JSON import is used for MVP.
- No live two-way Workspace synchronization is used for MVP.
- No automatic publishing is allowed.
- Original scans must be preserved.

---

## 35. Decisions Requiring Approval

Ask the owner before implementing any of the following:

- Google Cloud project and billing configuration.
- Google Drive folder IDs.
- Google Sheet ID.
- Google Cloud Vision authentication method.
- Whether Google Docs or Sheets is the primary editing interface.
- Whether OCR is synchronous or queued.
- Whether nutrition is included in MVP.
- Whether difficulty is required.
- Whether search uses PostgreSQL full-text search.
- Whether Playwright end-to-end testing is included.
- Whether public users can download recipe PDFs.
- Whether original scans may ever be displayed publicly.

---

## 36. Definition of Done

A feature is complete only when:

- It follows this CLAUDE.md.
- Tamil and English remain separate.
- Original scans are preserved.
- No unapproved recipe can be published.
- Uncertain fields are flagged.
- Validation exists on the server.
- Authorization exists for admin operations.
- No secrets are exposed.
- No private Drive URLs are publicly displayed.
- TypeScript passes.
- Linting passes.
- Tests pass where applicable.
- Build passes.
- Documentation is updated.
- The result is reported using the required format.

### Google Drive OCR Implementation

OcrWorkflow.gs must use the Google Advanced Drive Service for native OCR.

Required setup:

1. Enable the Advanced Drive Service in Apps Script.
2. Enable the Google Drive API in the linked Google Cloud project.
3. Convert the scanned image or PDF into a Google Doc using Drive OCR.
4. Use Tamil OCR language configuration where supported.
5. Read the resulting Google Doc text.
6. Preserve the original scan.
7. Store the generated OCR Google Doc ID and URL in the Sheet.
8. Store the OCR text in the review document or approved workflow record.
9. Never overwrite the original scan.
10. Log OCR errors and support retry.

The implementation must first verify the exact Drive API version and method available in the Apps Script project before writing the OCR function.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
