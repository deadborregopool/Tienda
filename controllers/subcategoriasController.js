const Subcategoria = require("../models/subcategoriasModel");

const subcategoriasController = {
  async crear(req, res) {
    try {
      const { nombre, categoria_id } = req.body;
      const nueva = await Subcategoria.crear(nombre, categoria_id);
      res.status(201).json(nueva);
    } catch (error) {
      console.error("Error al crear subcategoría:", error);
      res.status(500).json({ error: "Error al crear subcategoría" });
    }
  },

  async listar(req, res) {
    try {
      const subcategorias = await Subcategoria.obtenerTodas();
      res.json(subcategorias);
    } catch (error) {
      console.error("Error al obtener subcategorías:", error);
      res.status(500).json({ error: "Error al obtener subcategorías" });
    }
  },

  async actualizar(req, res) {
    try {
      const { id } = req.params;
      const { nombre, categoria_id } = req.body;
      const actualizada = await Subcategoria.actualizar(id, nombre, categoria_id);
      res.json(actualizada);
    } catch (error) {
      console.error("Error al actualizar subcategoría:", error);
      res.status(500).json({ error: "Error al actualizar subcategoría" });
    }
  },

  async eliminar(req, res) {
    try {
      const { id } = req.params;
      const eliminada = await Subcategoria.eliminar(id);
      res.json(eliminada);
    } catch (error) {
      console.error("Error al eliminar subcategoría:", error);
      res.status(500).json({ error: "Error al eliminar subcategoría" });
    }
  },

  async productosPorSubcategoria(req, res) {
    try {
      const { id } = req.params;
      const productos = await Subcategoria.obtenerProductosPorSubcategoria(id);
      res.json(productos);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      res.status(500).json({ error: "Error al obtener productos por subcategoría" });
    }
  }
};

module.exports = subcategoriasController;
