// Loader.gs

function loadProgram() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  resetCPU(); // Reinicia los registros
  
  // Programa de prueba en ensamblador
  var programaPrueba = [
    "LD AX, 20H",   // 00H: Carga el valor que esté en la celda 20H hacia AX
    "MOV BX, 02H",  // 01H: Pone un 2 en BX
    "ADD AX, BX",   // 02H: Suma ambos (AX = AX + 2)
    "ST 21H, AX",   // 03H: Guarda el resultado en la celda 21H
    "HLT"           // 04H: Fin
  ];
  
  // Cargar en la RAM a partir de 00H
  for (var i = 0; i < programaPrueba.length; i++) {
    var celda = obtenerCeldaRAM(i.toString(16).toUpperCase() + "H");
    celda.setValue(programaPrueba[i]);
  }
  
  
  sheet.getRange(LOG_MICRO_OPS).setValue("Programa cargado exitosamente en RAM (00H).");
}