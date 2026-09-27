function cargarDesdeHojaProgramas() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var hojaPrincipal = ss.getSheetByName(SHEET_NAME); // "Hoja 1"
  var hojaProgramas = ss.getSheetByName("Programas"); // Tu nueva pestaña
  
  resetCPU(); // Limpia la RAM y registros primero
  
  // Lee las primeras 16 filas de la columna A en la hoja "Programas"
  var datos = hojaProgramas.getRange("A1:A16").getValues();
  
  for (var i = 0; i < datos.length; i++) {
    var instruccion = datos[i][0];
    if (instruccion && instruccion.toString().trim() !== "") {
      var direccionHex = i.toString(16).toUpperCase().padStart(2, '0') + "H";
      var celda = obtenerCeldaRAM(direccionHex);
      if (celda) celda.setValue(instruccion);
    }
  }
  registrarLog(hojaPrincipal, "Programa cargado desde la hoja 'Programas'.");
}