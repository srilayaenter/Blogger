/**
 * GoogleDocsWorkflow.gs
 *
 * Creates the structured review Google Doc for a recipe, using the template defined in
 * docs/google-doc-template.md, and moves it between pipeline folders as the recipe progresses.
 *
 * CLAUDE.md workflow steps covered here: 7-8 (create review document, link it to the tracker).
 */

/** Builds the review Doc for `recipeId`, pre-filled with header fields and the raw OCR text. */
function createReviewDocumentForRecipe_(recipeId, ocrText) {
  var row = findTrackerRowByRecipeId_(recipeId);
  if (!row) {
    throw new Error("No Recipe Tracker row found for " + recipeId);
  }

  var config = getConfig_();
  var sourceFile = DriveApp.getFileById(row.source_file_id);

  var doc = DocumentApp.create(recipeId + "-review");
  var body = doc.getBody();

  body.appendParagraph("Recipe ID: " + recipeId);
  body.appendParagraph("Source Drive File ID: " + row.source_file_id);
  body.appendParagraph("Source Page Number: " + (row.source_page_number || ""));
  body.appendParagraph("Source Scan URL: " + sourceFile.getUrl());
  body.appendParagraph("");
  body.appendParagraph("[RAW OCR — VERIFY AGAINST SCAN, DO NOT PUBLISH AS-IS]");
  body.appendParagraph(ocrText || "(no OCR text extracted)");
  body.appendParagraph("");

  // The raw-OCR block above is deliberately placed before any tracked field label (outside the
  // TAMIL SOURCE AND PROOFREADING section). parseReviewDocument_() below stops capturing a
  // field's content as soon as it hits the next label, so if this block were placed between
  // "Tamil Description:" and "Tamil Ingredients:" instead, the OCR dump would get parsed as the
  // recipe description. Keep it here unless parseReviewDocument_() is updated to match.

  appendSectionHeading_(body, "TAMIL SOURCE AND PROOFREADING");
  body.appendParagraph("Tamil Title:");
  body.appendParagraph("");
  body.appendParagraph("Tamil Description:");
  body.appendParagraph("");
  body.appendParagraph("Tamil Ingredients:");
  body.appendParagraph("");
  appendNumberedPlaceholders_(body, 3);
  body.appendParagraph("Tamil Instructions:");
  body.appendParagraph("");
  appendNumberedPlaceholders_(body, 3);
  body.appendParagraph("Tamil Tips:");
  body.appendParagraph("");

  appendSectionHeading_(body, "ENGLISH TRANSLATION");
  body.appendParagraph("English Title:");
  body.appendParagraph("");
  body.appendParagraph("English Description:");
  body.appendParagraph("");
  body.appendParagraph("English Ingredients:");
  body.appendParagraph("");
  appendNumberedPlaceholders_(body, 3);
  body.appendParagraph("English Instructions:");
  body.appendParagraph("");
  appendNumberedPlaceholders_(body, 3);
  body.appendParagraph("English Tips:");
  body.appendParagraph("");

  appendSectionHeading_(body, "STRUCTURED DATA REVIEW");
  ["Preparation Time:", "Cooking Time:", "Total Time:", "Servings:", "Difficulty:", "Categories:"].forEach(
    function (label) {
      body.appendParagraph(label);
    },
  );
  body.appendParagraph("");

  appendSectionHeading_(body, "UNCERTAINTY REVIEW");
  body.appendParagraph("Uncertain fields:");
  body.appendParagraph("");
  body.appendParagraph("Uncertainty notes:");
  body.appendParagraph("");
  body.appendParagraph("Resolution:");
  body.appendParagraph("");

  appendSectionHeading_(body, "APPROVAL");
  body.appendParagraph("Tamil reviewed by:");
  body.appendParagraph("");
  body.appendParagraph("English reviewed by:");
  body.appendParagraph("");
  body.appendParagraph("Final approval:");
  body.appendParagraph("");
  body.appendParagraph("Approval date:");

  doc.saveAndClose();

  var docFile = DriveApp.getFileById(doc.getId());
  moveFileToFolder_(docFile, config.TAMIL_PROOFREAD_FOLDER_ID);

  updateRowObject_("Recipe Tracker", row.__rowIndex, {
    google_doc_id: doc.getId(),
    google_doc_url: docFile.getUrl(),
  });

  return doc.getId();
}

/** Menu action: creates a review document for the currently selected Recipe Tracker row. */
function createReviewDocumentForSelectedRow() {
  var ui = SpreadsheetApp.getUi();
  var sheet = SpreadsheetApp.getActiveSheet();

  if (sheet.getName() !== "Recipe Tracker") {
    ui.alert('Select a row on the "Recipe Tracker" sheet first.');
    return;
  }

  var rowIndex = SpreadsheetApp.getActiveRange().getRow();
  var data = readSheetAsObjects_("Recipe Tracker");
  var row = data.rows.filter(function (r) {
    return r.__rowIndex === rowIndex;
  })[0];

  if (!row) {
    ui.alert("Select a recipe row, not the header row.");
    return;
  }

  if (row.google_doc_id) {
    ui.alert(row.recipe_id + " already has a review document: " + row.google_doc_url);
    return;
  }

  createReviewDocumentForRecipe_(row.recipe_id, "");
  ui.alert("Review document created for " + row.recipe_id + ".");
}

