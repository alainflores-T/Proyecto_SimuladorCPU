# Proyecto_SimuladorCPU

# Simulador de CPU en Google Sheets 🖥️📊

Este proyecto es un simulador didáctico e interactivo de una CPU de 8 bits construido íntegramente sobre Google Sheets utilizando Google Apps Script. Diseñado para la enseñanza de arquitectura de computadoras, el simulador ejecuta programas en ensamblador básico, visualizando en tiempo real el flujo de datos entre la Memoria RAM, los Registros y la Unidad Aritmético Lógica (ALU).

---

## 🚀 Características Principales

* **Ciclo de Instrucción Visual:** Ejecución paso a paso (`Step`) o automática (`Run`/`Pause`) a través de las fases de **FETCH (1, 2 y 3)**, **DECODE**, **EXECUTE** y **STORE**.
* **Unidad Aritmético Lógica (ALU) Completa:** Soporta operaciones matemáticas y lógicas, actualizando dinámicamente las banderas de estado: Zero (`ZF`), Carry (`CF`) y Sign (`SF`).
* **Conversión de Formatos en Vivo:** Permite cambiar instantáneamente la visualización de la RAM y los registros entre Hexadecimal (**HEX**), Binario (**BIN**) y Decimal (**DEC**) manteniendo el límite de 8 bits (0 - 255 / 00H - FFH).
* **Registro de Historial (Log):** Genera automáticamente una tabla estructurada de 16 columnas en la pestaña `"LOG"` que documenta cada ciclo de reloj, capturando el estado de los registros, la ALU, las banderas y la explicación detallada de cada paso.
* **Decodificador Flexible:** Soporta sintaxis de ensamblador tolerante a comas y múltiples espacios (ej. `ADD AX, BX` o `ADD AX BX`).
* **Carga Automática de Programas:** Módulo para importar programas en ensamblador directamente desde una pestaña dedicada (`"Programas"`) hacia la matriz RAM a partir de la dirección `00H`.

---

## 🏗️ Arquitectura y Archivos del Proyecto

El código está modularizado en varios scripts (`.gs`) para separar la lógica de control, la interfaz y el procesamiento:

* **`CPU.gs`**: Núcleo del sistema. Controla la máquina de estados de la CPU (`runCPU`, `pausarCPU`, `stepCPU`, `resetCPU`) y gestiona la lógica específica de cada fase del ciclo de instrucción.
* **`Alu.gs`**: Gestiona las operaciones matemáticas/lógicas y la actualización visual/lógica de las banderas `ZF`, `CF` y `SF`. Inserta de forma segura los símbolos de operación en Google Sheets.
* **`Decoder.gs`**: Analiza las instrucciones almacenadas en las celdas de la RAM, separando el mnemónico (`op`) de sus operandos origen (`src`) y destino (`dest`).
* **`Util.gs`**: Herramientas de soporte para la generación y formateo automático de la pestaña de Historial, lectura/escritura en la matriz RAM (16x16) y conversión de bases numéricas (HEX/BIN/DEC).
* **`Config.gs`**: Archivo de configuración centralizada que mapea las coordenadas de las celdas de la hoja de cálculo con las variables del sistema.
* **`loader.gs`**: Automatiza la carga masiva de instrucciones desde el rango `A2:A18` de la pestaña `"Programas"` hacia la memoria RAM.
* **`Animation.gs`**: Proporciona funciones de retroalimentación visual (resaltado temporal de celdas) para simular el tránsito de datos por los buses del sistema.

---

## 📜 Conjunto de Instrucciones Soportado

| Tipo | Mnemónicos | Descripción |
| :--- | :--- | :--- |
| **Transferencia de Datos** | `MOV`, `LD` / `LOAD`, `ST` / `STORE` | Mueve datos entre registros (`AX`, `BX`), o entre registros y direcciones de memoria RAM. |
| **Aritméticas y Lógicas** | `ADD`, `SUB`, `INC`, `DEC`, `CMP` | Operaciones ejecutadas por la ALU. Modifican las banderas de estado (`ZF`, `CF`, `SF`). `CMP` realiza la resta sin guardar el resultado. |
| **Control de Flujo** | `JMP`, `JZ`, `JNZ`, `JC`, `JS` | Saltos incondicionales (`JMP`) y condicionales según las banderas: Zero (`JZ`/`JNZ`), Carry (`JC`) y Signo (`JS`). |
| **Control del Sistema** | `HLT`, `NOP` | `HLT` detiene la ejecución; `NOP` avanza el ciclo sin realizar modificaciones. |

---

## ⚙️ Estructura de la Hoja de Cálculo

Para un correcto funcionamiento, tu libro de Google Sheets debe contener **3 pestañas**:

1. **`Hoja 1`**: Pantalla principal del simulador (debe coincidir con las coordenadas de `Config.gs`).
2. **`Programas`**: Contiene el código ensamblador en el rango `A2:A18`.
3. **`LOG`**: Se crea/formatea automáticamente para registrar el historial de ejecución.

### Coordenadas por Defecto (`Config.gs`)
* **Registros:** `PC` (`C16`), `IR` (`C17`), `MAR` (`C18`), `MDR` (`C19`), `AX` (`C20`), `BX` (`C21`).
* **Banderas:** `ZF` (`G39`), `CF` (`H39`), `SF` (`I39`).
* **Estado CPU:** `CPU_STATE` (`B2`).
* **ALU:** Operando 1 (`B31`), Operando 2 (`F31`), Símbolo (`H34`), Resultado (`D45`).
* **Matriz RAM (16x16):** Fila inicio `8`, Columna inicio `15` (Columna O).

---

## 🎮 Asignación de Botones en Google Sheets

Puedes dibujar botones/imágenes en la `Hoja 1` y asignarles las siguientes funciones de Apps Script:

| Botón | Función a Asignar | Descripción |
| :--- | :--- | :--- |
| ▶️ **Run** | `runCPU` | Ejecuta el programa de forma continua hasta encontrar `HLT`. |
| ⏸️ **Pause** | `pausarCPU` | Pausa la ejecución automática. |
| ⏭️ **Step** | `stepCPU` | Avanza un solo sub-ciclo de instrucción. |
| 🔄 **Reset** | `resetCPU` | Limpia registros, banderas, ALU, RAM e historial. |
| 📥 **Cargar Programa** | `cargarDesdeHojaProgramas` | Importa el código desde la pestaña `"Programas"`. |
| 🔢 **Ver HEX** | `RAM_y_Reg_To_HEX` | Convierte RAM y Registros a formato Hexadecimal. |
| 🔢 **Ver BIN** | `RAM_y_Reg_To_BIN` | Convierte RAM y Registros a formato Binario. |
| 🔢 **Ver DEC** | `RAM_y_Reg_To_DEC` | Convierte RAM y Registros a formato Decimal. |

---

## 🚀 Guía de Instalación y Uso Rápido

1. Abre un nuevo documento en **Google Sheets**.
2. Crea las pestañas **`Hoja 1`** y **`Programas`**.
3. Dirígete a **Extensiones > Apps Script**.
4. Crea los 7 archivos `.gs` (`CPU.gs`, `Alu.gs`, `Decoder.gs`, `Util.gs`, `Config.gs`, `loader.gs`, `Animation.gs`) y pega el código correspondiente.
5. Escribe tus instrucciones en la pestaña `Programas` (a partir de la celda `A2`).
6. Crea los botones en la `Hoja 1` y asígnales sus funciones correspondientes.
7. Presiona **Reset**, luego **Cargar Programa** y finalmente **Step** o **Run**.
