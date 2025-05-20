const pool = require("../db");

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

  async listarProductos() {
  const result = await pool.query(`
    SELECT p.*, 
           COALESCE(json_agg(i.imagen_url) FILTER (WHERE i.imagen_url IS NOT NULL), '[]'::json) AS imagenes
    FROM productos p
    LEFT JOIN imagenes_producto i ON i.producto_id = p.id
    GROUP BY p.id
  `);
  return result.rows;
},

async filtrarPorPrecio(min, max) {
  const result = await pool.query(`
    SELECT p.*, 
           COALESCE(json_agg(i.imagen_url) FILTER (WHERE i.imagen_url IS NOT NULL), '[]'::json) AS imagenes
    FROM productos p
    LEFT JOIN imagenes_producto i ON i.producto_id = p.id
    WHERE p.precio BETWEEN $1 AND $2
    GROUP BY p.id
  `, [min, max]);
  return result.rows;
},

async filtrarPorStock(stock) {
  const result = await pool.query(`
    SELECT p.*, 
           COALESCE(json_agg(i.imagen_url) FILTER (WHERE i.imagen_url IS NOT NULL), '[]'::json) AS imagenes
    FROM productos p
    LEFT JOIN imagenes_producto i ON i.producto_id = p.id
    WHERE p.stock >= $1
    GROUP BY p.id
  `, [stock]);
  return result.rows;
},

async buscarPorNombre(searchTerm) {
  if (searchTerm.length < 3) return [];
  
  const result = await pool.query(`
    SELECT p.*, 
           COALESCE(json_agg(i.imagen_url) FILTER (WHERE i.imagen_url IS NOT NULL), '[]'::json) AS imagenes
    FROM productos p
    LEFT JOIN imagenes_producto i ON i.producto_id = p.id
    WHERE p.nombre ILIKE $1
    GROUP BY p.id
  `, [`%${searchTerm}%`]);
  return result.rows;
},

};

module.exports = Producto;
