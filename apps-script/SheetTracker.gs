/**
 * SheetTracker.gs
 *
 * Central read/write layer for the "Recipe Content Pipeline" spreadsheet, and the custom menu
 * that ties the whole pipeline together. Other files (DriveWatcher, OcrWorkflow,
 * GoogleDocsWorkflow, ExportApproved, ErrorLogger) call into the helpers here rather than
 * touching Sheet ranges directly, so the header layout only has to be known in one place.
 *
 * Sheet/column layout: docs/sheet-schema.md
 */

var TRACKER_SHEET_NAME_ = "Recipe Tracker";
var INGREDIENTS_SHEET_NAME_ = "Ingredients";
var INSTRUCTIONS_SHEET_NAME_ = "Instructions";
var CATEGORIES_SHEET_NAME_ = "Categories";
var IMPORT_ERRORS_SHEET_NAME_ = "Import Errors";

/**
 * Adds the "Recipe Pipeline" menu. Wired as a simple trigger; if any menu action needs
 * authorization beyond what simple triggers allow, install this as an installable "On open"
 * trigger instead (see docs/google-workspace-setup.md, step 5).
 */
function onOpen(e) {
  SpreadsheetApp.getUi()
    .createMenu("Recipe Pipeline")
    .addItem("Process selected scan", "menuProcessSelectedScan")
    .addItem("Retry failed OCR", "menuRetryFailedOcr")
    .addItem("Create review document", "menuCreateReviewDocument")
    .addItem("Mark selected recipe ready for import", "menuMarkReadyForImport")
    .addItem("Export approved recipes", "menuExportApprovedRecipes")
    .addItem("Open project documentation", "menuOpenDocumentation")
    .addToUi();
}

function menuProcessSelectedScan() {
  processSelectedScan(); // defined in DriveWatcher.gs
}

function menuRetryFailedOcr() {
  retryFailedOcr(); // defined in OcrWorkflow.gs
}

function menuCreateReviewDocument() {
  createReviewDocumentForSelectedRow(); // defined in GoogleDocsWorkflow.gs
}

function menuMarkReadyForImport() {
  markSelectedRecipeReadyForImport_();
}

function menuExportApprovedRecipes() {
  exportApprovedRecipes(); // defined in ExportApproved.gs
}

function menuOpenDocumentation() {
  var ui = SpreadsheetApp.getUi();
  ui.alert(
    "Project documentation lives in the repository's docs/ folder " +
      "(architecture.md, google-workspace-setup.md, sheet-schema.md, and related files).",
  );
}

/** Opens the bound spreadsheet by ID from Script Properties, not by active-spreadsheet context. */
function getPipelineSpreadsheet_() {
  var config = getConfig_();
  return SpreadsheetApp.openById(config.RECIPE_TRACKER_SHEET_ID);
}

function getSheetByName_(sheetName) {
  var spreadsheet = getPipelineSpreadsheet_();
  var sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    throw new Error(
      'Sheet "' + sheetName + '" not found. Check it exists and matches docs/sheet-schema.md.',
    );
  }
  return sheet;
}

/** Reads a full sheet as { headers, rows } where each row is a { header: value } object. */
function readSheetAsObjects_(sheetName) {
  var sheet = getSheetByName_(sheetName);
  var values = sheet.getDataRange().getValues();
  if (values.length === 0) {
    return { headers: [], rows: [] };
  }

  var headers = values[0];
  var rows = values.slice(1).map(function (rowValues, index) {
    var rowObject = { __rowIndex: index + 2 }; // 1-based, +1 for header row
    headers.forEach(function (header, columnIndex) {
      rowObject[header] = rowValues[columnIndex];
    });
    return rowObject;
  });

  return { headers: headers, rows: rows };
}

