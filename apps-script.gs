/**
 * RSVP — Boda Maria & Michael
 * Guarda las confirmaciones de la invitación web en el Google Sheet.
 *
 * ACTUALIZAR (si ya lo tenías puesto):
 * 1. Extensiones → Apps Script → reemplaza TODO por este archivo. Guarda 💾.
 * 2. Implementar → Gestionar implementaciones → (lápiz ✏️ Editar)
 *      → Versión: "Nueva versión" → Implementar.
 *    Esto MANTIENE la misma URL /exec (no cambia).
 *
 * Para verificar: abre la URL /exec en el navegador. Debe decir algo como
 * "RSVP boda activo · filas registradas: N". Ese N sube con cada confirmación.
 */

var SHEET_ID = "13KkIoCqXYGv6eGRSVYckFKJRdF2T0wd1eOZfzkq3KTY";
var SHEET_NAME = "RSVP";
var HEADERS = ["Fecha", "Nombre", "Asistencia", "Acompañante", "Alergias", "Canción"];

function getSheet_() {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    getSheet_().appendRow([
      new Date(),
      data.nombre || "",
      data.asistencia || "",
      data.acompanante || "",
      data.alergias || "",
      data.cancion || ""
    ]);
    return ContentService
      .createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ ok: false, error: String(err) }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Verificación por navegador: muestra cuántas confirmaciones hay registradas.
function doGet() {
  var n = 0;
  try {
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    if (sheet) n = Math.max(0, sheet.getLastRow() - 1); // menos la fila de encabezados
  } catch (err) {}
  return ContentService.createTextOutput("RSVP boda activo · filas registradas: " + n);
}
