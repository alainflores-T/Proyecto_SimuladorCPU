// Utils.gs - Funciones auxiliares y lectura de RAM

function registrarLog(sheet, mensaje) {
  var celdaLog = sheet.getRange(LOG_MICRO_OPS);
  var logPrevio = celdaLog.getValue();
  celdaLog.setValue("• " + mensaje + "\n" + logPrevio);
}

function animarBus(colorHex) {
  SpreadsheetApp.flush();
  Utilities.sleep(150);
}

/**
 * Obtiene el dato de la celda de RAM correspondiente a una dirección HEX
 */
function obtenerDatoRAM(sheet, direccionHex) {
  var dirLimpia = direccionHex.toString().replace("H", "").trim();
  var dirNum = parseInt(dirLimpia, 16);
  
  if (isNaN(dirNum)) return "NOP";
  
  // Cálculo de posición en la matriz 16x16
  var offsetFila = Math.floor(dirNum / 16);
  var offsetCol  = dirNum % 16;
  
  var filaReal = RAM_START_ROW + offsetFila;
  var colReal  = RAM_START_COL + offsetCol;
  
  return sheet.getRange(filaReal, colReal).getValue();
}

/**
 * Retorna el rango de celda correspondiente a la dirección HEX
 */
function obtenerCeldaRAM(direccionHex) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var dirLimpia = direccionHex.toString().replace("H", "").trim();
  var dirNum = parseInt(dirLimpia, 16) || 0;
  
  var offsetFila = Math.floor(dirNum / 16);
  var offsetCol  = dirNum % 16;
  
  return sheet.getRange(RAM_START_ROW + offsetFila, RAM_START_COL + offsetCol);
}

function incrementarPC(sheet, pcActualHex) {
  var dirLimpia = pcActualHex.toString().replace("H", "").trim();
  var num = parseInt(dirLimpia, 16) + 1;
  var nuevoPC = num.toString(16).toUpperCase().padStart(2, '0') + "H";
  sheet.getRange(REG_PC).setValue(nuevoPC);
}