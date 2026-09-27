function ejecutarALU(sheet, op, val1Hex, val2Hex) {
  var v1 = parseInt(val1Hex.toString().replace("H",""), 16) || 0;
  var v2 = parseInt(val2Hex.toString().replace("H",""), 16) || 0;
  var resultado = 0;
  
  switch(op) {
    case "ADD": resultado = v1 + v2; break;
    case "SUB": resultado = v1 - v2; break;
    case "MOV": resultado = v2; break;
    case "INC": resultado = v1 + 1; break; // Suma 1 al registro
    case "DEC": resultado = v1 - 1; break; // Resta 1 al registro
    case "CMP": resultado = v1 - v2; break; // Resta lógica para alterar flags
  }
  
  // Banderas (8 bits)
  var zeroFlag  = ((resultado & 0xFF) === 0) ? 1 : 0; 
  var carryFlag = (resultado > 255 || resultado < 0) ? 1 : 0;
  var signFlag  = ((resultado & 0x80) !== 0) ? 1 : 0;
  
  // Función auxiliar para actualizar y avisar
  function actualizarBandera(rango, valor, nombre) {
    var celda = sheet.getRange(rango);
    var valorAnterior = celda.getValue();
    celda.setValue(valor);
    
    if (valor === 1 && valorAnterior !== 1) {
      registrarLog(sheet, "BANDERAS: ¡" + nombre + " activada!");
      celda.setBackground("#FFCDD2"); 
    } else if (valor === 0) {
      celda.setBackground(null); 
    }
  }

  actualizarBandera(FLAG_ZF, zeroFlag, "Zero Flag (ZF)");
  actualizarBandera(FLAG_CF, carryFlag, "Carry Flag (CF)");
  actualizarBandera(FLAG_SF, signFlag, "Sign Flag (SF)");
  
  return (resultado & 0xFF).toString(16).toUpperCase().padStart(2, '0') + "H";
}