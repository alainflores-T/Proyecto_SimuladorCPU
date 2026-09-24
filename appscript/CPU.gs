// CPU.gs - Núcleo de control de micro-operaciones

function resetCPU() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Limpiar Registros
  sheet.getRange(REG_PC).setValue("00H");
  sheet.getRange(REG_IR).setValue("00H");
  sheet.getRange(REG_MAR).setValue("00H");
  sheet.getRange(REG_MDR).setValue("00H");
  sheet.getRange(REG_AX).setValue("00H");
  sheet.getRange(REG_BX).setValue("00H");
  
  // Limpiar Flags
  sheet.getRange(FLAG_ZF).setValue(0);
  sheet.getRange(FLAG_CF).setValue(0);
  sheet.getRange(FLAG_SF).setValue(0);
  
  // Limpiar Estado y Log
  sheet.getRange(CPU_STATE).setValue("READY");
  sheet.getRange(LOG_MICRO_OPS).setValue("Sistema reiniciado. Listo.");
}

function stepCPU() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var estadoActual = sheet.getRange(CPU_STATE).getValue();
  
  switch(estadoActual) {
    case "READY":
    case "STORE":
      faseFetch1(sheet); // MAR <- PC
      break;
    case "FETCH_1":
      faseFetch2(sheet); // MDR <- RAM[MAR]
      break;
    case "FETCH_2":
      faseFetch3(sheet); // IR <- MDR & PC <- PC + 1
      break;
    case "FETCH_3":
      faseDecode(sheet); // Decodificar
      break;
    case "DECODE":
      faseExecute(sheet); // Ejecutar en ALU
      break;
    case "EXECUTE":
      faseStore(sheet); // Guardar
      break;
  }
}

// Micro-operación 1: MAR <- PC
function faseFetch1(sheet) {
  sheet.getRange(CPU_STATE).setValue("FETCH_1");
  var pcVal = sheet.getRange(REG_PC).getValue();
  sheet.getRange(REG_MAR).setValue(pcVal);
  
  animarBus("#4CAF50"); // Bus de direcciones (Verde)
  registrarLog(sheet, "FETCH 1: MAR <- PC (" + pcVal + ")");
}

// Micro-operación 2: MDR <- RAM[MAR]
function faseFetch2(sheet) {
  sheet.getRange(CPU_STATE).setValue("FETCH_2");
  var marVal = sheet.getRange(REG_MAR).getValue();
  var datoRAM = obtenerDatoRAM(sheet, marVal);
  
  sheet.getRange(REG_MDR).setValue(datoRAM);
  animarBus("#FFEB3B"); // Bus de datos (Amarillo)
  registrarLog(sheet, "FETCH 2: MDR <- RAM[" + marVal + "] (" + datoRAM + ")");
}

// Micro-operación 3: IR <- MDR y PC <- PC + 1
function faseFetch3(sheet) {
  sheet.getRange(CPU_STATE).setValue("FETCH_3");
  var mdrVal = sheet.getRange(REG_MDR).getValue();
  var pcVal  = sheet.getRange(REG_PC).getValue();
  
  sheet.getRange(REG_IR).setValue(mdrVal);
  incrementarPC(sheet, pcVal);
  
  registrarLog(sheet, "FETCH 3: IR <- MDR | PC <- PC + 1");
}

function faseDecode(sheet) {
  sheet.getRange(CPU_STATE).setValue("DECODE");
  var irVal = sheet.getRange(REG_IR).getValue();
  
  var inst = decodificarInstruccion(irVal);
  registrarLog(sheet, "DECODE: Operación=" + inst.op + ", Destino=" + inst.dest + ", Origen=" + inst.src);
}

// En CPU.gs
function faseExecute(sheet) {
  sheet.getRange(CPU_STATE).setValue("EXECUTE");
  var irVal = sheet.getRange(REG_IR).getValue();
  var inst = decodificarInstruccion(irVal);
  
  if (inst.op === "NOP") {
    registrarLog(sheet, "EXECUTE: NOP (Sin cambios)");
    return;
  }
  
  // Prevención de crash si faltan comas (fuerza cadenas vacías en lugar de null)
  var dest = inst.dest || "";
  var src  = inst.src || "";
  
  var valAX = sheet.getRange(REG_AX).getValue();
  var valBX = sheet.getRange(REG_BX).getValue();
  
  // Operaciones de la ALU
  if (inst.op === "ADD" || inst.op === "SUB" || inst.op === "MOV") {
    var valOrigen = (src === "BX") ? valBX : ((src === "AX") ? valAX : src);
    var valDestino = (dest === "BX") ? valBX : valAX;
    
    var resultado = ejecutarALU(sheet, inst.op, valDestino, valOrigen);
    
    if (dest === "AX") sheet.getRange(REG_AX).setValue(resultado);
    if (dest === "BX") sheet.getRange(REG_BX).setValue(resultado);
    animarBus("#F44336"); // Rojo para cálculo
  }
  // Leer variable desde la RAM (Ej. LD AX, A0H)
  else if (inst.op === "LD") {
    var datoRAM = obtenerDatoRAM(sheet, src);
    if (dest === "AX") sheet.getRange(REG_AX).setValue(datoRAM);
    if (dest === "BX") sheet.getRange(REG_BX).setValue(datoRAM);
    animarBus("#FFEB3B"); // Amarillo para lectura
  }
  // Guardar variable en la RAM (Ej. ST A0H, AX)
  else if (inst.op === "ST") {
    var valGuardar = (src === "BX") ? valBX : valAX;
    var celdaRAM = obtenerCeldaRAM(dest);
    if (celdaRAM) celdaRAM.setValue(valGuardar);
    animarBus("#4CAF50"); // Verde para escritura
  }
  
  registrarLog(sheet, "EXECUTE: " + inst.op + " procesado");
}

function faseStore(sheet) {
  sheet.getRange(CPU_STATE).setValue("STORE");
  animarBus("#FF9800"); // Bus de Banderas (Naranja)
  registrarLog(sheet, "STORE: Resultado guardado y Banderas actualizadas");
}