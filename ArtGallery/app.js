const createError = require("http-errors");
const express = require("express");
const multer = require("multer");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");

const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
const cadastroRouter = require("./routes/cadastro");
const explorarRouter = require("./routes/explorar");
const categoriasRouter = require("./routes/categorias");
const perfilRouter = require("./routes/perfil");
const obrasRouter = require("./routes/obras");
const suporteRouter = require("./routes/suporte");
const colecaoRouter = require("./routes/colecao");

const admIndexRouter = require("./routes/_adm/_index");
const admObrasRouter = require("./routes/_adm/_obras");
const admUsuariosRouter = require("./routes/_adm/_usuarios");
const admSuporteRouter = require("./routes/_adm/_suporte");
const admCadastrarRouter = require("./routes/_adm/_cadastros");

const app = express();



app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');

app.use(session({
    secret: 'ok',
    resave: false,
    saveUninitialized: true,
    cookie: { 
      maxAge: 1000 * 60 * 60 * 24, // 1 dia
      secure: false 
    }
}));

// Middleware padrão para parse JSON e formulário
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const recuperarRouter = require('./routes/recuperar');
app.use('/', recuperarRouter);


// Middleware para cookies, sessão, logger, estáticos
app.use(cookieParser());
app.use(logger("dev"));
app.use(
   session({
      secret: "ok",
      resave: false,
      saveUninitialized: true,
      cookie: { secure: false }, // trocar para true em produção com HTTPS
   })
);
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
    res.locals.usuario = req.session.usuario || null;
    next();
});

// Configuração do Multer para upload de arquivos 
const storage = multer.diskStorage({ 
  destination: (req, file, cb) => { 
    cb(null, 'public/uploads/fotos-perfil'); 
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

// Rotas
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/cadastro", cadastroRouter);
app.use("/explorar", explorarRouter);
app.use("/categorias", categoriasRouter);
app.use("/perfil", perfilRouter);
app.use("/obras", obrasRouter);
app.use("/suporte", suporteRouter);
app.use("/colecao", colecaoRouter);

app.use("/adm", admIndexRouter);
app.use("/adm/obras", admObrasRouter);
app.use("/adm/usuarios", admUsuariosRouter);
app.use("/adm/suporte", admSuporteRouter);
app.use("/adm/cadastrar", admCadastrarRouter);

const conexao = require('./banco');
app.get('/', async (req, res) => {
  try {
    const [categorias] = await conexao.query('SELECT id_cat, nome_cat FROM categoria');
    res.render('index', { categorias });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.render('index', { categorias: [] });
  }
});

// 404
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

// Iniciando servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
   console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Implementação de loggers
const logger = require('./logger');

app.use((req, res, next) => {
  logger.info({ method: req.method, url: req.url });
  next();
});

module.exports = app ;