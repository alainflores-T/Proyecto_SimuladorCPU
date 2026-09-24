function ejecutarALU(sheet, op, val1Hex, val2Hex) {
  var v1 = parseInt(val1Hex.toString().replace("H",""), 16) || 0;
  var v2 = parseInt(val2Hex.toString().replace("H",""), 16) || 0;
  var resultado = 0;
  
  switch(op) {
    case "ADD": resultado = v1 + v2; break;
    case "SUB": resultado = v1 - v2; break;
    case "MOV": resultado = v2; break;
  }
  
  // Banderas (8 bits)
  var zeroFlag  = (resultado % 256 === 0) ? 1 : 0;
  var carryFlag = (resultado > 255) ? 1 : 0;
  var signFlag  = ((resultado & 0x80) !== 0) ? 1 : 0;
  
  sheet.getRange(FLAG_ZF).setValue(zeroFlag);
  sheet.getRange(FLAG_CF).setValue(carryFlag);
  sheet.getRange(FLAG_SF).setValue(signFlag);
  
  return (resultado & 0xFF).toString(16).toUpperCase().padStart(2, '0') + "H";
}