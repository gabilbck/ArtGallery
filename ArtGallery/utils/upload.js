const multer = require("multer");
const path = require("path");

// Função genérica para criar storage com pasta dinâmica
function criarStorage(caminhoPasta) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, caminhoPasta);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  });
}

// Filtro de arquivos aceitos
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);
  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error("Apenas imagens JPG ou PNG são permitidas!"));
  }
};

// Upload para obras
const uploadObra = multer({
  storage: criarStorage("public/uploads/obras"),
  fileFilter,
});

// Upload para fotos de perfil
const uploadPerfil = multer({
  storage: criarStorage("public/uploads/fotos-perfil"),
  fileFilter,
});

const uploadCategoria = multer({
  storage: criarStorage("public/uploads/categorias"),
  fileFilter,
});

module.exports = { uploadObra, uploadPerfil, uploadCategoria };
