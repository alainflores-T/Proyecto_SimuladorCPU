# Proyecto_SimuladorCPU

# Simulador de CPU en Google Sheets 🖥️📊

Este proyecto es un simulador didáctico e interactivo de una CPU construido íntegramente sobre Google Sheets utilizando Google Apps Script. Diseñado para la enseñanza de arquitectura de computadoras, el simulador ejecuta programas en ensamblador básico, visualizando en tiempo real el flujo de datos entre la Memoria RAM, los Registros y la Unidad Aritmético Lógica (ALU).

## 🚀 Características Principales

*   **Ciclo de Instrucción Visual:** Ejecución paso a paso o automática a través de las fases de FETCH (1, 2 y 3), DECODE, EXECUTE y STORE[cite: 7].
*   **Unidad Aritmético Lógica (ALU) Completa:** Soporta operaciones matemáticas y lógicas, actualizando dinámicamente las banderas de estado (Zero `ZF`, Carry `CF`, Sign `SF`)[cite: 4].
*   **Conversión de Formatos en Vivo:** Permite cambiar instantáneamente la visualización de la RAM y los registros entre Hexadecimal (HEX), Binario (BIN) y Decimal (DEC) manteniendo el límite de 8 bits[cite: 3].
*   **Registro de Historial (Log):** Genera automáticamente una tabla detallada en una pestaña dedicada ("Historial" o "LOG") que documenta cada ciclo de reloj, capturando el estado de los registros, la ALU, las banderas y las acciones realizadas[cite: 3].
*   **Decodificador Flexible:** Soporta sintaxis de ensamblador tolerante a espacios y comas (ej. `ADD AX, BX` o `ADD AX BX`)[cite: 1].
*   **Carga de Programas:** Incluye un módulo para importar programas secuenciales directamente desde una hoja de texto hacia las direcciones de la matriz RAM[cite: 2].

## 🏗️ Arquitectura y Archivos del Proyecto

El código está modularizado en varios scripts (`.gs`) para separar la lógica de control, la interfaz y el procesamiento:

*   **`CPU.gs`**: Es el núcleo del sistema. Controla la máquina de estados de la CPU (`runCPU`, `stepCPU`) y gestiona la lógica específica de cada fase (Fetch, Decode, Execute, Store) y la ejecución de saltos y accesos a memoria[cite: 7].
*   **`Alu.gs`**: Gestiona las operaciones matemáticas/lógicas y la actualización de las banderas `ZF`, `CF` y `SF` en la interfaz. Recibe los operandos, calcula los resultados e inyecta los símbolos de operación (ej. `'+'`, `'-'`) de manera segura para Google Sheets[cite: 4].
*   **`decoder.gs`**: Analiza el texto de las celdas de la RAM, separando el mnemónico (op) de sus operandos (origen y destino) para que la CPU pueda procesarlos[cite: 1].
*   **`Util.gs`**: Contiene herramientas de soporte, como la generación y formateo automático de la pestaña de Historial, la lectura/escritura en la matriz de RAM y las funciones de conversión de bases numéricas (HEX/BIN/DEC)[cite: 3].
*   **`Codigo.gs`**: Archivo de configuración que mapea las coordenadas de las celdas de la hoja de cálculo (ej. `REG_PC = "C16"`) con las variables del sistema, permitiendo cambiar el diseño visual sin romper la lógica[cite: 6].
*   **`loader.gs`**: Automatiza la carga masiva de instrucciones desde una pestaña de "Programas" hacia la memoria RAM a partir de la dirección `00H`[cite: 2].
*   **`animaciones.gs`**: Proporciona funciones de retroalimentación visual (cambios de color temporales en celdas) para simular el tránsito de datos a través de los buses del sistema[cite: 5].

## 📜 Conjunto de Instrucciones Soportado

El simulador reconoce los siguientes mnemónicos[cite: 4, 7]:

| Tipo | Instrucciones | Descripción |
| :--- | :--- | :--- |
| **Transferencia de Datos** | `MOV`, `LD` (LOAD), `ST` (STORE) | Mueve datos entre registros (AX, BX) o entre registros y la memoria RAM. |
| **Aritméticas** | `ADD`, `SUB`, `INC`, `DEC`, `CMP` | Operaciones ejecutadas por la ALU. Modifican las banderas de estado correspondientes. |
| **Control de Flujo** | `JMP`, `JZ`, `JNZ`, `JC`, `JS` | Saltos incondicionales (`JMP`) y condicionales basados en las banderas de Zero (`JZ`, `JNZ`), Carry (`JC`) y Signo (`JS`). |
| **Control del Sistema** | `HLT`, `NOP` | `HLT` detiene la ejecución; `NOP` avanza el ciclo sin realizar cambios. |

## ⚙️ Instalación y Uso

1.  Abre tu documento de Google Sheets.
2.  Ve a **Extensiones > Apps Script**.
3.  Crea los archivos `.gs` listados en la sección de arquitectura y pega el código correspondiente en cada uno.
4.  Asegúrate de que el diseño de tu hoja principal coincida con las coordenadas definidas en `Codigo.gs`[cite: 6].
5.  Asigna las funciones principales (como `runCPU`, `stepCPU`, `resetCPU`, `cargarDesdeHojaProgramas`) a botones dibujados en tu hoja de Google Sheets.

### Ejecutar un programa de ejemplo

1.  Carga un programa en la memoria RAM (manualmente o mediante el *loader*).
2.  Presiona el botón asignado a **Reset** para limpiar registros, estado y el LOG[cite: 7].
3.  Usa el botón **Step** para avanzar ciclo por ciclo y ver el flujo de datos[cite: 7], o **Run** para ejecutar el código automáticamente hasta encontrar un `HLT`[cite: 7].
