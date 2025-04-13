const express = require("express");
const router = express.Router();
const pool = require("../db");
const categoriasController = require("../controllers/categoriasController");
// Obtener todas las categorías
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM categorias");
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener las categorías");
  }
});

// GET /api/categorias
router.get("/", categoriasController.listarCategoriasConSubcategorias);
//prueba:
router.get("/:id", categoriasController.obtenerCategoriaPorId);

// Obtener una categoría por ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM categorias WHERE id = $1", [id]);
    if (result.rows.length === 0) {
      return res.status(404).send("Categoría no encontrada");
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).send("Error al obtener la categoría");
  }
});

module.exports = router;
