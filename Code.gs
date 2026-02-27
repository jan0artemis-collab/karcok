/**
 * Code.gs — Google Apps Script endpoint
 * Deploy as: Execute as Me | Who has access: Anyone
 *
 * Sheet "students"  → dipakai untuk GET (cari siswa by id)
 * Sheet "penilaian" → dipakai untuk POST (simpan nilai kompetensi)
 */

var SPREADSHEET_ID   = '1Qz8V11JuwdI32oOmMxbyizRulFKKCJqB2njC0FW-xIk';
var SHEET_STUDENTS   = 'students';
var SHEET_PENILAIAN  = 'penilaian';

// ── GET: cari siswa by id ─────────────────────────────────────────────────
function doGet(e) {
  try {
    var id = e && e.parameter && e.parameter.id
             ? String(e.parameter.id).trim() : '';

    if (!id) {
      return respond({ success: false, error: 'Parameter id diperlukan' });
    }

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_STUDENTS);

    if (!sheet) {
      return respond({ success: false, error: 'Sheet "' + SHEET_STUDENTS + '" tidak ditemukan' });
    }

    var data       = sheet.getDataRange().getValues();
    var colHeaders = data.shift();
    var idColIdx   = colHeaders.indexOf('student_id');

    if (idColIdx === -1) {
      return respond({ success: false, error: 'Kolom student_id tidak ditemukan di header' });
    }

    for (var i = 0; i < data.length; i++) {
      if (String(data[i][idColIdx]).trim() === id) {
        var rowObj = {};
        for (var j = 0; j < colHeaders.length; j++) {
          rowObj[colHeaders[j]] = data[i][j];
        }
        return respond({ success: true, data: rowObj });
      }
    }

    return respond({ success: false, error: 'Siswa dengan id "' + id + '" tidak ditemukan' });

  } catch (err) {
    return respond({ success: false, error: err.message });
  }
}

// ── POST: simpan nilai penilaian ──────────────────────────────────────────
function doPost(e) {
  try {
    // Baca parameter (dikirim sebagai application/x-www-form-urlencoded)
    var p = e.parameter;

    // Validasi action (opsional tapi berguna untuk ekspansi)
    if (p.action && p.action !== 'saveScore') {
      return respond({ success: false, error: 'Action tidak dikenal: ' + p.action });
    }

    // Validasi field wajib
    var requiredFields = ['student_id', 'instruktur'];
    for (var r = 0; r < requiredFields.length; r++) {
      if (!p[requiredFields[r]] || String(p[requiredFields[r]]).trim() === '') {
        return respond({ success: false, error: 'Field wajib kosong: ' + requiredFields[r] });
      }
    }

    var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_PENILAIAN);

    // Buat sheet penilaian otomatis jika belum ada
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_PENILAIAN);
      sheet.appendRow([
        'timestamp',
        'student_id',
        'instruktur',
        'kompetensi_kedisiplinan',
        'kompetensi_kepemimpinan',
        'kompetensi_kerajinan',
        'kompetensi_publikasi',
        'catatan'
      ]);
      // Format header
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }

    // Tentukan timestamp
    var ts = p.timestamp ? p.timestamp : new Date().toISOString();

    // Append baris baru
    sheet.appendRow([
      ts,
      String(p.student_id).trim(),
      String(p.instruktur).trim(),
      parseFloat(p.kompetensi_kedisiplinan) || 0,
      parseFloat(p.kompetensi_kepemimpinan) || 0,
      parseFloat(p.kompetensi_kerajinan)    || 0,
      parseFloat(p.kompetensi_publikasi)    || 0,
      String(p.catatan || '').trim()
    ]);

    return respond({ success: true, message: 'Penilaian berhasil disimpan' });

  } catch (err) {
    return respond({ success: false, error: err.message });
  }
}

// ── Helper: response JSON ─────────────────────────────────────────────────
function respond(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
