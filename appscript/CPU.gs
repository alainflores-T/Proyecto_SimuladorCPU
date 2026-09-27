// CPU.gs - Núcleo de control de micro-operaciones
// --- FUNCIÓN RUN (Ejecución automática) ---
function runCPU() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var estadoActual = sheet.getRange(CPU_STATE).getValue();
  
  if (estadoActual === "HALT") {
    registrarLog(sheet, "SISTEMA DETENIDO. Presiona Reset antes de volver a ejecutar.");
    return;
  }
  
  registrarLog(sheet, "▶️ EJECUCIÓN AUTOMÁTICA (RUN) INICIADA");
  
  // Ejecuta pasos en bucle hasta que encuentre un HALT
  while (estadoActual !== "HALT") {
    limpiarFondoRegistros(sheet); // Limpia colores del paso anterior
    stepCPU();
    SpreadsheetApp.flush(); // Fuerza a Google Sheets a mostrar los cambios en pantalla
    Utilities.sleep(600);   // Pausa de 600ms para que puedas ver qué está pasando
    estadoActual = sheet.getRange(CPU_STATE).getValue();
  }
  
  registrarLog(sheet, "⏹️ EJECUCIÓN AUTOMÁTICA FINALIZADA");
}

// Función auxiliar para quitar los colores de resaltado de los registros
function limpiarFondoRegistros(sheet) {
  var celdas = [REG_PC, REG_IR, REG_MAR, REG_MDR, REG_AX, REG_BX];
  for (var i = 0; i < celdas.length; i++) {
    sheet.getRange(celdas[i]).setBackground(null);
  }
}
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
  
  // 1. Saltos (Control de Flujo)
  if (inst.op === "JMP") {
    sheet.getRange(REG_PC).setValue(dest);
    registrarLog(sheet, "EXECUTE: Salto incondicional a " + dest);
    return;
  }
  else if (inst.op === "JZ") {
    var zf = sheet.getRange(FLAG_ZF).getValue();
    if (zf == 1) {
      sheet.getRange(REG_PC).setValue(dest);
      registrarLog(sheet, "EXECUTE: Salto (JZ) tomado a " + dest);
    } else {
      registrarLog(sheet, "EXECUTE: Salto (JZ) ignorado (ZF=0)");
    }
    return; 
  }
  else if (inst.op === "JNZ") {
    var zf = sheet.getRange(FLAG_ZF).getValue();
    if (zf == 0) { // Toma el salto únicamente si la bandera Zero está apagada
      sheet.getRange(REG_PC).setValue(dest);
      registrarLog(sheet, "EXECUTE: Salto (JNZ) tomado a " + dest);
    } else {
      registrarLog(sheet, "EXECUTE: Salto (JNZ) ignorado (ZF=1)");
    }
    return;
  }
  
  // 2. Operaciones de ALU (ADD, SUB, MOV, INC, DEC, CMP)
  else if (["ADD", "SUB", "MOV", "INC", "DEC", "CMP"].indexOf(inst.op) !== -1) {
    var valOrigen = (src === "BX") ? valBX : ((src === "AX") ? valAX : src);
    var valDestino = (dest === "BX") ? valBX : valAX;
    
    var resultado = ejecutarALU(sheet, inst.op, valDestino, valOrigen);
    
    // El resultado de CMP impacta banderas en la ALU, pero no debe guardarse en el registro
    if (inst.op !== "CMP") {
      if (dest === "AX") sheet.getRange(REG_AX).setValue(resultado);
      else if (dest === "BX") sheet.getRange(REG_BX).setValue(resultado);
    }
    animarBus("#F44336"); 
  }
  
  // 3. Leer dato de RAM a Registro
  else if (inst.op === "LD" || inst.op === "LOAD") {
    var datoRAM = obtenerDatoRAM(sheet, src);
    if (dest === "AX") sheet.getRange(REG_AX).setValue(datoRAM);
    if (dest === "BX") sheet.getRange(REG_BX).setValue(datoRAM);
    animarBus("#FFEB3B"); 
  }
  
  // 4. Guardar dato de Registro en RAM
  else if (inst.op === "ST" || inst.op === "STORE") {
    var valGuardar = (src === "BX") ? valBX : valAX;
    var celdaRAM = obtenerCeldaRAM(dest);
    if (celdaRAM) celdaRAM.setValue(valGuardar);
    animarBus("#4CAF50"); 
  }
  
  registrarLog(sheet, "EXECUTE: " + inst.op + " completado");
}

function faseStore(sheet) {
  sheet.getRange(CPU_STATE).setValue("STORE");
  animarBus("#FF9800"); // Bus de Banderas (Naranja)
  registrarLog(sheet, "STORE: Resultado guardado y Banderas actualizadas");
}