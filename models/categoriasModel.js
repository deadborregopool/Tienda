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
  },


  async obtenerSubcategoriasPorCategoria(categoriaId) {
    const result = await pool.query(
      `SELECT id, nombre FROM subcategorias WHERE categoria_id = $1`,
      [categoriaId]
    );
    return result.rows;
  },

  obtenerSubcategorias: async (categoriaId) => {
    const result = await pool.query(
      "SELECT id, nombre FROM subcategorias WHERE categoria_id = $1",
      [categoriaId]
    );
    return result.rows;
  },
  
  async obtenerProductosPorCategoria(categoriaId) {
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
    WHERE c.id = $1
    GROUP BY p.id, s.nombre, c.nombre
  `, [categoriaId]);

    return result.rows.map(p => ({
      ...p,
      precio: parseFloat(p.precio)
    }));
  },


};

module.exports = Categoria;
