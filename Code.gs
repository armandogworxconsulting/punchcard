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

function doPost(e) {
  try {
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
      var headerRange = sheet.getRange(1, 1, 1, 7);
      headerRange.setFontWeight('bold');
      headerRange.setBackground('#1a1a1a');
      headerRange.setFontColor('#f5f0e8');
    }

    // ── Parse URL-encoded body (sent via no-cors fetch) ──────────────────────
    var params = {};
    if (e.postData && e.postData.contents) {
      e.postData.contents.split('&').forEach(function(pair) {
        var parts = pair.split('=');
        var key   = decodeURIComponent(parts[0] || '');
        var value = decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
        params[key] = value;
      });
    } else {
      // Fallback: try e.parameter (standard form POST)
      params = e.parameter || {};
    }

    // ── Extract fields ───────────────────────────────────────────────────────
    var submissionTimestamp = new Date();
    var name       = params.name       || '';
    var project    = params.project    || '';
    var dateWorked = params.dateWorked || '';
    var hours      = parseFloat(params.hours) || 0;
    var workType   = params.workType   || '';
    var notes      = params.notes      || '';

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
    sheet.getRange(lastRow, 1).setNumberFormat('MMM d, yyyy h:mm am/pm');
    sheet.getRange(lastRow, 5).setNumberFormat('0.00');

    if (lastRow % 2 === 0) {
      sheet.getRange(lastRow, 1, 1, 7).setBackground('#faf7f0');
    }
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
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * doGet() — lets you test the script URL directly in a browser tab.
 */
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      status: 'ok',
      message: 'Work Punch Card script is live. Use POST to submit data.'
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
