const express = require("express");
const router = express.Router();
const productosController = require('../controllers/productosController');

// Obtener producto específico con imágenes
router.get('/:id', productosController.obtenerProductoConImagenes);

// Crear nuevo producto
router.post('/', productosController.crearProducto);

// Modificar producto existente
router.put('/:id', productosController.modificarProducto);

// Eliminar producto
router.delete('/:id', productosController.eliminarProducto);

// Listar todos los productos
router.get('/', productosController.listarProductos);

// Filtrar productos por rango de precio
router.get('/filtrar/precio', productosController.filtrarPorPrecio);

// Filtrar productos por stock disponible
router.get('/filtrar/stock', productosController.filtrarPorStock);
router.get('/filtrar/nombre', productosController.buscarPorNombre);
module.exports = router;