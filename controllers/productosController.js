const pool = require("../db");
const Producto = require("../models/productosModel");
const upload = require("../config/multerConfig");
const cloudinary = require("../config/cloudinary");
const productosController = {
  subirImagenes: upload.array('imagenes', 5), // 'imagenes' es el nombre del campo, 5 es el máximo
  // Obtener producto por ID con sus imágenes

  async obtenerProductoConImagenes(req, res) {
    const { id } = req.params;
    
    try {
      const result = await pool.query(
            `
      SELECT 
        p.*,
        COALESCE(json_agg(i.imagen_url) FILTER (WHERE i.imagen_url IS NOT NULL), '[]') AS imagenes,
        s.nombre AS subcategoria,
        c.nombre AS categoria,
        -- Calcular precio final si está en oferta
        CASE 
          WHEN p.en_oferta THEN ROUND(p.precio * (1 - p.porcentaje_descuento/100), 2)
          ELSE p.precio 
        END AS precio_final
      FROM 
        productos p
      LEFT JOIN 
        imagenes_producto i ON p.id = i.producto_id
      INNER JOIN 
        subcategorias s ON s.id = p.subcategoria_id
      INNER JOIN 
        categorias c ON c.id = s.categoria_id
      WHERE 
        p.id = $1
      GROUP BY 
        p.id, s.nombre, c.nombre
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
    async crearProductoConImagenes(req, res) {
    try {
      // Verificar que hay imágenes
      if (!req.body.imagenes || req.body.imagenes.length === 0) {
        return res.status(400).json({ error: "Debe subir al menos una imagen" });
      }

      const nuevoProducto = await Producto.crearProductoConImagenes(req.body);
      res.status(201).json(nuevoProducto);
    } catch (error) {
      console.error("Error al crear producto con imágenes:", error);
      res.status(500).json({ error: "Error interno del servidor" });
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
 async obtenerProducto(req, res) {
    try {
      const id = req.params.id;
      const producto = await Producto.obtenerProductoPorId(id);
      
      if (!producto) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      
      res.json(producto);
    } catch (error) {
      console.error("Error al obtener producto:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },

   async actualizarProducto(req, res) {
    try {
      const id = req.params.id;
      
      // Si hay nuevas imágenes, procesarlas
      if (req.body.nuevasImagenes && req.body.nuevasImagenes.length > 0) {
        // Combinar imágenes existentes con nuevas
        req.body.imagenes = [
          ...(req.body.imagenesExistentes || []),
          ...req.body.nuevasImagenes
        ];
      }

      const productoActualizado = await Producto.actualizarProductoConImagenes(id, req.body);
      res.json({
        message: "Producto actualizado correctamente",
        producto: productoActualizado
      });
    } catch (error) {
      console.error("Error al actualizar producto:", error);
      res.status(500).json({ 
        error: error.message || "Error interno del servidor" 
      });
    }
  },

  async eliminarProducto(req, res) {
    try {
      const id = req.params.id;
      const productoEliminado = await Producto.eliminarProductoConImagenes(id);
      
      if (!productoEliminado) {
        return res.status(404).json({ error: "Producto no encontrado" });
      }
      
      res.json({
        message: "Producto eliminado correctamente",
        producto: productoEliminado
      });
    } catch (error) {
      console.error("Error al eliminar producto:", error);
      res.status(500).json({ error: "Error interno del servidor" });
    }
  },
  async procesarImagenes(req, res, next) {
    try {
      // Si no hay archivos, continuar
      if (!req.files || req.files.length === 0) return next();
      
      const imagenes = [];
      
      // Subir cada imagen a Cloudinary
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: "productos"
        });
        imagenes.push(result.secure_url);
      }

      // Agregar URLs al body de la solicitud
      req.body.imagenes = imagenes;
      next();
    } catch (error) {
      console.error("Error al procesar imágenes:", error);
      res.status(500).json({ error: "Error al subir imágenes" });
    }
  },

  




};

module.exports = productosController;
