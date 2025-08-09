const pool = require("../db");
const { calcularPrecioFinal } = require("../utils/priceUtils");
const Subcategoria = {
  async crear(nombre, categoria_id) {
    const result = await pool.query(
      "INSERT INTO subcategorias (nombre, categoria_id) VALUES ($1, $2) RETURNING *",
      [nombre, categoria_id]
    );
    return result.rows[0];
  },

  async obtenerTodas() {
    const result = await pool.query(
      `SELECT s.*, c.nombre AS categoria 
       FROM subcategorias s 
       JOIN categorias c ON s.categoria_id = c.id`
    );
    return result.rows;
  },

  async actualizar(id, nombre, categoria_id) {
    const result = await pool.query(
      `UPDATE subcategorias 
       SET nombre = $1, categoria_id = $2 
       WHERE id = $3 RETURNING *`,
      [nombre, categoria_id, id]
    );
    return result.rows[0];
  },

  async eliminar(id) {
    const result = await pool.query(
      "DELETE FROM subcategorias WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
  async obtenerPorId(id) {
    const result = await pool.query(
      "SELECT * FROM subcategorias WHERE id = $1",
      [id]
    );
    return result.rows[0] || null;
  },
   async obtenerProductosPorSubcategoria(subcategoriaId) {
    const result = await pool.query(`
      SELECT 
        p.*,
        COALESCE(json_agg(i.imagen_url) FILTER (WHERE i.imagen_url IS NOT NULL), '[]') AS imagenes,
        s.nombre AS subcategoria,
        c.nombre AS categoria
      FROM productos p
      LEFT JOIN imagenes_producto i ON i.producto_id = p.id
      INNER JOIN subcategorias s ON s.id = p.subcategoria_id
      INNER JOIN categorias c ON c.id = s.categoria_id
      WHERE p.subcategoria_id = $1
      GROUP BY p.id, s.nombre, c.nombre
    `, [subcategoriaId]);

    return result.rows.map(p => ({
      ...p,
      precio: parseFloat(p.precio),
      precio_final: calcularPrecioFinal(p) // Agregamos el precio calculado aquí
    }));
  },

  async obtenerRecomendados(subcategoriaId, excludeProductId = null) {
    let query = `
      SELECT 
        p.*,
        COALESCE(json_agg(i.imagen_url) FILTER (WHERE i.imagen_url IS NOT NULL), '[]') AS imagenes
      FROM productos p
      LEFT JOIN imagenes_producto i ON p.id = i.producto_id
      WHERE p.subcategoria_id = $1
      ${excludeProductId ? 'AND p.id != $3' : ''}
      GROUP BY p.id
      ORDER BY RANDOM() 
      LIMIT $2
    `;

    const values = [subcategoriaId, 3];
    if (excludeProductId) values.push(excludeProductId);

    const result = await pool.query(query, values);
    
    return result.rows.map(p => ({
      ...p,
      precio: parseFloat(p.precio),
      precio_final: calcularPrecioFinal(p) // Agregamos el precio calculado aquí
    }));
  },
  // Agrega este método en subcategoriasModel.js
async obtenerSoloProductosPorSubcategoria(subcategoriaId) {
  const result = await pool.query(`
    SELECT 
      p.*,
      s.nombre AS subcategoria,
      c.nombre AS categoria,
      COALESCE(
        (SELECT json_agg(imagen_url) 
         FROM imagenes_producto 
         WHERE producto_id = p.id),
        '[]'
      ) AS imagenes
    FROM productos p
    INNER JOIN subcategorias s ON s.id = p.subcategoria_id
    INNER JOIN categorias c ON c.id = s.categoria_id
    WHERE p.subcategoria_id = $1
    GROUP BY p.id, s.nombre, c.nombre
  `, [subcategoriaId]);

  return result.rows.map(p => ({
    ...p,
    precio: parseFloat(p.precio),
    precio_final: calcularPrecioFinal(p)
  }));
},
  
};

module.exports = Subcategoria;
