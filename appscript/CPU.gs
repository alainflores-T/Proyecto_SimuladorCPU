// CPU.gs - Funciones principales del Ciclo de Instrucción

/**
 * Función vinculada al botón RESET
 */
function resetCPU() {
  // En lugar de usar SHEET_NAME, toma la hoja activa directamente:
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Limpiar Registros
  sheet.getRange("C16").setValue("00H"); // Ajusta la celda según tu tabla
  sheet.getRange("C17").setValue("00H");
  sheet.getRange("C18").setValue("00H");
  sheet.getRange("C19").setValue("00H");
  sheet.getRange("C30").setValue("00H");
  sheet.getRange("C32").setValue("00H");
  
  // Limpiar Logs/Estado
  sheet.getRange("B2").setValue("READY");
}

function stepCPU() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  var estadoActual = sheet.getRange("B2").getValue(); // Celda donde tienes el estado del CPU
  
  switch(estadoActual) {
    case "READY":
    case "STORE":
      faseFetch(sheet);
      break;
    case "FETCH":
      faseDecode(sheet);
      break;
    case "DECODE":
      faseExecute(sheet);
      break;
    case "EXECUTE":
      faseStore(sheet);
      break;
  }
}

// Fases del Ciclo de Instrucción

function faseFetch(sheet) {
  sheet.getRange(CPU_STATE).setValue("FETCH");
  registrarLog(sheet, "FETCH: Transfiriendo PC -> MAR y leyendo de RAM");
  
  // Micro-operación 1: MAR <- PC
  var pcVal = sheet.getRange(REG_PC).getValue();
  sheet.getRange(REG_MAR).setValue(pcVal);
  
  // Animación básica en el bus verde (Resaltar celdas temporales)
  animarBus("VERDE"); 
  
  // Micro-operación 2: MDR <- RAM[MAR]
  var datoRAM = obtenerDatoRAM(sheet, pcVal);
  sheet.getRange(REG_MDR).setValue(datoRAM);
  animarBus("AMARILLO");
  
  // Micro-operación 3: IR <- MDR y PC <- PC + 1
  sheet.getRange(REG_IR).setValue(datoRAM);
  incrementarPC(sheet, pcVal);
}

function faseDecode(sheet) {
  sheet.getRange(CPU_STATE).setValue("DECODE");
  var irVal = sheet.getRange(REG_IR).getValue();
  registrarLog(sheet, "DECODE: Decodificando instrucción " + irVal);
}

function faseExecute(sheet) {
  sheet.getRange(CPU_STATE).setValue("EXECUTE");
  registrarLog(sheet, "EXECUTE: Procesando operación en ALU");
  // Aquí se evalúa la instrucción del IR (ej. ADD, MOV)
}

function faseStore(sheet) {
  sheet.getRange(CPU_STATE).setValue("STORE");
  registrarLog(sheet, "STORE: Guardando resultados y actualizando Flags");
}
