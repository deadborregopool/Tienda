const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("./cloudinary.js");

// Configurar el almacenamiento en Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "uploads", // Carpeta donde se guardarán las imágenes en Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  },
});

// Inicializar Multer con el almacenamiento configurado
const upload = multer({ storage: storage });

module.exports = upload;
