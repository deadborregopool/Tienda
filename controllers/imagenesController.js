const express = require("express");
const router = express.Router();
const upload = require("../config/multerConfig");
const cloudinary = require("../config/cloudinary");
const ImagenProducto = require("../models/imagenesModel"); // Asegúrate de importar el modelo

// Endpoint para subir una imagen
router.post("/upload", upload.single("imagen"), async (req, res) => {
  try {
    const { producto_id } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: "No se envió ninguna imagen" });
    }

    // Subir la imagen a Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Guardar en la base de datos
    const nuevaImagen = await ImagenProducto.crearImagen(producto_id, result.secure_url);

    res.json({
      message: "Imagen subida y guardada exitosamente",
      imagen: nuevaImagen,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al subir la imagen" });
  }
});

module.exports = router;
