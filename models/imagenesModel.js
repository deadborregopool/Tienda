const pool = require("../db");

const ImagenProducto = {
  async crearImagen(producto_id, imagen_url) {
    const result = await pool.query(
      "INSERT INTO imagenes_producto (producto_id, imagen_url) VALUES ($1, $2) RETURNING *",
      [producto_id, imagen_url]
    );
    return result.rows[0];
  },
};

module.exports = ImagenProducto;
