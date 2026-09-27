
  // Config.gs - Mapeo de coordenadas según tu diseño visual
const SHEET_NAME = "Hoja 1";

// Celdas de Registros (Columna Decimal, Hex o Binario según preferencia)
const REG_PC   = "C16";  // Ajusta según la celda real de tu tabla PC
const REG_IR   = "C17";  
const REG_MAR  = "C18";  
const REG_MDR  = "C19";  
const REG_AX   = "C30";  
const REG_BX   = "C31";  

// Celdas de Flags
const FLAG_ZF  = "I39";  
const FLAG_CF  = "J39";  
const FLAG_SF  = "K39";  

// Celdas de Logs y Estados
const LOG_MICRO_OPS = "O30"; // Registro de Micro-operaciones
const LOG_CONSOLE = "F1";
const CPU_STATE     = "B2";  // Estado actual (Fetch, Decode, etc.)

// Matriz de RAM (Inicio en 00H, Fin en F0H)
const RAM_START_ROW = 8; // Fila donde empieza la celda 00H
const RAM_START_COL = 15; // Columna donde empieza la dirección +0
