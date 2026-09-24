// Decoder.gs
function decodificarInstruccion(codigoIR) {
  if (!codigoIR || codigoIR.toString().trim() === "" || codigoIR.toString().trim() === "00H") {
    return { op: "NOP", dest: null, src: null };
  }
  
  var instruccion = codigoIR.toString().trim().toUpperCase();
  var partes = instruccion.split(/\s+/); // Separa por cualquier cantidad de espacios
  var mnemonico = partes[0] || "NOP";
  
  var operandos = [];
  if (partes.length > 1) {
    operandos = partes.slice(1).join("").split(",");
  }
  
  return {
    op: mnemonico,
    dest: operandos[0] || null,
    src: operandos[1] || null
  };
}