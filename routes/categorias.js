const express = require("express");
const router = express.Router();
const categoriasController = require("../controllers/categoriasController");

router.get("/", categoriasController.listarCategoriasConSubcategorias);
router.get("/:id", categoriasController.obtenerCategoriaPorId);
router.get("/:categoriaId/subcategorias-productos", categoriasController.obtenerSubcategoriasYProductos); // Nueva ruta

module.exports = router;
