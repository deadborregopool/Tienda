const Categoria = require("../models/categoriasModel");

const categoriasController = {
  // Método existente
  async listarCategoriasConSubcategorias(req, res) {
    try {
      const categorias = await Categoria.obtenerCategoriasConSubcategorias();
      res.json(categorias);
    } catch (error) {
      console.error("Error al obtener categorías:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },

  // Método existente
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
  },

  // Nuevo método integrado
  async obtenerSubcategoriasYProductos(req, res) {
    try {
      const categoriaId = parseInt(req.params.categoriaId);
      
      // Verificar si la categoría existe primero
      const categoriaExists = await Categoria.obtenerCategoriaPorId(categoriaId);
      if (!categoriaExists) {
        return res.status(404).json({ mensaje: "Categoría no encontrada" });
      }

      // Obtener datos en paralelo
      const [subcategorias, productos] = await Promise.all([
        Categoria.obtenerSubcategorias(categoriaId),
        Categoria.obtenerProductosPorCategoria(categoriaId)
      ]);

      res.json({
        categoria: categoriaExists.nombre,
        subcategorias,
        productos
      });

    } catch (error) {
      console.error("Error al obtener datos de categoría:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  }
};

module.exports = categoriasController;