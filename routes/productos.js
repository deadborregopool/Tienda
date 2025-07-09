const express = require("express");
const router = express.Router();
const productosController = require('../controllers/productosController');
const ofertasController = require("../controllers/ofertasController");
// Nueva ruta para ofertas
router.get("/ofertas", ofertasController.listarOfertas);
router.get("/filtrar/precio", productosController.filtrarPorPrecio);
router.get("/filtrar/stock", productosController.filtrarPorStock);
router.get("/filtrar/nombre", productosController.buscarPorNombre);
router.get('/:id', productosController.obtenerProductoConImagenes);
// Crear nuevo producto
router.post('/', productosController.crearProducto);
// Modificar producto existente
router.put('/:id', productosController.modificarProducto);
// Eliminar producto
router.delete('/:id', productosController.eliminarProducto);
// Listar todos los productos
router.get('/', productosController.listarProductos);

module.exports = router;