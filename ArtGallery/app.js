const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index");
const loginRouter = require("./routes/login"); // Login
const userComRouter = require("./routes/userCom");
const userArtRouter = require("./routes/userArt");
const adminRouter = require("./routes/admin");
// const cadastroUserComRouter = require("./routes/cadastroUserCom");
// const cadastroUserArtRouter = require("./routes/cadastroUserArt");
// const loginUserComRouter = require("./routes/loginUserCom");
// const loginUserArtRouter = require("./routes/loginUserArt");

const app = express();

const session = require('express-session');

app.use(session({
   secret: 'ok', 
   resave: false,
   saveUninitialized: true,
   cookie: { secure: false } // Altere para true se usar HTTPS
}));

// Configuração do EJS
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

// Middlewares básicos
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

// Definição de rotas
app.use("/", indexRouter);
app.use("/userCom", userComRouter);
app.use("/userArt", userArtRouter);
app.use("/admin", adminRouter);
// app.use("/cadastroUserCom", cadastroUserComRouter);
// app.use("/cadastroUserArt", cadastroUserArtRouter);
// app.use("/loginUserCom", loginUserComRouter);
// app.use("/loginUserArt", loginUserArtRouter);

// Middleware para erros 404
app.use((req, res) => {
   res.status(404).send("<h1>404 - Página não encontrada</h1>");
});

// Middleware para tratamento de erros
app.use((err, req, res, next) => {
   res.locals.message = err.message;
   res.locals.error = req.app.get("env") === "development" ? err : {};
   res.status(err.status || 500);
   res.render("error");
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
   console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;