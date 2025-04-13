const Categoria = require("../models/categoriasModel");

const categoriasController = {
  async listarCategoriasConSubcategorias(req, res) {
    try {
      const categorias = await Categoria.obtenerCategoriasConSubcategorias();
      res.json(categorias);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },

  async obtenerCategoriaPorId(req, res) {
    try {
      const id = parseInt(req.params.id);
      const categoria = await Categoria.obtenerCategoriaPorId(id);

      if (!categoria) {
        return res.status(404).json({ mensaje: "Categoría no encontrada" });
      }

      res.json(categoria);
    } catch (error) {
      console.error("Error al obtener categoría por ID:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  }
};

module.exports = categoriasController;
