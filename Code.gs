/**
 * Code.gs — Google Apps Script endpoint
 * Deploy as: Execute as Me | Who has access: Anyone
 *
 * Ganti SPREADSHEET_ID dengan ID Google Sheet kamu.
 * ID ada di URL: https://docs.google.com/spreadsheets/d/<ID>/edit
 */

var SPREADSHEET_ID = '1Qz8V11JuwdI32oOmMxbyizRulFKKCJqB2njC0FW-xIk'; // ← ganti ini
var SHEET_NAME     = 'students';

function doGet(e) {
  var headers = { 'Access-Control-Allow-Origin': '*' };

  try {
    var id = e && e.parameter && e.parameter.id ? String(e.parameter.id).trim() : '';

    if (!id) {
      return respond({ success: false, error: 'Parameter id diperlukan' });
    }

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    if (!sheet) {
      return respond({ success: false, error: 'Sheet "' + SHEET_NAME + '" tidak ditemukan' });
    }

    var data    = sheet.getDataRange().getValues();
    var colHeaders = data.shift(); // hapus & simpan baris header

    var idColIdx = colHeaders.indexOf('student_id');
    if (idColIdx === -1) {
      return respond({ success: false, error: 'Kolom student_id tidak ditemukan di header' });
    }

    // Cari baris yang cocok
    var rowObj = null;
    for (var i = 0; i < data.length; i++) {
      if (String(data[i][idColIdx]).trim() === id) {
        rowObj = {};
        for (var j = 0; j < colHeaders.length; j++) {
          rowObj[colHeaders[j]] = data[i][j];
        }
        break;
      }
    }

    if (rowObj) {
      return respond({ success: true, data: rowObj });
    } else {
      return respond({ success: false, error: 'Siswa dengan id "' + id + '" tidak ditemukan' });
    }

  } catch (err) {
    return respond({ success: false, error: err.message });
  }
}

/** Helper: buat response JSON dengan CORS header */
function respond(obj) {
  var output = ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
  return output;
}