/**
 * Moves the review Doc to the English translation folder once Tamil review is approved, and to
 * the approved-recipes folder once the recipe is exported. Called from SheetTracker.gs status
 * transitions / ExportApproved.gs, not on a schedule.
 */
function moveReviewDocumentToStage_(recipeId, targetFolderId) {
  var row = findTrackerRowByRecipeId_(recipeId);
  if (!row || !row.google_doc_id) return;

  var docFile = DriveApp.getFileById(row.google_doc_id);
  moveFileToFolder_(docFile, targetFolderId);
}

/**
 * Parses an approved review Doc back into structured fields for export. This is the only source
 * for description/time/servings/difficulty/categories — the Recipe Tracker sheet has no columns
 * for them (see docs/sheet-schema.md), so ExportApproved.gs depends on this at export time.
 *
 * Relies on each tracked field's label appearing on its own paragraph, exactly as written by
 * createReviewDocumentForRecipe_ above. If a reviewer restructures the Doc (deletes a label line,
 * retypes it with different punctuation, etc.) that field will come back empty rather than
 * throwing — export is still allowed to proceed with an incomplete recipe, since dry-run
 * validation on the Next.js side (docs/import-export-format.md) is the real safety net.
 */
function parseReviewDocument_(docId) {
  var paragraphs = DocumentApp.openById(docId)
    .getBody()
    .getParagraphs()
    .map(function (paragraph) {
      return paragraph.getText();
    });

  var trackedLabels = {
    "Tamil Title:": "titleTa",
    "Tamil Description:": "descriptionTa",
    "English Title:": "titleEn",
    "English Description:": "descriptionEn",
    "Preparation Time:": "prepTime",
    "Cooking Time:": "cookTime",
    "Total Time:": "totalTime",
    "Servings:": "servings",
    "Difficulty:": "difficulty",
    "Categories:": "categories",
  };
  var anyLabelPattern = /^[A-Za-z ]+:$/;
  var sectionDividerPattern = /^={5,}$/;

  var captured = {};
  var currentKey = null;
  var buffer = [];

  function flush() {
    if (currentKey) {
      captured[currentKey] = buffer.join("\n").trim();
    }
    buffer = [];
  }

  paragraphs.forEach(function (rawLine) {
    var line = rawLine.trim();

    if (trackedLabels[line]) {
      flush();
      currentKey = trackedLabels[line];
      return;
    }
    if (sectionDividerPattern.test(line) || anyLabelPattern.test(line)) {
      flush();
      currentKey = null;
      return;
    }
    if (currentKey) {
      buffer.push(rawLine);
    }
  });
  flush();

  return {
    titleTa: captured.titleTa || "",
    titleEn: captured.titleEn || "",
    descriptionTa: captured.descriptionTa || "",
    descriptionEn: captured.descriptionEn || "",
    prepTimeMinutes: extractMinutes_(captured.prepTime),
    cookTimeMinutes: extractMinutes_(captured.cookTime),
    totalTimeMinutes: extractMinutes_(captured.totalTime),
    servings: extractInteger_(captured.servings),
    difficulty: normalizeDifficulty_(captured.difficulty),
    categories: parseCategoryList_(captured.categories),
  };
}

function extractMinutes_(text) {
  if (!text) return null;
  var match = /(\d+)/.exec(text);
  return match ? Number(match[1]) : null;
}

function extractInteger_(text) {
  if (!text) return null;
  var match = /(\d+)/.exec(text);
  return match ? Number(match[1]) : null;
}

function normalizeDifficulty_(text) {
  if (!text) return null;
  var normalized = text.trim().toLowerCase();
  var allowed = ["easy", "medium", "hard"];
  return allowed.indexOf(normalized) !== -1 ? normalized : null;
}

function parseCategoryList_(text) {
  if (!text) return [];
  return text
    .split(",")
    .map(function (slug) {
      return slugify_(slug);
    })
    .filter(function (slug) {
      return slug.length > 0;
    });
}

function moveFileToFolder_(file, targetFolderId) {
  var targetFolder = DriveApp.getFolderById(targetFolderId);
  var parents = file.getParents();
  while (parents.hasNext()) {
    var parent = parents.next();
    parent.removeFile(file);
  }
  targetFolder.addFile(file);
}

function appendSectionHeading_(body, text) {
  body.appendParagraph("================================");
  body.appendParagraph(text);
  body.appendParagraph("================================");
}

function appendNumberedPlaceholders_(body, count) {
  for (var i = 1; i <= count; i++) {
    body.appendParagraph(i + ".");
  }
  body.appendParagraph("");
}
