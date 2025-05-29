const createError = require("http-errors");
const express = require("express");
const multer = require('multer'); 
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");

const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const cadastroRouter = require("./routes/cadastro");
const uploadRouter = require('./routes/upload');
const explorarRouter = require("./routes/explorar");
const categoriasRouter = require("./routes/categorias");
const perfilRouter = require("./routes/perfil");
const obrasRouter = require("./routes/obras");
const suporteRouter = require("./routes/suporte");

const app = express();

app.set('view engine', 'ejs');

// Middleware padrão para parse JSON
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware para cookies, sessão, logger, estáticos
app.use(cookieParser());
app.use(logger("dev"));
app.use(session({
    secret: 'ok',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(express.static(path.join(__dirname, "public")));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Configuração Multer (upload)
const storage = multer.diskStorage({ 
  destination: (req, file, cb) => { 
    cb(null, 'public/uploads/'); 
  }, 
  filename: (req, file, cb) => { 
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9); 
    cb(null, uniqueSuffix + path.extname(file.originalname)); 
  } 
}); 
const upload = multer({ 
  storage: storage, 
  fileFilter: (req, file, cb) => { 
    const filetypes = /jpeg|jpg|png/; 
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase()); 
    const mimetype = filetypes.test(file.mimetype); 
    if (extname && mimetype) { 
      return cb(null, true); 
    } else { 
      cb(new Error('Apenas imagens JPG ou PNG são permitidas!')); 
    } 
  } 
}); 

// Rotas principais
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/cadastro", cadastroRouter);
app.use("/upload", uploadRouter);
app.use("/explorar", explorarRouter);
app.use("/categorias", categoriasRouter);
app.use("/perfil", perfilRouter);
app.use("/obras", obrasRouter);
app.use("/suporte", suporteRouter);

// --- Aqui a rota API para buscar dados do usuário ---

// Importar sua função de busca do usuário (ajuste o caminho conforme sua estrutura)
/*const { buscarDadosUsuario } = require('./models/usuarioModel'); 

app.post('/api/usuario', async (req, res) => {
  try {
    const usuario = req.body; // { email, senha }
    const dados = await buscarDadosUsuario(usuario);

    if (!dados) {
      return res.status(404).json({ erro: 'Usuário não encontrado' });
    }

    res.json(dados);

  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});*/

// 404 — deve vir após todas as rotas
app.use((req, res) => {
    res.status(404).send("<h1>404 - Página não encontrada</h1>");
});

// Tratamento de erros
app.use((err, req, res, next) => {
    res.locals.message = err.message;
    res.locals.error = req.app.get("env") === "development" ? err : {};
    res.status(err.status || 500);
    res.render("error");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;