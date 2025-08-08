const express = require("express");
const router = express.Router();
const subcategoriasController = require("../controllers/subcategoriasController");

router.post("/", subcategoriasController.crear);
router.get("/", subcategoriasController.listar);
router.put("/:id", subcategoriasController.actualizar);
router.delete("/:id", subcategoriasController.eliminar);
router.get("/:id/recomendados", subcategoriasController.obtenerRecomendados);
router.get("/:id/productos", subcategoriasController.obtenerProductos);
router.get("/:id/solo-productos", subcategoriasController.obtenerSoloProductosPorSubcategoria)
module.exports = router;
