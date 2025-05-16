const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const session = require("express-session");

const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login");
// const cadastroRouter = require("./routes/cadastro");
// const 
const imagemRouter = require("./routes/imagem");

const app = express();

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

// As rotas: “/” aponta para a página index e “/login” para autenticação
app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/imagem", imagemRouter);

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


module.exports = app;