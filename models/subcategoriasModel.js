const pool = require("../db");

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

  async obtenerProductosPorSubcategoria(subcategoria_id) {
    const result = await pool.query(
      `SELECT * FROM productos WHERE subcategoria_id = $1`,
      [subcategoria_id]
    );
    return result.rows;
  },
};

module.exports = Subcategoria;
