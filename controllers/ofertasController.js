const Producto = require("../models/productosModel");

const ofertasController = {
  async listarOfertas(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 3;
      const ofertas = await Producto.listarOfertas(limit);
      
      if (ofertas.length === 0) {
        return res.json({
          mensaje: "Actualmente no hay ofertas disponibles",
          ofertas: []
        });
      }
      
      res.json(ofertas);
    } catch (error) {
      console.error("Error al obtener ofertas:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  }
};

module.exports = ofertasController;