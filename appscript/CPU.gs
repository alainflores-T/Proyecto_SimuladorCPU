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
  
  // Limpiar Memoria RAM (Borra el bloque de 16x16 celdas)
  sheet.getRange(RAM_START_ROW, RAM_START_COL, 16, 16).setValue("");
  
  // Limpiar Estado y Log
  sheet.getRange(CPU_STATE).setValue("READY");
  sheet.getRange(LOG_MICRO_OPS).setValue("Sistema reiniciado. Memoria limpia y lista.");
}

function stepCPU() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var estadoActual = sheet.getRange(CPU_STATE).getValue();
  
  // Si la CPU ya terminó, ignorar los clics en Step
  if (estadoActual === "HALT") {
    registrarLog(sheet, "SISTEMA DETENIDO. Presiona Reset para iniciar otro programa.");
    return;
  }
  
  switch(estadoActual) {
    case "READY":
    case "STORE":
      faseFetch1(sheet); 
      break;
    case "FETCH_1":
      faseFetch2(sheet); 
      break;
    case "FETCH_2":
      faseFetch3(sheet); 
      break;
    case "FETCH_3":
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
  
  // Convertimos a string vacío si son null para que el log no colapse
  var op = inst.op || "NOP";
  var dest = inst.dest ? inst.dest : "Ninguno";
  var src = inst.src ? inst.src : "Ninguno";
  
  registrarLog(sheet, "DECODE: Operación=" + op + ", Dest.=" + dest + ", Orig.=" + src);
}

function faseExecute(sheet) {
  var irVal = sheet.getRange(REG_IR).getValue();
  var inst = decodificarInstruccion(irVal);
  
  // Si es HLT, frena el procesador
  if (inst.op === "HLT") {
    sheet.getRange(CPU_STATE).setValue("HALT");
    registrarLog(sheet, "EXECUTE: HLT - Programa finalizado");
    return;
  }
  
  sheet.getRange(CPU_STATE).setValue("EXECUTE");
  
  if (inst.op === "NOP") {
    registrarLog(sheet, "EXECUTE: NOP (Celda vacía, ignorada)");
    return;
  }
  
  var dest = (inst.dest || "").trim().toUpperCase();
  var src  = (inst.src || "").trim().toUpperCase();
  
  var valAX = sheet.getRange(REG_AX).getValue();
  var valBX = sheet.getRange(REG_BX).getValue();
  
  // Operaciones de ALU (ADD, SUB, MOV)
  if (inst.op === "ADD" || inst.op === "SUB" || inst.op === "MOV") {
    var valOrigen = (src === "BX") ? valBX : ((src === "AX") ? valAX : src);
    var valDestino = (dest === "BX") ? valBX : valAX;
    
    var resultado = ejecutarALU(sheet, inst.op, valDestino, valOrigen);
    
    // Asigna el resultado AL REGISTRO DESTINO ESPECÍFICO (AX o BX)
    if (dest === "AX") {
      sheet.getRange(REG_AX).setValue(resultado);
    } else if (dest === "BX") {
      sheet.getRange(REG_BX).setValue(resultado);
    }
    
    animarBus("#F44336"); 
  }
  // Leer dato de RAM a Registro (Ejemplo: LD BX, A0H)
  else if (inst.op === "LD") {
    var datoRAM = obtenerDatoRAM(sheet, src);
    if (dest === "AX") sheet.getRange(REG_AX).setValue(datoRAM);
    if (dest === "BX") sheet.getRange(REG_BX).setValue(datoRAM);
    animarBus("#FFEB3B"); 
  }
  // Guardar dato de Registro en RAM (Ejemplo: ST 20H, BX)
  else if (inst.op === "ST") {
    var valGuardar = (src === "BX") ? valBX : valAX;
    var celdaRAM = obtenerCeldaRAM(dest);
    if (celdaRAM) celdaRAM.setValue(valGuardar);
    animarBus("#4CAF50"); 
  }
  
  registrarLog(sheet, "EXECUTE: " + inst.op + " completado en " + dest);
}

function faseStore(sheet) {
  sheet.getRange(CPU_STATE).setValue("STORE");
  animarBus("#FF9800"); // Bus de Banderas (Naranja)
  registrarLog(sheet, "STORE: Resultado guardado y Banderas actualizadas");
}