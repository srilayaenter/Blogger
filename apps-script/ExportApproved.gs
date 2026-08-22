/**
 * ExportApproved.gs
 *
 * Finds Recipe Tracker rows that meet the export eligibility gate and writes each one as a
 * standalone JSON file to 07_Exports, in exactly the shape content/recipes/<slug>.json expects
 * (see docs/import-export-format.md). The owner copies these files into the repo by hand and
 * commits them -- there is no HTTP push anymore. The site has no database and no API endpoint to
 * push to (see docs/architecture.md for why: Cloudflare Pages static export, content read from
 * local JSON at build time).
 *
 * CLAUDE.md workflow step 18 ("export approved content as JSON") is the terminal step of this
 * script's job; steps 19+ (copying into the repo, committing, deploying) happen outside Apps
 * Script entirely.
 */

/** Menu action / time-driven trigger entry point. */
function exportApprovedRecipes() {
  var data = readSheetAsObjects_("Recipe Tracker");
  var eligibleRows = data.rows.filter(isEligibleForExport_);

  var results = eligibleRows.map(function (row) {
    return exportSingleRecipe_(row);
  });

  var succeeded = results.filter(function (r) {
    return r.ok;
  }).length;

  if (typeof SpreadsheetApp.getUi === "function") {
    try {
      SpreadsheetApp.getUi().alert(
        "Export run complete: " +
          succeeded +
          " / " +
          results.length +
          " succeeded. Copy the new/changed files from 07_Exports into content/recipes/ and " +
          "commit.",
      );
    } catch (e) {
      // No UI context (e.g. running from a time-driven trigger) — ignore.
    }
  }

  return results;
}

function isEligibleForExport_(row) {
  return (
    row.tamil_review_status === "approved" &&
    row.translation_status === "approved" &&
    (row.uncertainty_status === "resolved" || row.uncertainty_status === "none") &&
    row.website_import_status === "ready_for_import"
  );
}

function exportSingleRecipe_(row) {
  var config = getConfig_();

  try {
    var content = buildRecipeContent_(row);
    writeRecipeContentToDrive_(content, config.EXPORTS_FOLDER_ID);

    // "imported" here means "exported to a file, ready for the owner to copy into the repo" --
    // there's no website to confirm receipt anymore. The owner sets it to "published" by hand
    // once they've actually committed the file and confirmed it's live (see sheet-schema.md).
    updateRowObject_("Recipe Tracker", row.__rowIndex, { website_import_status: "imported" });
    moveReviewDocumentToStage_(row.recipe_id, config.APPROVED_RECIPES_FOLDER_ID);

    return { recipeId: row.recipe_id, slug: content.slug, ok: true };
  } catch (error) {
    logError_({
      recipeId: row.recipe_id,
      sourceFileId: row.source_file_id,
      errorType: "export_failed",
      errorMessage: error.message,
      fieldName: "",
    });
    notifyExportFailure_(row.recipe_id, error.message);
    return { recipeId: row.recipe_id, ok: false, message: error.message };
  }
}

/** Builds the JSON object matching content/recipes/<slug>.json exactly. */
function buildRecipeContent_(row) {
  // description/time/servings/difficulty/categories only exist in the approved review Doc, not
  // the Sheet (see docs/sheet-schema.md) — parse them from the Doc rather than leaving them null.
  var docFields = row.google_doc_id
    ? parseReviewDocument_(row.google_doc_id) // defined in GoogleDocsWorkflow.gs
    : null;

  var sheetCategories = String(row.category || "")
    .split(",")
    .map(function (slug) {
      return slugify_(slug.trim());
    })
    .filter(function (slug) {
      return slug.length > 0;
    });
  // The Doc's "Categories:" field (filled during final structured-data review) takes precedence
  // over the Sheet's category column, which is only an early, optional hint.
  var categories =
    docFields && docFields.categories.length > 0 ? docFields.categories : sheetCategories;

  var titleTa = (docFields && docFields.titleTa) || row.tamil_title;
  var titleEn = (docFields && docFields.titleEn) || row.english_title;
  var slug = slugify_(titleEn || row.recipe_id);

  var ingredients = getIngredientsForRecipe_(row.recipe_id).map(function (ingredient, index) {
    return {
      id: slug + "-ingredient-" + (index + 1),
      name_ta: ingredient.ingredient_ta,
      name_en: ingredient.ingredient_en,
      quantity: ingredient.quantity || null,
      unit_ta: ingredient.unit_ta || null,
      unit_en: ingredient.unit_en || null,
      notes_ta: ingredient.notes_ta || null,
      notes_en: ingredient.notes_en || null,
      display_order: Number(ingredient.display_order),
    };
  });

  var instructions = getInstructionsForRecipe_(row.recipe_id).map(function (instruction, index) {
    return {
      id: slug + "-instruction-" + (index + 1),
      step_number: Number(instruction.step_number),
      instruction_ta: instruction.instruction_ta,
      instruction_en: instruction.instruction_en,
      image_url: null,
      display_order: Number(instruction.display_order),
    };
  });

  // Deliberately excluded, on purpose, not by oversight:
  //  - is_uncertain / uncertainty_notes: internal-only, must never reach a public file (this is
  //    stronger than the old Supabase RLS/column-revoke approach -- the field simply isn't
  //    written here at all, so there's nothing to leak).
  //  - any Google Drive file ID, Doc ID, or URL: same reasoning, plus CLAUDE.md sections 6/19/23.
  //    source_page_number (a page number in the physical book) is kept -- it's not private.
  return {
    slug: slug,
    title_ta: titleTa,
    title_en: titleEn,
    description_ta: docFields ? docFields.descriptionTa : "",
    description_en: docFields ? docFields.descriptionEn : "",
    source_page_number: row.source_page_number ? Number(row.source_page_number) : null,
    prep_time_minutes: docFields ? docFields.prepTimeMinutes : null,
    cook_time_minutes: docFields ? docFields.cookTimeMinutes : null,
    total_time_minutes: docFields ? docFields.totalTimeMinutes : null,
    servings: docFields ? docFields.servings : null,
    difficulty: docFields ? docFields.difficulty : null,
    // Always null here -- public photos are curated separately (06_Recipe_Images), not sourced
    // from the Doc/Sheet, and get added to public/images/recipes/<slug>/ by hand along with the
    // matching alt text. See docs/cloudflare-pages-deployment.md, "Image rules".
    featured_image_url: null,
    featured_image_alt_ta: null,
    featured_image_alt_en: null,
    seo_title_ta: null,
    seo_title_en: null,
    seo_description_ta: null,
    seo_description_en: null,
    published_at: new Date().toISOString(),
    categories: categories,
    ingredients: ingredients,
    instructions: instructions,
  };
}

function writeRecipeContentToDrive_(content, exportsFolderId) {
  var folder = DriveApp.getFolderById(exportsFolderId);
  var fileName = content.slug + ".json";
  var json = JSON.stringify(content, null, 2);

  var existing = folder.getFilesByName(fileName);
  if (existing.hasNext()) {
    existing.next().setContent(json);
  } else {
    folder.createFile(fileName, json, MimeType.PLAIN_TEXT);
  }
}

function slugify_(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
