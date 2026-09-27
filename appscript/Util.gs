// Utils.gs - Funciones auxiliares y lectura de RAM

function registrarLog(sheet, mensaje) {
  var celdaLog = sheet.getRange(LOG_MICRO_OPS);
  var celdaconsole = sheet.getRange(LOG_CONSOLE);
  var logPrevio = celdaLog.getValue();
  celdaLog.setValue("• " + mensaje + "\n" + logPrevio);
  celdaconsole.setValue("• " + mensaje + "\n");
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
function cambiarFormatoRegistros(formatoDestino) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  // Excluimos deliberadamente el registro IR para no romper el decodificador
  var registrosNumericos = [REG_PC, REG_MAR, REG_MDR, REG_AX, REG_BX]; 
  
  for (var i = 0; i < registrosNumericos.length; i++) {
    var celda = sheet.getRange(registrosNumericos[i]);
    var val = String(celda.getValue()).trim();
    
    // Ignora celdas vacías o instrucciones de texto (ej. "LD AX, 20H")
    if (val === "" || val.indexOf(" ") !== -1) continue; 
    
    var numDec = NaN;
    if (val.endsWith("H")) numDec = parseInt(val.replace("H", ""), 16);
    else if (val.endsWith("B")) numDec = parseInt(val.replace("B", ""), 2);
    else if (!isNaN(val)) numDec = parseInt(val, 10);
    
    if (!isNaN(numDec)) {
      var num8Bits = numDec & 0xFF; // Limita a 8 bits
      if (formatoDestino === "HEX") {
        celda.setValue(num8Bits.toString(16).toUpperCase().padStart(2, '0') + "H");
      } else if (formatoDestino === "BIN") {
        celda.setValue(num8Bits.toString(2).padStart(8, '0') + "B");
      } else if (formatoDestino === "DEC") {
        celda.setValue(num8Bits.toString(10));
      }
    }
  }
}

// Actualiza las funciones de los botones para que cambien RAM y Registros a la vez
function RAM_y_Reg_To_HEX() { cambiarFormatoRAM("HEX"); cambiarFormatoRegistros("HEX"); }
function RAM_y_Reg_To_BIN() { cambiarFormatoRAM("BIN"); cambiarFormatoRegistros("BIN"); }
function RAM_y_Reg_To_DEC() { cambiarFormatoRAM("DEC"); cambiarFormatoRegistros("DEC"); }
// --- CONVERSOR DE FORMATOS DE MEMORIA RAM ---
function cambiarFormatoRAM(formatoDestino) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var rangoRAM = sheet.getRange(RAM_START_ROW, RAM_START_COL, 16, 16);
  var data = rangoRAM.getValues();
  
  for (var i = 0; i < 16; i++) {
    for (var j = 0; j < 16; j++) {
      var val = String(data[i][j]).trim();
      
      // Ignorar celdas vacías o instrucciones que contengan espacios (Ej: "ADD AX, BX")
      if (val === "" || val.indexOf(" ") !== -1) continue; 
      
      var numDec = NaN;
      
      // Detectar en qué formato está el número actualmente
      if (val.endsWith("H")) {
        numDec = parseInt(val.replace("H", ""), 16);
      } else if (val.endsWith("B")) {
        numDec = parseInt(val.replace("B", ""), 2);
      } else if (!isNaN(val)) {
        numDec = parseInt(val, 10);
      }
      
      // Si es un número válido, convertirlo al destino seleccionado (máximo 8 bits / 255)
      if (!isNaN(numDec)) {
        var num8Bits = numDec & 0xFF; // Mantiene el límite a 1 Byte
        
        if (formatoDestino === "HEX") {
          data[i][j] = num8Bits.toString(16).toUpperCase().padStart(2, '0') + "H";
        } else if (formatoDestino === "BIN") {
          data[i][j] = num8Bits.toString(2).padStart(8, '0') + "B";
        } else if (formatoDestino === "DEC") {
          data[i][j] = num8Bits.toString(10);
        }
      }
    }
  }
  
  // Escribir los datos modificados de vuelta en bloque (más rápido)
  rangoRAM.setValues(data);
  registrarLog(sheet, "🔄 Formato RAM cambiado a " + formatoDestino);
}

// Estas son las funciones individuales que le asignarás a tus 3 botones nuevos
function RAM_To_HEX() { cambiarFormatoRAM("HEX"); }
function RAM_To_BIN() { cambiarFormatoRAM("BIN"); }
function RAM_To_DEC() { cambiarFormatoRAM("DEC"); }