/** Appends one row to a sheet, given an object keyed by header name. Missing keys become "". */
function appendRowObject_(sheetName, rowObject) {
  var sheet = getSheetByName_(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var rowValues = headers.map(function (header) {
    return rowObject[header] !== undefined ? rowObject[header] : "";
  });
  sheet.appendRow(rowValues);
}

/** Merges `updates` into the row at `rowIndex` (1-based, as returned by readSheetAsObjects_). */
function updateRowObject_(sheetName, rowIndex, updates) {
  var sheet = getSheetByName_(sheetName);
  var headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  var updatesWithTimestamp = Object.assign({}, updates);
  if (headers.indexOf("last_updated") !== -1) {
    updatesWithTimestamp["last_updated"] = new Date();
  }

  Object.keys(updatesWithTimestamp).forEach(function (key) {
    var columnIndex = headers.indexOf(key);
    if (columnIndex === -1) return;
    sheet.getRange(rowIndex, columnIndex + 1).setValue(updatesWithTimestamp[key]);
  });
}

function findTrackerRowByRecipeId_(recipeId) {
  var data = readSheetAsObjects_(TRACKER_SHEET_NAME_);
  return (
    data.rows.filter(function (row) {
      return row.recipe_id === recipeId;
    })[0] || null
  );
}

function findTrackerRowBySourceFileId_(sourceFileId) {
  var data = readSheetAsObjects_(TRACKER_SHEET_NAME_);
  return (
    data.rows.filter(function (row) {
      return row.source_file_id === sourceFileId;
    })[0] || null
  );
}

/** Generates the next sequential recipe ID, e.g. "recipe-0001" -> "recipe-0002". */
function generateNextRecipeId_() {
  var data = readSheetAsObjects_(TRACKER_SHEET_NAME_);
  var maxNumber = data.rows.reduce(function (max, row) {
    var match = /^recipe-(\d+)$/.exec(String(row.recipe_id || ""));
    if (!match) return max;
    return Math.max(max, parseInt(match[1], 10));
  }, 0);
  var nextNumber = maxNumber + 1;
  return "recipe-" + ("0000" + nextNumber).slice(-4);
}

function getIngredientsForRecipe_(recipeId) {
  var data = readSheetAsObjects_(INGREDIENTS_SHEET_NAME_);
  return data.rows
    .filter(function (row) {
      return row.recipe_id === recipeId;
    })
    .sort(function (a, b) {
      return Number(a.display_order) - Number(b.display_order);
    });
}

function getInstructionsForRecipe_(recipeId) {
  var data = readSheetAsObjects_(INSTRUCTIONS_SHEET_NAME_);
  return data.rows
    .filter(function (row) {
      return row.recipe_id === recipeId;
    })
    .sort(function (a, b) {
      return Number(a.step_number) - Number(b.step_number);
    });
}

/** Menu action: marks the recipe on the selected Recipe Tracker row as ready_for_import. */
function markSelectedRecipeReadyForImport_() {
  var sheet = SpreadsheetApp.getActiveSheet();
  var ui = SpreadsheetApp.getUi();

  if (sheet.getName() !== TRACKER_SHEET_NAME_) {
    ui.alert('Select a row on the "' + TRACKER_SHEET_NAME_ + '" sheet first.');
    return;
  }

  var rowIndex = SpreadsheetApp.getActiveRange().getRow();
  if (rowIndex === 1) {
    ui.alert("Select a recipe row, not the header row.");
    return;
  }

  var data = readSheetAsObjects_(TRACKER_SHEET_NAME_);
  var row = data.rows.filter(function (r) {
    return r.__rowIndex === rowIndex;
  })[0];

  if (!row) {
    ui.alert("Could not find that row.");
    return;
  }

  if (row.tamil_review_status !== "approved" || row.translation_status !== "approved") {
    ui.alert(
      "Cannot mark ready for import: Tamil and English review must both be \"approved\" first.",
    );
    return;
  }

  if (row.uncertainty_status !== "resolved" && row.uncertainty_status !== "none") {
    ui.alert('Cannot mark ready for import: uncertainty_status must be "resolved" or "none".');
    return;
  }

  updateRowObject_(TRACKER_SHEET_NAME_, rowIndex, { website_import_status: "ready_for_import" });
  ui.alert(row.recipe_id + " marked ready for import.");
}
