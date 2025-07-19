const express = require("express");
const router = express.Router();
const productosController = require('../controllers/productosController');
const ofertasController = require("../controllers/ofertasController");

// Middlewares para subida de imágenes
const { subirImagenes, procesarImagenes } = productosController;

// Ruta para crear producto con imágenes
router.post(
  '/con-imagenes',
  subirImagenes,
  procesarImagenes,
  productosController.crearProductoConImagenes
);

// Ruta para actualizar producto con imágenes
router.put(
  '/:id',
  subirImagenes,
  procesarImagenes,
  productosController.actualizarProducto
);

// Ofertas
router.get("/ofertas", ofertasController.listarOfertas);

// Filtrados
router.get("/filtrar/precio", productosController.filtrarPorPrecio);
router.get("/filtrar/stock", productosController.filtrarPorStock);
router.get("/buscar", productosController.buscarPorNombre);  // Cambiado a /buscar

// CRUD estándar
router.post('/', productosController.crearProducto);
router.get('/', productosController.listarProductos);

// Operaciones con ID
router.get('/:id', productosController.obtenerProductoConImagenes);
router.delete('/:id', productosController.eliminarProducto);

module.exports = router;