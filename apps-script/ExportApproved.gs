/**
 * ExportApproved.gs
 *
 * Finds Recipe Tracker rows that meet the export eligibility gate, builds the JSON payload
 * defined in docs/import-export-format.md, POSTs it to /api/import/v1, and records the result.
 *
 * CLAUDE.md workflow steps covered here: 18-21 (export approved content, upload/POST, dry-run,
 * import as draft). The receiving endpoint is not implemented yet — every POST in this stage
 * will fail until IMPORT_ENDPOINT_URL points at a real deployment. That's expected.
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
        "Export run complete: " + succeeded + " / " + results.length + " succeeded.",
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
    var payload = buildExportPayload_(row);
    saveExportCopyToDrive_(row.recipe_id, payload);

    var response = UrlFetchApp.fetch(config.IMPORT_ENDPOINT_URL + "/api/import/v1", {
      method: "post",
      contentType: "application/json",
      headers: { "X-Import-Webhook-Secret": config.IMPORT_WEBHOOK_SECRET },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true,
    });

    var statusCode = response.getResponseCode();

    if (statusCode >= 200 && statusCode < 300) {
      var responseBody = JSON.parse(response.getContentText() || "{}");
      updateRowObject_("Recipe Tracker", row.__rowIndex, {
        website_import_status: "imported",
        website_recipe_id: responseBody.recipeId || "",
      });
      moveReviewDocumentToStage_(row.recipe_id, config.APPROVED_RECIPES_FOLDER_ID);
      return { recipeId: row.recipe_id, ok: true };
    }

    if (statusCode >= 400 && statusCode < 500) {
      logError_({
        recipeId: row.recipe_id,
        sourceFileId: row.source_file_id,
        errorType: "export_rejected",
        errorMessage: "HTTP " + statusCode + ": " + response.getContentText(),
        fieldName: "",
      });
      return { recipeId: row.recipe_id, ok: false, message: "rejected (" + statusCode + ")" };
    }

    // 5xx or unexpected status: treat as transient, leave website_import_status unchanged so
    // it's retried on the next export run.
    logError_({
      recipeId: row.recipe_id,
      sourceFileId: row.source_file_id,
      errorType: "export_transient_failure",
      errorMessage: "HTTP " + statusCode + ": " + response.getContentText(),
      fieldName: "",
    });
    notifyExportFailure_(row.recipe_id, "HTTP " + statusCode);
    return { recipeId: row.recipe_id, ok: false, message: "transient failure (" + statusCode + ")" };
  } catch (error) {
    logError_({
      recipeId: row.recipe_id,
      sourceFileId: row.source_file_id,
      errorType: "export_network_error",
      errorMessage: error.message,
      fieldName: "",
    });
    notifyExportFailure_(row.recipe_id, error.message);
    return { recipeId: row.recipe_id, ok: false, message: error.message };
  }
}

/** Builds the JSON payload matching docs/import-export-format.md exactly. */
function buildExportPayload_(row) {
  var ingredients = getIngredientsForRecipe_(row.recipe_id).map(function (ingredient) {
    return {
      displayOrder: Number(ingredient.display_order),
      name: { ta: ingredient.ingredient_ta, en: ingredient.ingredient_en },
      quantity: ingredient.quantity || null,
      unit: { ta: ingredient.unit_ta || null, en: ingredient.unit_en || null },
      notes: { ta: ingredient.notes_ta || null, en: ingredient.notes_en || null },
      isUncertain: Boolean(ingredient.is_uncertain),
      uncertaintyNotes: ingredient.uncertainty_notes || null,
    };
  });

  var instructions = getInstructionsForRecipe_(row.recipe_id).map(function (instruction) {
    return {
      stepNumber: Number(instruction.step_number),
      ta: instruction.instruction_ta,
      en: instruction.instruction_en,
      isUncertain: Boolean(instruction.is_uncertain),
      uncertaintyNotes: instruction.uncertainty_notes || null,
    };
  });

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
  var categories = docFields && docFields.categories.length > 0 ? docFields.categories : sheetCategories;

  var titleTa = (docFields && docFields.titleTa) || row.tamil_title;
  var titleEn = (docFields && docFields.titleEn) || row.english_title;

  return {
    recipeId: row.recipe_id,
    source: {
      driveFileId: row.source_file_id,
      sourcePageNumber: row.source_page_number ? Number(row.source_page_number) : null,
      googleDocId: row.google_doc_id,
    },
    recipe: {
      slug: slugify_(titleEn || row.recipe_id),
      title: { ta: titleTa, en: titleEn },
      description: {
        ta: docFields ? docFields.descriptionTa : "",
        en: docFields ? docFields.descriptionEn : "",
      },
      prepTimeMinutes: docFields ? docFields.prepTimeMinutes : null,
      cookTimeMinutes: docFields ? docFields.cookTimeMinutes : null,
      totalTimeMinutes: docFields ? docFields.totalTimeMinutes : null,
      servings: docFields ? docFields.servings : null,
      difficulty: docFields ? docFields.difficulty : null,
      // Not present anywhere in the Workspace pipeline (docs/google-doc-template.md has no SEO
      // fields) — always null here. Populated later in the Next.js admin, not sourced from here.
      seo: { titleTa: null, titleEn: null, descriptionTa: null, descriptionEn: null },
    },
    categories: categories,
    ingredients: ingredients,
    instructions: instructions,
    approval: {
      tamilApproved: row.tamil_review_status === "approved",
      translationApproved: row.translation_status === "approved",
      uncertaintyResolved: row.uncertainty_status === "resolved" || row.uncertainty_status === "none",
    },
  };
}

function saveExportCopyToDrive_(recipeId, payload) {
  var config = getConfig_();
  var folder = DriveApp.getFolderById(config.EXPORTS_FOLDER_ID);
  folder.createFile(
    recipeId + "-export.json",
    JSON.stringify(payload, null, 2),
    MimeType.PLAIN_TEXT,
  );
}

function slugify_(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
