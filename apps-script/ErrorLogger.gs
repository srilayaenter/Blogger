/**
 * ErrorLogger.gs
 *
 * Central error logging: writes to the "Import Errors" sheet (for the owner to triage from
 * within the spreadsheet) and appends to a daily log file in 09_Logs (a durable record that
 * survives even if someone clears the sheet). Never throws — a logging failure must not mask
 * or replace the original error it was trying to record.
 */

/**
 * @param {{recipeId: string, sourceFileId: string, errorType: string, errorMessage: string,
 *   fieldName: string}} error
 */
function logError_(error) {
  try {
    appendRowObject_("Import Errors", {
      timestamp: new Date(),
      recipe_id: error.recipeId || "",
      source_file_id: error.sourceFileId || "",
      error_type: error.errorType || "unknown",
      error_message: error.errorMessage || "",
      field_name: error.fieldName || "",
      resolved: false,
      resolution_notes: "",
    });
  } catch (sheetWriteError) {
    // Fall through to the Drive log below even if the sheet write itself failed.
  }

  try {
    appendToDriveLog_(error);
  } catch (driveWriteError) {
    // Nothing further we can do — both log destinations are unavailable. Deliberately swallowed
    // so the caller's original error/flow is unaffected.
  }
}

function appendToDriveLog_(error) {
  var config = getConfig_();
  var folder = DriveApp.getFolderById(config.LOGS_FOLDER_ID);
  var today = Utilities.formatDate(new Date(), "UTC", "yyyy-MM-dd");
  var logFileName = "error-log-" + today + ".txt";

  var line =
    new Date().toISOString() +
    " | " +
    (error.errorType || "unknown") +
    " | recipe=" +
    (error.recipeId || "-") +
    " | file=" +
    (error.sourceFileId || "-") +
    " | field=" +
    (error.fieldName || "-") +
    " | " +
    (error.errorMessage || "") +
    "\n";

  var existingFiles = folder.getFilesByName(logFileName);
  if (existingFiles.hasNext()) {
    var file = existingFiles.next();
    var existingContent = file.getBlob().getDataAsString();
    file.setContent(existingContent + line);
  } else {
    folder.createFile(logFileName, line, MimeType.PLAIN_TEXT);
  }
}
