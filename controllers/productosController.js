const pool = require("../db");
const Producto = require("../models/productosModel");

const productosController = {
  // Obtener producto por ID con sus imágenes
  async obtenerProductoConImagenes(req, res) {
    const { id } = req.params;

    try {
      const result = await pool.query(
        `
        SELECT 
          p.*,
          COALESCE(json_agg(i.imagen_url) FILTER (WHERE i.imagen_url IS NOT NULL), '[]') AS imagenes
        FROM 
          productos p
        LEFT JOIN 
          imagenes_producto i ON p.id = i.producto_id
        WHERE 
          p.id = $1
        GROUP BY 
          p.id
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ mensaje: "Producto no encontrado" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error al obtener producto con imágenes:", error);
      res.status(500).json({ mensaje: "Error interno del servidor" });
    }
  },

  // Crear nuevo producto
  async crearProducto(req, res) {
    try {
      const nuevoProducto = await Producto.crearProducto(req.body);
      res.status(201).json(nuevoProducto);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al crear el producto" });
    }
  },

  // Modificar producto existente
  async modificarProducto(req, res) {
    try {
      const { id } = req.params;
      const productoActualizado = await Producto.modificarProducto(id, req.body);
      res.json(productoActualizado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al modificar el producto" });
    }
  },

  // Eliminar producto
  async eliminarProducto(req, res) {
    try {
      const { id } = req.params;
      const resultado = await Producto.eliminarProducto(id);
      res.json(resultado);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al eliminar el producto" });
    }
  },

  // Listar todos los productos
  async listarProductos(req, res) {
    try {
      const productos = await Producto.listarProductos();
      res.json(productos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al listar productos" });
    }
  },

  // Filtrar productos por precio
  async filtrarPorPrecio(req, res) {
    try {
      const { min, max } = req.query;
      const productos = await Producto.filtrarPorPrecio(min, max);
      res.json(productos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al filtrar productos por precio" });
    }
  },

  // Filtrar productos por stock
  async filtrarPorStock(req, res) {
    try {
      const { stock } = req.query;
      const productos = await Producto.filtrarPorStock(stock);
      res.json(productos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al filtrar productos por stock" });
    }
  },
  async buscarPorNombre(req, res) {
    try {
      const { term } = req.query;
      const productos = await Producto.buscarPorNombre(term);
      res.json(productos);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Error al buscar productos por nombre" });
    }
  },







  
};

module.exports = productosController;
