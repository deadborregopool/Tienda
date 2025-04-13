const express = require("express");
const cors = require("cors");
const pool = require("./db");
const dotenv = require('dotenv');
const db = require('./db');
dotenv.config();
const categoriasRoutes = require("./routes/categorias");
const productosRoutes = require("./routes/productos");
const app = express();
app.use(cors());
app.use(express.json()); // Para manejar JSON

app.use("/api/productos", productosRoutes);
// Ruta para categorías
app.use("/api/categorias", categoriasRoutes);
// Rutas
app.use('/imagenes', require('./controllers/imagenesController'));
// tus otras rutas
app.use("/subcategorias", require("./routes/subcategorias"));
// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});
//ruta productos
const productosRouter = require("./routes/productos");
app.use("/productos", productosRouter);
//ruta categorias
const categoriasRouter = require("./routes/categorias");
const subcategoriasRouter = require("./routes/subcategorias");
//ruta subcategorias
app.use("/categorias", categoriasRouter);
app.use("/subcategorias", subcategoriasRouter);
