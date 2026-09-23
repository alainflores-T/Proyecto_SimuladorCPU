function crearEstructuraProcesador() {
  // Config.gs - Mapeo de coordenadas según tu diseño visual
const SHEET_NAME = "Hoja 1";

// Celdas de Registros (Columna Decimal, Hex o Binario según preferencia)
const REG_PC   = "C12";  // Ajusta según la celda real de tu tabla PC
const REG_IR   = "C13";  
const REG_MAR  = "C14";  
const REG_MDR  = "C15";  
const REG_AX   = "C16";  
const REG_BX   = "C17";  

// Celdas de Flags
const FLAG_ZF  = "D22";  
const FLAG_CF  = "E22";  
const FLAG_SF  = "F22";  

// Celdas de Logs y Estados
const LOG_MICRO_OPS = "A25"; // Registro de Micro-operaciones
const CPU_STATE     = "B2";  // Estado actual (Fetch, Decode, etc.)

// Matriz de RAM (Inicio en 00H, Fin en F0H)
const RAM_START_ROW = 12; // Fila donde empieza la celda 00H
const RAM_START_COL = 10; // Columna donde empieza la dirección +0
}
