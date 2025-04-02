const express = require("express");
const router = express.Router();

// Rota inicial para usuários Comum
router.get("/loginUserCom", (req, res, next) => {
   if (global.userComEmail && global.userComEmail !== "") {
      return res.redirect("/userCom");
   }
   res.render("/cadastroUserCom", {
      title: "Página de Cadastro dos Usuários Comuns",
   });
});

//Login de usuario Comum
router.post("/loginUserCom", async (req, res) => {
   const { email, senha } = req.body;

   try {
      const usuario = await global.banco.buscarUserCom({ email, senha });
      if (usuario && usuario.userComCodigo) {
         global.userComCodigo = usuario.userComCodigo;
         global.userComEmail = usuario.userComEmail;
         return res.redirect("/userCom");
      }
   } catch (error) {
      console.error("Erro no login:", error);
   }
   res.redirect("/");
});

module.exports = router;

/*
// GET home page - Pagina inicial a acessar o site sem logar
router.get("/", function (req, res, next) {
   if (global.userComEmail && global.userComEmail != "") {
      res.redirect("/userCom");
   }
   // Caso o usuario esteja logado, redireciona para a pagina de usuarios comuns
   // Caso contrario, renderiza a pagina de cadastro
   res.render("/userCom", {
      title: "Pagina de Cadastro dos usuarios Comum",
   });
});

//Post - Login usuario comum
router.post("/login", async function (req, res, next) {
   const email = req.body.email;
   const senha = req.body.senha;

   try {
      // Verifica se o usuario existe
      const usuario = await global.banco.buscarUserCom({ email, senha });
      if (usuario && usuario.userComCodigo) {
         global.userComCodigo = usuario.userComCodigo;
         global.userComEmail = usuario.userComEmail;
         return res.redirect("/userCom");
      }
   } catch (error) {
      console.error("Erro no login:", error);
   }
   // Se o login falhar, redireciona para a página inicial
   res.redirect("/");
});

//Registra entrada do usuario comum
router.get("/userCom/:id", async function (req, res, next) {
   const codigoUserCom = parseInt(req.params.id);
   // Verifica se o codigo do usuario comum é valido
   try {
      const dadosPerfilUserCom = await global.banco.buscarPerfilUserCom(
         codigoUserCom
      );

      if (dadosPerfilUserCom) {
         global.perfil = dadosPerfilUserCom;

         // Registrar login no banco
         await global.banco.registrarLoginPerfil(codigoUserCom);
      }
   } catch (error) {
      console.error("Erro ao registrar login:", error);
   }

   res.redirect("/index");
});
*/
module.exports = router;
