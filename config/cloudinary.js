require("dotenv").config();
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloudinary_url: process.env.CLOUDINARY_URL, // Usa CLOUDINARY_URL como en el .env
});

module.exports = cloudinary;
