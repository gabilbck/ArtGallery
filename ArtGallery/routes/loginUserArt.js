const express = require("express");
const router = express.Router();

// Rota inicial para usuários artista
router.get("/loginUserArt", (req, res, next) => {
   if (global.userArtEmail && global.userArtEmail !== "") {
      return res.redirect("/userArt");
   }
   res.render("/cadastroUserArt", {
      title: "Página de Cadastro dos Usuários Artuns",
   });
});

//Login de usuario Artista
router.post("/loginUserArt", async (req, res) => {
   const { email, senha } = req.body;

   try {
      const usuario = await global.banco.buscarUserArt({ email, senha });
      if (usuario && usuario.userArtCodigo) {
         global.userArtCodigo = usuario.userArtCodigo;
         global.userArtEmail = usuario.userArtEmail;
         return res.redirect("/userArt");
      }
   } catch (error) {
      console.error("Erro no login:", error);
   }
   res.redirect("/");
});

/*
// GET home page - Pagina inicial a acessar o site sem logar
router.get("/", function (req, res, next) {
   if (global.userArtEmail && global.userArtEmail != "") {
      res.redirect("/userArt");
   }
   // Caso o usuario esteja logado, redireciona para a pagina de usuarios Artuns
   // Caso contrario, renderiza a pagina de cadastro
   res.render("/regisUserArt", {
      title: "Pagina de Cadastro dos usuarios Artum",
   });
});

//Post - Login usuario Artum
router.post("/loginUserArt", async function (req, res, next) {
   const email = req.body.email;
   const senha = req.body.senha;

   try {
      // Verifica se o usuario existe
      const usuario = await global.banco.buscarUserArt({ email, senha });
      if (usuario && usuario.userArtCodigo) {
         global.userArtCodigo = usuario.userArtCodigo;
         global.userArtEmail = usuario.userArtEmail;
         return res.redirect("/userArt");
      }
   } catch (error) {
      console.error("Erro no login:", error);
   }
   // Se o login falhar, redireciona para a página inicial
   res.redirect("/");
});

//Registra entrada do usuario Artum
router.get("/userArt/:id", async function (req, res, next) {
   const codigoUserArt = parseInt(req.params.id);
   // Verifica se o codigo do usuario Artum é valido
   try {
      const dadosPerfilUserArt = await global.banco.buscarPerfilUserArt(
         codigoUserArt
      );

      if (dadosPerfilUserArt) {
         global.perfil = dadosPerfilUserArt;

         // Registrar login no banco
         await global.banco.registrarLoginPerfil(codigoUserArt);
      }
   } catch (error) {
      console.error("Erro ao registrar login:", error);
   }

   res.redirect("/index");
});
*/
module.exports = router;
