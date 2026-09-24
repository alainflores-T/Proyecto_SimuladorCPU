// Loader.gs

function loadProgram() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Programa de prueba en ensamblador
  var programaPrueba = [
    "MOV AX, 05H",
    "MOV BX, 03H",
    "ADD AX, BX",
    "HLT"
  ];
  
  // Cargar en la RAM a partir de 00H
  for (var i = 0; i < programaPrueba.length; i++) {
    var celda = obtenerCeldaRAM(i.toString(16).toUpperCase() + "H");
    celda.setValue(programaPrueba[i]);
  }
  
  resetCPU(); // Reinicia los registros
  sheet.getRange(LOG_MICRO_OPS).setValue("Programa cargado exitosamente en RAM (00H).");
}