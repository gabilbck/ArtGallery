const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
   res.send("Rota de usuários comum funcionando!");
});

router.get("/userCom", (req, res) => {
   if (global.userComEmail && global.userComEmail !== "") {
      return res.redirect("/userCom");
   }
   res.render("userCom", {
      title: "Página de Cadastro dos Usuários Comuns",
   });
});

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

router.get("/userCom/:id", async (req, res) => {
   const codigoUserCom = parseInt(req.params.id);

   try {
      const dadosPerfilUserCom = await global.banco.buscarPerfilUserCom(
         codigoUserCom
      );
      if (dadosPerfilUserCom) {
         global.perfil = dadosPerfilUserCom;
         await global.banco.registrarLoginPerfil(codigoUserCom);
      }
   } catch (error) {
      console.error("Erro ao registrar login:", error);
   }

   res.redirect("/index");
});

module.exports = router;
