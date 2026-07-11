/**
 * RSVP — Boda Maria & Michael
 * Recibe las confirmaciones de la invitación web y las guarda en Google Sheets.
 *
 * INSTALACIÓN (5 minutos):
 * 1. Crea un Google Sheet nuevo llamado "RSVP Boda" con una hoja llamada "RSVP".
 * 2. En la fila 1 pon los encabezados:
 *    Fecha | Nombre | Asistencia | Acompañante | Alergias | Canción
 * 3. Extensiones → Apps Script → pega este archivo completo.
 * 4. Reemplaza SHEET_ID con el ID del Sheet (lo que va entre /d/ y /edit en la URL).
 * 5. Implementar → Nueva implementación → Aplicación web:
 *      - Ejecutar como: Yo
 *      - Acceso: Cualquier persona
 * 6. Copia la URL de la aplicación web y pégala en app.js → APPS_SCRIPT_URL.
 */

var SHEET_ID = "PEGA_AQUI_EL_ID_DEL_SHEET";
var SHEET_NAME = "RSVP";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);

    sheet.appendRow([
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
