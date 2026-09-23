// Utils.gs

function registrarLog(sheet, mensaje) {
  var logPrevio = sheet.getRange(LOG_MICRO_OPS).getValue();
  sheet.getRange(LOG_MICRO_OPS).setValue(mensaje + "\n" + logPrevio);
}

function animarBus(color) {
  // Ejemplo básico para que la hoja refresque los cambios de pantalla
  SpreadsheetApp.flush();
  Utilities.sleep(150); // Pausa de 150 milisegundos para simular velocidad
}

function obtenerDatoRAM(sheet, direccionHex) {
  // Convierte la dirección HEX (ej: "10H") a las coordenadas x,y de la matriz RAM
  // Retorna el valor que está guardado en esa celda
  return "MOV AX, 05h"; // Valor de prueba
}

function incrementarPC(sheet, pcActualHex) {
  var num = parseInt(pcActualHex, 16) + 1;
  var nuevoPC = num.toString(16).toUpperCase() + "H";
  sheet.getRange(REG_PC).setValue(nuevoPC);
}
