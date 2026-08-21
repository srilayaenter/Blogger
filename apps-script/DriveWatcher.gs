/**
 * DriveWatcher.gs
 *
 * Detects new scans in 01_Original_Scans and creates a Recipe Tracker row for each one that
 * doesn't already have one. Does not run OCR itself — see OcrWorkflow.gs for that step.
 *
 * CLAUDE.md workflow steps covered here: 1-4 (upload -> detect -> create tracker row -> assign
 * recipe_id).
 */

/**
 * Time-driven trigger entry point (see docs/google-workspace-setup.md, step 5). Scans
 * 01_Original_Scans for files not yet present in the Recipe Tracker (matched by Drive file ID)
 * and creates a tracker row + review kickoff for each.
 */
function checkForNewScans() {
  var config = getConfig_();
  var folder = DriveApp.getFolderById(config.ORIGINAL_SCANS_FOLDER_ID);
  var files = folder.getFiles();
  var newFileCount = 0;

  while (files.hasNext()) {
    var file = files.next();
    if (findTrackerRowBySourceFileId_(file.getId())) {
      continue; // already tracked
    }

    try {
      registerNewScan_(file);
      newFileCount++;
    } catch (error) {
      logError_({
        recipeId: "",
        sourceFileId: file.getId(),
        errorType: "scan_registration_failed",
        errorMessage: error.message,
        fieldName: "",
      });
    }
  }

  return newFileCount;
}

/** Menu action: process the single file the owner has selected in Google Drive context. */
function processSelectedScan() {
  var ui = SpreadsheetApp.getUi();
  ui.alert(
    "Manual single-file processing must be run from the Google Drive file's context, which " +
      "Apps Script cannot detect automatically from a Sheets menu click. Use " +
      '"Retry failed OCR" for already-tracked rows, or wait for the next scheduled ' +
      '"checkForNewScans" run to pick up new uploads in 01_Original_Scans. ' +
      "See docs/google-workspace-setup.md for manual testing steps.",
  );
}

/** Creates a Recipe Tracker row for a newly discovered scan file and kicks off OCR. */
function registerNewScan_(file) {
  var recipeId = generateNextRecipeId_();

  appendRowObject_("Recipe Tracker", {
    recipe_id: recipeId,
    source_file_id: file.getId(),
    source_file_name: file.getName(),
    source_page_number: "",
    tamil_title: "",
    english_title: "",
    category: "",
    google_doc_id: "",
    google_doc_url: "",
    ocr_status: "pending",
    tamil_review_status: "pending",
    translation_status: "pending",
    uncertainty_status: "none",
    website_import_status: "not_ready",
    website_recipe_id: "",
    last_updated: new Date(),
    notes: "",
  });

  runOcrForRecipe_(recipeId); // defined in OcrWorkflow.gs
}
