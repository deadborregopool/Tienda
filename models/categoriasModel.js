const pool = require("../db");

const Categoria = {
  async obtenerCategoriasConSubcategorias() {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.nombre,
        json_agg(
          json_build_object('id', s.id, 'nombre', s.nombre)
        ) AS subcategorias
      FROM categorias c
      LEFT JOIN subcategorias s ON s.categoria_id = c.id
      GROUP BY c.id
    `);
    return result.rows;
  },
  async obtenerCategoriaPorId(id) {
    const result = await pool.query(`
      SELECT 
        c.id, 
        c.nombre, 
        json_agg(
          json_build_object('id', s.id, 'nombre', s.nombre)
        ) AS subcategorias
      FROM categorias c
      LEFT JOIN subcategorias s ON s.categoria_id = c.id
      WHERE c.id = $1
      GROUP BY c.id
    `, [id]);
    return result.rows[0]; // Solo una categoría
  }
  
};

module.exports = Categoria;
