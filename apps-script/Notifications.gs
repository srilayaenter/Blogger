/**
 * Notifications.gs
 *
 * Sends the owner an email for events that need their attention: OCR failures, export failures,
 * and recipes newly ready for review. Uses MailApp (not GmailApp) so notifications only need the
 * script.send_mail scope, not full Gmail access.
 */

function notifyOcrFailure_(recipeId, errorMessage) {
  sendNotification_(
    "OCR failed: " + recipeId,
    "OCR processing failed for " +
      recipeId +
      ".\n\nError: " +
      errorMessage +
      "\n\nCheck the Import Errors sheet and 09_Logs for details, then use " +
      '"Recipe Pipeline > Retry failed OCR" once resolved.',
  );
}

function notifyExportFailure_(recipeId, errorMessage) {
  sendNotification_(
    "Export failed: " + recipeId,
    "Writing the export file for " +
      recipeId +
      " to 07_Exports failed.\n\nError: " +
      errorMessage +
      "\n\nCheck the Import Errors sheet for details, then re-run " +
      '"Recipe Pipeline > Export approved recipes".',
  );
}

function notifyReviewReady_(recipeId, googleDocUrl) {
  sendNotification_(
    "Ready for review: " + recipeId,
    recipeId +
      " has completed OCR and is ready for Tamil proofreading.\n\nReview document: " +
      googleDocUrl,
  );
}

function sendNotification_(subject, body) {
  var config = getConfig_();
  if (!config.NOTIFICATION_EMAIL) return;

  try {
    MailApp.sendEmail({
      to: config.NOTIFICATION_EMAIL,
      subject: "[Recipe Pipeline] " + subject,
      body: body,
    });
  } catch (error) {
    // Notification failures must never break the calling workflow (OCR/export already
    // succeeded or failed on their own terms) — log and move on.
    logError_({
      recipeId: "",
      sourceFileId: "",
      errorType: "notification_failed",
      errorMessage: error.message,
      fieldName: "",
    });
  }
}
