const pool = require("../db");
const { calcularPrecioFinal } = require("../utils/priceUtils");
const Producto = {
  async crearProducto(data) {
    const {
      nombre,
      descripcion,
      precio,
      stock,
      estado,
      orientado_a,
      subcategoria_id,
    } = data;

    const result = await pool.query(
      `INSERT INTO productos (nombre, descripcion, precio, stock, estado, orientado_a, subcategoria_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [nombre, descripcion, precio, stock, estado, orientado_a, subcategoria_id]
    );
    return result.rows[0];
  },
  async crearProductoConImagenes(data) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN'); // Iniciar transacción

      // 1. Crear el producto
      const productoData = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        precio: data.precio,
        stock: data.stock,
        estado: data.estado || 'Nuevo',
        orientado_a: data.orientado_a || null,
        subcategoria_id: data.subcategoria_id,
        en_oferta: data.en_oferta || false,
        porcentaje_descuento: data.porcentaje_descuento || 0
      };

      const productoResult = await client.query(
        `INSERT INTO productos (
          nombre, descripcion, precio, stock, estado, 
          orientado_a, subcategoria_id, en_oferta, porcentaje_descuento
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING id`,
        [
          productoData.nombre,
          productoData.descripcion,
          productoData.precio,
          productoData.stock,
          productoData.estado,
          productoData.orientado_a,
          productoData.subcategoria_id,
          productoData.en_oferta,
          productoData.porcentaje_descuento
        ]
      );
      
      const productoId = productoResult.rows[0].id;

      // 2. Crear las imágenes asociadas
      const imagenes = data.imagenes || [];
      const imagenesCreadas = [];
      
      for (const imagen_url of imagenes) {
        const imagenResult = await client.query(
          "INSERT INTO imagenes_producto (producto_id, imagen_url) VALUES ($1, $2) RETURNING *",
          [productoId, imagen_url]
        );
        imagenesCreadas.push(imagenResult.rows[0]);
      }

      await client.query('COMMIT'); // Confirmar transacción
      
      return {
        ...productoData,
        id: productoId,
        imagenes: imagenesCreadas
      };

    } catch (error) {
      await client.query('ROLLBACK'); // Revertir en caso de error
      console.error("Error en transacción:", error);
      throw error;
    } finally {
      client.release(); // Liberar conexión
    }
  },
  
  async modificarProducto(id, data) {
    const {
      nombre,
      descripcion,
      precio,
      stock,
      estado,
      orientado_a,
      subcategoria_id,
    } = data;

    const result = await pool.query(
      `UPDATE productos SET
        nombre = $1,
        descripcion = $2,
        precio = $3,
        stock = $4,
        estado = $5,
        orientado_a = $6,
        subcategoria_id = $7
       WHERE id = $8
       RETURNING *`,
      [nombre, descripcion, precio, stock, estado, orientado_a, subcategoria_id, id]
    );
    return result.rows[0];
  },

  async eliminarProducto(id) {
    await pool.query(`DELETE FROM productos WHERE id = $1`, [id]);
    return { message: "Producto eliminado" };
  },

  async listarProductos() {
    const result = await pool.query(`
      SELECT p.*, 
             json_agg(i.imagen_url) AS imagenes
      FROM productos p
      LEFT JOIN imagenes_producto i ON i.producto_id = p.id
      GROUP BY p.id
    `);
    return result.rows;
  },

  // En todos tus métodos de consulta (listarProductos, buscarPorNombre, etc.)
    async listarProductos() {
    const result = await pool.query(`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(imagen_url) 
           FROM imagenes_producto 
           WHERE producto_id = p.id),
          '[]'
        ) AS imagenes,
        s.nombre AS subcategoria,
        c.nombre AS categoria
      FROM productos p
      LEFT JOIN imagenes_producto i ON i.producto_id = p.id
      INNER JOIN subcategorias s ON s.id = p.subcategoria_id
      INNER JOIN categorias c ON c.id = s.categoria_id
      GROUP BY p.id, s.nombre, c.nombre
    `);

    return result.rows.map(p => ({
      ...p,
      precio: parseFloat(p.precio),
      precio_final: calcularPrecioFinal(p) // Usamos el helper aquí
    }));
  },

  async listarOfertas(limit = 3) {
    const parsedLimit = parseInt(limit) || 3;
    
    const result = await pool.query(`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(imagen_url) 
           FROM imagenes_producto 
           WHERE producto_id = p.id),
          '[]'
        ) AS imagenes,
        s.nombre AS subcategoria,
        c.nombre AS categoria
      FROM productos p
      INNER JOIN subcategorias s ON s.id = p.subcategoria_id
      INNER JOIN categorias c ON c.id = s.categoria_id
      WHERE p.en_oferta = true
      ORDER BY p.porcentaje_descuento DESC
      LIMIT $1
    `, [parsedLimit]);
    
    return result.rows.map(p => ({
      ...p,
      precio: parseFloat(p.precio),
      precio_final: calcularPrecioFinal(p) // Usamos el helper aquí
    }));
  },

  async filtrarPorPrecio(min, max) {
    // Convertir a números y validar
    const minNum = typeof min === 'number' ? min : parseFloat(min);
    const maxNum = typeof max === 'number' ? max : parseFloat(max);
    
    if (isNaN(minNum) || isNaN(maxNum)) {
      throw new Error('Parámetros min/max inválidos');
    }

    const result = await pool.query(`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(imagen_url) 
           FROM imagenes_producto 
           WHERE producto_id = p.id),
          '[]'
        ) AS imagenes,
        s.nombre AS subcategoria,
        c.nombre AS categoria
      FROM productos p
      INNER JOIN subcategorias s ON s.id = p.subcategoria_id
      INNER JOIN categorias c ON c.id = s.categoria_id
      WHERE p.precio BETWEEN $1 AND $2
      GROUP BY p.id, s.nombre, c.nombre
    `, [minNum, maxNum]);
    
    return result.rows.map(p => ({
      ...p,
      precio: parseFloat(p.precio),
      precio_final: calcularPrecioFinal(p)
    }));
  },
   async filtrarPorStock(stock) {
    // Convertir y validar
    const stockNum = typeof stock === 'number' ? stock : parseInt(stock);
    if (isNaN(stockNum)) {
      throw new Error('Parámetro stock inválido');
    }

    const result = await pool.query(`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(imagen_url) 
           FROM imagenes_producto 
           WHERE producto_id = p.id),
          '[]'
        ) AS imagenes,
        s.nombre AS subcategoria,
        c.nombre AS categoria
      FROM productos p
      INNER JOIN subcategorias s ON s.id = p.subcategoria_id
      INNER JOIN categorias c ON c.id = s.categoria_id
      WHERE p.stock >= $1
      GROUP BY p.id, s.nombre, c.nombre
    `, [stockNum]);
    
    return result.rows.map(p => ({
      ...p,
      precio: parseFloat(p.precio),
      precio_final: calcularPrecioFinal(p)
    }));
  },

  async buscarPorNombre(searchTerm) {
    if (searchTerm.length < 3) return [];
    
    const result = await pool.query(`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(imagen_url) 
           FROM imagenes_producto 
           WHERE producto_id = p.id),
          '[]'
        ) AS imagenes,
        s.nombre AS subcategoria,
        c.nombre AS categoria
      FROM productos p
      INNER JOIN subcategorias s ON s.id = p.subcategoria_id
      INNER JOIN categorias c ON c.id = s.categoria_id
      WHERE p.nombre ILIKE $1
      GROUP BY p.id, s.nombre, c.nombre
    `, [`%${searchTerm}%`]);
    
    return result.rows.map(p => ({
      ...p,
      precio: parseFloat(p.precio),
      precio_final: calcularPrecioFinal(p) // Usamos el helper aquí
    }));
  },
  async obtenerProductoPorId(id) {
    const result = await pool.query(`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(imagen_url) 
           FROM imagenes_producto 
           WHERE producto_id = p.id),
          '[]'
        ) AS imagenes
      FROM productos p
      WHERE p.id = $1
      GROUP BY p.id
    `, [id]);
    
    return result.rows[0];
  },

  async actualizarProductoConImagenes(id, data) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Actualizar datos básicos del producto
      const productoActualizado = await client.query(
        `UPDATE productos SET
          nombre = $1,
          descripcion = $2,
          precio = $3,
          stock = $4,
          estado = $5,
          orientado_a = $6,
          subcategoria_id = $7,
          en_oferta = $8,
          porcentaje_descuento = $9
         WHERE id = $10
         RETURNING *`,
        [
          data.nombre,
          data.descripcion,
          data.precio,
          data.stock,
          data.estado,
          data.orientado_a,
          data.subcategoria_id,
          data.en_oferta || false,
          data.porcentaje_descuento || 0,
          id
        ]
      );

      if (productoActualizado.rows.length === 0) {
        throw new Error('Producto no encontrado');
      }

      // Manejo de imágenes
      const imagenesActuales = await client.query(
        "SELECT imagen_url FROM imagenes_producto WHERE producto_id = $1",
        [id]
      );
      
      const urlsActuales = imagenesActuales.rows.map(row => row.imagen_url);
      const nuevasUrls = data.imagenes || [];
      
      // Eliminar imágenes que ya no están
      const imagenesAEliminar = urlsActuales.filter(url => !nuevasUrls.includes(url));
      for (const url of imagenesAEliminar) {
        await client.query(
          "DELETE FROM imagenes_producto WHERE producto_id = $1 AND imagen_url = $2",
          [id, url]
        );
      }
      
      // Agregar nuevas imágenes
      const imagenesAAgregar = nuevasUrls.filter(url => !urlsActuales.includes(url));
      for (const url of imagenesAAgregar) {
        await client.query(
          "INSERT INTO imagenes_producto (producto_id, imagen_url) VALUES ($1, $2)",
          [id, url]
        );
      }

      await client.query('COMMIT');
      
      // Obtener el producto actualizado con sus imágenes
      return await this.obtenerProductoPorId(id);
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error al actualizar producto:", error);
      throw error;
    } finally {
      client.release();
    }
  },

  async eliminarProductoConImagenes(id) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Eliminar imágenes primero
      await client.query(
        "DELETE FROM imagenes_producto WHERE producto_id = $1",
        [id]
      );
      
      // Luego eliminar el producto
      const result = await client.query(
        "DELETE FROM productos WHERE id = $1 RETURNING *",
        [id]
      );
      
      await client.query('COMMIT');
      return result.rows[0];
      
    } catch (error) {
      await client.query('ROLLBACK');
      console.error("Error al eliminar producto:", error);
      throw error;
    } finally {
      client.release();
    }
  }

};

module.exports = Producto;
