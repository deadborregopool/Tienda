/**
 * Calcula el precio final de un producto
 * @param {Object} producto - Debe contener: precio, en_oferta, porcentaje_descuento
 * @returns {Number} Precio final con descuento aplicado si corresponde
 */
function calcularPrecioFinal(producto) {
  if (!producto) return 0;
  
  const precio = parseFloat(producto.precio);
  const descuento = producto.en_oferta ? 
    parseFloat(producto.porcentaje_descuento) : 0;

  if (isNaN(precio)) return 0;
  if (isNaN(descuento)) return precio;

  // Cálculo con redondeo a 2 decimales
  return Math.round((precio * (1 - descuento/100)) * 100) / 100;
}

module.exports = {
  calcularPrecioFinal
};