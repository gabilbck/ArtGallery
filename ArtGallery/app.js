const createError = require("http-errors");
const express = require("express");
const multer = require('multer'); 
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");

const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
// const cadastroRouter = require("./routes/cadastro");
const uploadRouter = require('./routes/upload');
const explorarRouter = require("./routes/explorar");
const categoriasRouter = require("./routes/categorias");
const perfilRouter = require("./routes/perfil");
const obrasRouter = require("./routes/obras");
const suporteRouter = require("./routes/suporte");

const app = express();

app.set('view engine', 'ejs');



//rota do cadastro
const cadastroRouter = require("./routes/cadastro");
app.use("/cadastro", cadastroRouter);



app.use(session({
    secret: 'ok',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// Configuração do Multer para upload de arquivos 
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

// As rotas: “/” aponta para a página index e “/login” para autenticação
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use('/upload', uploadRouter);
app.use("/explorar", explorarRouter);
app.use("/categorias", categoriasRouter);
app.use("/perfil", perfilRouter);
app.use("/obras", obrasRouter);
app.use("/suporte", suporteRouter);

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

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});

app.get('/', async (req, res) => {
  try {
    const [categorias] = await conexao.promise().query('SELECT id_cat, nome_cat FROM categoria');
    res.render('index', { categorias });
  } catch (error) {
    console.error('Erro ao buscar categorias:', error);
    res.render('index', { categorias: [] }); // evita erro no template
  }
});

const registerRouter = require('./routes/register');
app.use('/register', registerRouter);


module.exports = app;