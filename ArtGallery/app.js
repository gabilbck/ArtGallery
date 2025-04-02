const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");

const indexRouter = require("./routes/index"); //home page - Pagina inicial a acessar o site sem logar
const userComRouter = require("./routes/userCom"); //Users page - Pagina de utilizadores comum
const userArtRouter = require("./routes/userArt"); //Users page - Pagina de utilizadores artista
const adminRouter = require("./routes/admin"); //Admin page - Pagina de administrador
const cadastroUserComRouter = require("./routes/cadastroUserCom"); //register page user commom - Pagina de cadastro do usuario comum
const cadastroUserArtRouter = require("./routes/cadastroUserArt"); //register page user artist- Pagina de cadastro do usuario artista
const loginUserComRouter = require("./routes/loginUserCom"); //Login page user common - Pagina de login do usuario comum
const loginUserArtRouter = require("./routes/loginUserArt"); //Login page user artist - Pagina de login do usuario artista

const app = express();

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter); //home page - Pagina inicial a acessar o site sem logar
app.use("/userCom", userComRouter); //Users page - Pagina de utilizadores comum
app.use("/userArt", userArtRouter);
app.use("/admin", adminRouter); //Admin page - Pagina de administrador
app.use("/cadastroUserCom", cadastroUserComRouter); //register page user commom - Pagina de cadastro do usuario comum
app.use("/cadastroUserArt", cadastroUserArtRouter); //register page user artist- Pagina de cadastro do usuario artista
app.use("/loginUserCom", loginUserComRouter); //Login page user common - Pagina de login do usuario comum
app.use("/loginUserArt", loginUserArtRouter); //Login page user artist - Pagina de login do usuario artista

// catch 404 and forward to error handler
app.use(function (req, res, next) {
   next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
   // set locals, only providing error in development
   res.locals.message = err.message;
   res.locals.error = req.app.get("env") === "development" ? err : {};

   // render the error page
   res.status(err.status || 500);
   res.render("error");
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
   console.log(`Servidor rodando em http://localhost:${PORT}`);
});

module.exports = app;
