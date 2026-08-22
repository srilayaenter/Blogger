/**
 * Config.gs
 *
 * Central accessor for Script Properties. No folder ID, sheet ID, endpoint URL, or secret is
 * ever hardcoded — everything comes from Project Settings > Script Properties.
 *
 * See docs/google-workspace-setup.md (step 4) for the full list of properties to set and what
 * each one is for.
 */

var REQUIRED_SCRIPT_PROPERTIES_ = [
  "ORIGINAL_SCANS_FOLDER_ID",
  "OCR_OUTPUT_FOLDER_ID",
  "TAMIL_PROOFREAD_FOLDER_ID",
  "ENGLISH_TRANSLATION_FOLDER_ID",
  "APPROVED_RECIPES_FOLDER_ID",
  "RECIPE_IMAGES_FOLDER_ID",
  "EXPORTS_FOLDER_ID",
  "LOGS_FOLDER_ID",
  "RECIPE_TRACKER_SHEET_ID",
  "OCR_LANGUAGE_HINT",
  "NOTIFICATION_EMAIL",
];

// Reserved for a possible future Cloud Vision fallback (see docs/architecture.md, section 4).
// Not required for the current Drive-native OCR workflow, so it is intentionally excluded from
// REQUIRED_SCRIPT_PROPERTIES_.
var OPTIONAL_SCRIPT_PROPERTIES_ = ["GOOGLE_CLOUD_PROJECT_ID"];

/**
 * Returns all configured Script Properties as a plain object, after checking that every
 * required key is present and non-empty. Throws a clear error naming the missing keys rather
 * than failing later with a confusing null-reference error.
 */
function getConfig_() {
  var properties = PropertiesService.getScriptProperties().getProperties();
  var missing = REQUIRED_SCRIPT_PROPERTIES_.filter(function (key) {
    return !properties[key];
  });

  if (missing.length > 0) {
    throw new Error(
      "Missing required Script Properties: " +
        missing.join(", ") +
        ". Set these under Project Settings > Script Properties before running the pipeline. " +
        "See docs/google-workspace-setup.md.",
    );
  }

  var config = {};
  REQUIRED_SCRIPT_PROPERTIES_.concat(OPTIONAL_SCRIPT_PROPERTIES_).forEach(function (key) {
    config[key] = properties[key] || null;
  });
  return config;
}
