// ============================================================
//  WORK PUNCH CARD — Google Apps Script Backend
//  File: Code.gs
//  Spreadsheet: https://docs.google.com/spreadsheets/d/1JsYzUWNJp28vciMqL_2IT-GQQpiDlj5W8D4y3yYhdIE
// ============================================================
//
//  SETUP INSTRUCTIONS:
//  1. Open your Google Sheet.
//  2. Go to Extensions > Apps Script.
//  3. Replace any existing code with this entire file.
//  4. Click Save (floppy disk icon).
//  5. Click "Deploy" > "New deployment".
//  6. Set type to "Web app".
//  7. Set "Execute as" → Me.
//  8. Set "Who has access" → Anyone.
//  9. Click Deploy, authorize permissions when prompted.
// 10. Copy the Web App URL that appears.
// 11. Paste that URL into the HTML file where it says:
//       const SCRIPT_URL = 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE';
// ============================================================

/**
 * Handles HTTP POST requests from the HTML form.
 * Appends a new row to the active sheet with the submitted data.
 *
 * @param {Object} e - The event object from the POST request.
 * @returns {ContentService.TextOutput} JSON response indicating success or failure.
 */
function doPost(e) {
  try {
    // Get the active spreadsheet and first sheet
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();

    // ── Ensure header row exists ─────────────────────────────────────────────
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Submission Timestamp',
        'Name',
        'Project',
        'Date Worked',
        'Hours',
        'Work Type',
        'Notes'
      ]);

      // Style the header row
      var headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#1a1a1a');
      headerRange.setFontColor('#f5f0e8');
    }

    // ── Extract parameters from the POST body ────────────────────────────────
    var params = e.parameter;

    var submissionTimestamp = new Date();                    // Column A: server timestamp
    var name      = params.name      || '';                  // Column B
    var project   = params.project   || '';                  // Column C
    var dateWorked = params.dateWorked || '';                 // Column D
    var hours     = parseFloat(params.hours) || 0;           // Column E
    var workType  = params.workType  || '';                  // Column F
    var notes     = params.notes     || '';                  // Column G

    // ── Append the new data row ──────────────────────────────────────────────
    sheet.appendRow([
      submissionTimestamp,
      name,
      project,
      dateWorked,
      hours,
      workType,
      notes
    ]);

    // ── Auto-format the new row ──────────────────────────────────────────────
    var lastRow = sheet.getLastRow();

    // Format the timestamp column (A) as a readable datetime
    sheet.getRange(lastRow, 1).setNumberFormat('MMM d, yyyy h:mm am/pm');

    // Format the hours column (E) as a number with 2 decimal places
    sheet.getRange(lastRow, 5).setNumberFormat('0.00');

    // Alternate row shading for readability
    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, 7).setBackground('#faf7f0');
    }

    // Auto-resize columns to fit content (runs occasionally to avoid slowdowns)
    if (lastRow % 10 === 0) {
      sheet.autoResizeColumns(1, 7);
    }

    // ── Return success response ──────────────────────────────────────────────
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Row added successfully.',
        row: lastRow
      }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    // ── Return error response ────────────────────────────────────────────────
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * doGet() — Optional: handles GET requests so the script URL
 * can be tested directly in a browser tab.
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Work Punch Card script is live. Use POST to submit data.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
