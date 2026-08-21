/**
 * OcrWorkflow.gs
 *
 * Performs Tamil OCR using Google Drive's native OCR conversion (Advanced Drive Service, v2),
 * per CLAUDE.md's "Google Drive OCR Implementation" addendum — this project does NOT use Google
 * Cloud Vision, despite earlier sections of CLAUDE.md describing it. See docs/architecture.md
 * section 4 for why.
 *
 * Requires the "Drive" advanced service (v2) enabled in appsscript.json and, on first run,
 * authorization against the linked Google Cloud project's Drive API.
 *
 * IMPORTANT: Drive API v3 does not support the ocr/ocrLanguage conversion parameters used here.
 * This must stay on v2. Verify actual OCR quality against real Tamil scans before relying on
 * this for the full collection (docs/google-workspace-setup.md, step 3).
 */

/** CLAUDE.md workflow steps covered here: 5-6 (send scan to OCR, save raw output). */
function runOcrForRecipe_(recipeId) {
  var row = findTrackerRowByRecipeId_(recipeId);
  if (!row) {
    throw new Error("No Recipe Tracker row found for " + recipeId);
  }

  updateRowObject_("Recipe Tracker", row.__rowIndex, { ocr_status: "processing" });

  try {
    var config = getConfig_();
    var sourceBlob = DriveApp.getFileById(row.source_file_id).getBlob();

    var ocrFileResource = Drive.Files.insert(
      {
        title: recipeId + "-ocr-output",
        parents: [{ id: config.OCR_OUTPUT_FOLDER_ID }],
      },
      sourceBlob,
      {
        convert: true,
        ocr: true,
        ocrLanguage: config.OCR_LANGUAGE_HINT,
      },
    );

    var ocrDocId = ocrFileResource.id;
    var ocrText = DocumentApp.openById(ocrDocId).getBody().getText();

    updateRowObject_("Recipe Tracker", row.__rowIndex, { ocr_status: "extracted" });

    createReviewDocumentForRecipe_(recipeId, ocrText); // defined in GoogleDocsWorkflow.gs

    return { ocrDocId: ocrDocId, ocrText: ocrText };
  } catch (error) {
    updateRowObject_("Recipe Tracker", row.__rowIndex, { ocr_status: "failed" });
    logError_({
      recipeId: recipeId,
      sourceFileId: row.source_file_id,
      errorType: "ocr_failed",
      errorMessage: error.message,
      fieldName: "",
    });
    notifyOcrFailure_(recipeId, error.message); // defined in Notifications.gs
    throw error;
  }
}

/** Menu action: re-runs OCR for every row currently marked ocr_status = "failed". */
function retryFailedOcr() {
  var data = readSheetAsObjects_("Recipe Tracker");
  var failedRows = data.rows.filter(function (row) {
    return row.ocr_status === "failed";
  });

  var results = failedRows.map(function (row) {
    try {
      runOcrForRecipe_(row.recipe_id);
      return { recipeId: row.recipe_id, ok: true };
    } catch (error) {
      return { recipeId: row.recipe_id, ok: false, message: error.message };
    }
  });

  var ui = SpreadsheetApp.getUi();
  ui.alert(
    "Retried " +
      results.length +
      " failed OCR row(s). " +
      results.filter(function (r) {
        return r.ok;
      }).length +
      " succeeded.",
  );

  return results;
}
