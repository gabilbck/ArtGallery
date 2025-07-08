const multer = require("multer");
const path = require("path");

// UPLOAD DE FOTO DE PERFIL
const storagePerfil = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/fotos-perfil"),
  filename: (req, file, cb) => {
    const nome = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, nome);
  },
});
const uploadPerfil = multer({ storage: storagePerfil });

// UPLOAD DE OBRA
const storageObra = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/obras"),
  filename: (req, file, cb) => {
    const nome = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, nome);
  },
});
const uploadObra = multer({ storage: storageObra });

// UPLOAD DE CATEGORIA
const storageCategoria = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/uploads/categorias"),
  filename: (req, file, cb) => {
    const nome = Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, nome);
  },
});
const uploadCategoria = multer({ storage: storageCategoria });

module.exports = { uploadPerfil, uploadObra, uploadCategoria };