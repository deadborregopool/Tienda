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
  }

};

module.exports = Producto;
