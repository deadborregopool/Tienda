const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const productosController = require('../controllers/productosController');

// Todas las rutas protegidas por autenticación
router.use(authMiddleware);

// Rutas CRUD protegidas
router.post('/productos', productosController.crearProductoConImagenes);
router.put('/productos/:id', productosController.actualizarProducto);
router.delete('/productos/:id', productosController.eliminarProducto);

// Ruta de prueba
router.get('/test', (req, res) => {
    res.json({ message: 'Acceso concedido', admin: req.admin });
});

module.exports = router;