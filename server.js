const express = require("express");
const cors = require("cors");
const pool = require("./db");
const dotenv = require('dotenv');
const db = require('./db');
dotenv.config();
const categoriasRoutes = require("./routes/categorias");
const productosRoutes = require("./routes/productos");
const app = express();
const jwt = require('jsonwebtoken');
app.use(cors());
app.use(express.json()); // Para manejar JSON

app.use("/api/productos", productosRoutes);
// Ruta para categorías
app.use("/api/categorias", categoriasRoutes);
// Rutas
app.use('/imagenes', require('./controllers/imagenesController'));
// tus otras rutas
app.use("/api/subcategorias", require("./routes/subcategorias"));
// Ruta de prueba
app.get("/", (req, res) => {
  res.send("API funcionando 🚀");
});
const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

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
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    
    // Consultar directamente a la base de datos
    const result = await pool.query(
        'SELECT * FROM admins WHERE username = $1',
        [username]
    );
    
    const admin = result.rows[0];
    
    if (!admin) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Comparar contraseñas (asumiendo que tienes bcrypt instalado)
    const bcrypt = require('bcrypt');
    const isValid = await bcrypt.compare(password, admin.password_hash);
    
    if (!isValid) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
    }
    
    // Crear token
    const token = jwt.sign(
        { id: admin.id, username: admin.username },
        process.env.JWT_SECRET
    );
    
    res.json({ token });
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Cargado' : 'FALLO');
});

// Agregar rutas protegidas
